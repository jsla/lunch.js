/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { CssSelector, SelectorMatcher, createElementCssSelector } from '@angular/compiler';
import { Compiler, Injector, NgModule, NgZone, Testability } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import * as angular from './angular_js';
import { NG1_COMPILE, NG1_INJECTOR, NG1_PARSE, NG1_ROOT_SCOPE, NG1_TESTABILITY, NG2_COMPILER, NG2_COMPONENT_FACTORY_REF_MAP, NG2_INJECTOR, NG2_ZONE, REQUIRE_INJECTOR } from './constants';
import { DowngradeNg2ComponentAdapter } from './downgrade_ng2_adapter';
import { getComponentInfo } from './metadata';
import { UpgradeNg1ComponentAdapterBuilder } from './upgrade_ng1_adapter';
import { Deferred, controllerKey, getAttributesAsArray, onError } from './util';
var /** @type {?} */ upgradeCount = 0;
/**
 * Use `UpgradeAdapter` to allow Angular 1 and Angular 2+ to coexist in a single application.
 *
 * The `UpgradeAdapter` allows:
 * 1. creation of Angular 2+ component from Angular 1 component directive
 *    (See [UpgradeAdapter#upgradeNg1Component()])
 * 2. creation of Angular 1 directive from Angular 2+ component.
 *    (See [UpgradeAdapter#downgradeNg2Component()])
 * 3. Bootstrapping of a hybrid Angular application which contains both of the frameworks
 *    coexisting in a single application.
 *
 * ## Mental Model
 *
 * When reasoning about how a hybrid application works it is useful to have a mental model which
 * describes what is happening and explains what is happening at the lowest level.
 *
 * 1. There are two independent frameworks running in a single application, each framework treats
 *    the other as a black box.
 * 2. Each DOM element on the page is owned exactly by one framework. Whichever framework
 *    instantiated the element is the owner. Each framework only updates/interacts with its own
 *    DOM elements and ignores others.
 * 3. Angular 1 directives always execute inside Angular 1 framework codebase regardless of
 *    where they are instantiated.
 * 4. Angular 2+ components always execute inside Angular 2+ framework codebase regardless of
 *    where they are instantiated.
 * 5. An Angular 1 component can be upgraded to an Angular 2+ component. This creates an
 *    Angular 2+ directive, which bootstraps the Angular 1 component directive in that location.
 * 6. An Angular 2+ component can be downgraded to an Angular 1 component directive. This creates
 *    an Angular 1 directive, which bootstraps the Angular 2+ component in that location.
 * 7. Whenever an adapter component is instantiated the host element is owned by the framework
 *    doing the instantiation. The other framework then instantiates and owns the view for that
 *    component. This implies that component bindings will always follow the semantics of the
 *    instantiation framework. The syntax is always that of Angular 2+ syntax.
 * 8. Angular 1 is always bootstrapped first and owns the bottom most view.
 * 9. The new application is running in Angular 2+ zone, and therefore it no longer needs calls to
 *    `$apply()`.
 *
 * ### Example
 *
 * ```
 * const adapter = new UpgradeAdapter(forwardRef(() => MyNg2Module), myCompilerOptions);
 * const module = angular.module('myExample', []);
 * module.directive('ng2Comp', adapter.downgradeNg2Component(Ng2Component));
 *
 * module.directive('ng1Hello', function() {
 *   return {
 *      scope: { title: '=' },
 *      template: 'ng1[Hello {{title}}!](<span ng-transclude></span>)'
 *   };
 * });
 *
 *
 * \@Component({
 *   selector: 'ng2-comp',
 *   inputs: ['name'],
 *   template: 'ng2[<ng1-hello [title]="name">transclude</ng1-hello>](<ng-content></ng-content>)',
 *   directives:
 * })
 * class Ng2Component {
 * }
 *
 * \@NgModule({
 *   declarations: [Ng2Component, adapter.upgradeNg1Component('ng1Hello')],
 *   imports: [BrowserModule]
 * })
 * class MyNg2Module {}
 *
 *
 * document.body.innerHTML = '<ng2-comp name="World">project</ng2-comp>';
 *
 * adapter.bootstrap(document.body, ['myExample']).ready(function() {
 *   expect(document.body.textContent).toEqual(
 *       "ng2[ng1[Hello World!](transclude)](project)");
 * });
 *
 * ```
 *
 * \@stable
 */
export var UpgradeAdapter = (function () {
    /**
     * @param {?} ng2AppModule
     * @param {?=} compilerOptions
     */
    function UpgradeAdapter(ng2AppModule, compilerOptions) {
        this.ng2AppModule = ng2AppModule;
        this.compilerOptions = compilerOptions;
        this.idPrefix = "NG2_UPGRADE_" + upgradeCount++ + "_";
        this.upgradedComponents = [];
        this.ng1ComponentsToBeUpgraded = {};
        this.providers = [];
        this.moduleRef = null;
        if (!ng2AppModule) {
            throw new Error('UpgradeAdapter cannot be instantiated without an NgModule of the Angular 2 app.');
        }
    }
    /**
     * Allows Angular 2+ Component to be used from Angular 1.
     *
     * Use `downgradeNg2Component` to create an Angular 1 Directive Definition Factory from
     * Angular 2+ Component. The adapter will bootstrap Angular 2+ component from within the
     * Angular 1 template.
     *
     * ## Mental Model
     *
     * 1. The component is instantiated by being listed in Angular 1 template. This means that the
     *    host element is controlled by Angular 1, but the component's view will be controlled by
     *    Angular 2+.
     * 2. Even thought the component is instantiated in Angular 1, it will be using Angular 2+
     *    syntax. This has to be done, this way because we must follow Angular 2+ components do not
     *    declare how the attributes should be interpreted.
     *
     * ## Supported Features
     *
     * - Bindings:
     *   - Attribute: `<comp name="World">`
     *   - Interpolation:  `<comp greeting="Hello {{name}}!">`
     *   - Expression:  `<comp [name]="username">`
     *   - Event:  `<comp (close)="doSomething()">`
     * - Content projection: yes
     *
     * ### Example
     *
     * ```
     * const adapter = new UpgradeAdapter(forwardRef(() => MyNg2Module));
     * const module = angular.module('myExample', []);
     * module.directive('greet', adapter.downgradeNg2Component(Greeter));
     *
     * \@Component({
     *   selector: 'greet',
     *   template: '{{salutation}} {{name}}! - <ng-content></ng-content>'
     * })
     * class Greeter {
     *   \@Input() salutation: string;
     *   \@Input() name: string;
     * }
     *
     * \@NgModule({
     *   declarations: [Greeter],
     *   imports: [BrowserModule]
     * })
     * class MyNg2Module {}
     *
     * document.body.innerHTML =
     *   'ng1 template: <greet salutation="Hello" [name]="world">text</greet>';
     *
     * adapter.bootstrap(document.body, ['myExample']).ready(function() {
     *   expect(document.body.textContent).toEqual("ng1 template: Hello world! - text");
     * });
     * ```
     * @param {?} type
     * @return {?}
     */
    UpgradeAdapter.prototype.downgradeNg2Component = function (type) {
        this.upgradedComponents.push(type);
        var /** @type {?} */ info = getComponentInfo(type);
        return ng1ComponentDirective(info, "" + this.idPrefix + info.selector + "_c");
    };
    /**
     * Allows Angular 1 Component to be used from Angular 2+.
     *
     * Use `upgradeNg1Component` to create an Angular 2+ component from Angular 1 Component
     * directive. The adapter will bootstrap Angular 1 component from within the Angular 2+
     * template.
     *
     * ## Mental Model
     *
     * 1. The component is instantiated by being listed in Angular 2+ template. This means that the
     *    host element is controlled by Angular 2+, but the component's view will be controlled by
     *    Angular 1.
     *
     * ## Supported Features
     *
     * - Bindings:
     *   - Attribute: `<comp name="World">`
     *   - Interpolation:  `<comp greeting="Hello {{name}}!">`
     *   - Expression:  `<comp [name]="username">`
     *   - Event:  `<comp (close)="doSomething()">`
     * - Transclusion: yes
     * - Only some of the features of
     *   [Directive Definition Object](https://docs.angularjs.org/api/ng/service/$compile) are
     *   supported:
     *   - `compile`: not supported because the host element is owned by Angular 2+, which does
     *     not allow modifying DOM structure during compilation.
     *   - `controller`: supported. (NOTE: injection of `$attrs` and `$transclude` is not supported.)
     *   - `controllerAs`: supported.
     *   - `bindToController`: supported.
     *   - `link`: supported. (NOTE: only pre-link function is supported.)
     *   - `name`: supported.
     *   - `priority`: ignored.
     *   - `replace`: not supported.
     *   - `require`: supported.
     *   - `restrict`: must be set to 'E'.
     *   - `scope`: supported.
     *   - `template`: supported.
     *   - `templateUrl`: supported.
     *   - `terminal`: ignored.
     *   - `transclude`: supported.
     *
     *
     * ### Example
     *
     * ```
     * const adapter = new UpgradeAdapter(forwardRef(() => MyNg2Module));
     * const module = angular.module('myExample', []);
     *
     * module.directive('greet', function() {
     *   return {
     *     scope: {salutation: '=', name: '=' },
     *     template: '{{salutation}} {{name}}! - <span ng-transclude></span>'
     *   };
     * });
     *
     * module.directive('ng2', adapter.downgradeNg2Component(Ng2Component));
     *
     * \@Component({
     *   selector: 'ng2',
     *   template: 'ng2 template: <greet salutation="Hello" [name]="world">text</greet>'
     * })
     * class Ng2Component {
     * }
     *
     * \@NgModule({
     *   declarations: [Ng2Component, adapter.upgradeNg1Component('greet')],
     *   imports: [BrowserModule]
     * })
     * class MyNg2Module {}
     *
     * document.body.innerHTML = '<ng2></ng2>';
     *
     * adapter.bootstrap(document.body, ['myExample']).ready(function() {
     *   expect(document.body.textContent).toEqual("ng2 template: Hello world! - text");
     * });
     * ```
     * @param {?} name
     * @return {?}
     */
    UpgradeAdapter.prototype.upgradeNg1Component = function (name) {
        if (((this.ng1ComponentsToBeUpgraded)).hasOwnProperty(name)) {
            return this.ng1ComponentsToBeUpgraded[name].type;
        }
        else {
            return (this.ng1ComponentsToBeUpgraded[name] = new UpgradeNg1ComponentAdapterBuilder(name))
                .type;
        }
    };
    /**
     * Registers the adapter's Angular 1 upgrade module for unit testing in Angular 1.
     * Use this instead of `angular.mock.module()` to load the upgrade module into
     * the Angular 1 testing injector.
     *
     * ### Example
     *
     * ```
     * const upgradeAdapter = new UpgradeAdapter(MyNg2Module);
     *
     * // configure the adapter with upgrade/downgrade components and services
     * upgradeAdapter.downgradeNg2Component(MyComponent);
     *
     * let upgradeAdapterRef: UpgradeAdapterRef;
     * let $compile, $rootScope;
     *
     * // We must register the adapter before any calls to `inject()`
     * beforeEach(() => {
     *   upgradeAdapterRef = upgradeAdapter.registerForNg1Tests(['heroApp']);
     * });
     *
     * beforeEach(inject((_$compile_, _$rootScope_) => {
     *   $compile = _$compile_;
     *   $rootScope = _$rootScope_;
     * }));
     *
     * it("says hello", (done) => {
     *   upgradeAdapterRef.ready(() => {
     *     const element = $compile("<my-component></my-component>")($rootScope);
     *     $rootScope.$apply();
     *     expect(element.html()).toContain("Hello World");
     *     done();
     *   })
     * });
     *
     * ```
     *
     * @param {?=} modules any Angular 1 modules that the upgrade module should depend upon
     * @return {?} an {\@link UpgradeAdapterRef}, which lets you register a `ready()` callback to
     * run assertions once the Angular 2+ components are ready to test through Angular 1.
     */
    UpgradeAdapter.prototype.registerForNg1Tests = function (modules) {
        var _this = this;
        var /** @type {?} */ windowNgMock = ((window))['angular'].mock;
        if (!windowNgMock || !windowNgMock.module) {
            throw new Error('Failed to find \'angular.mock.module\'.');
        }
        this.declareNg1Module(modules);
        windowNgMock.module(this.ng1Module.name);
        var /** @type {?} */ upgrade = new UpgradeAdapterRef();
        this.ng2BootstrapDeferred.promise.then(function (ng1Injector) { ((upgrade))._bootstrapDone(_this.moduleRef, ng1Injector); }, onError);
        return upgrade;
    };
    /**
     * Bootstrap a hybrid Angular 1 / Angular 2+ application.
     *
     * This `bootstrap` method is a direct replacement (takes same arguments) for Angular 1
     * [`bootstrap`](https://docs.angularjs.org/api/ng/function/angular.bootstrap) method. Unlike
     * Angular 1, this bootstrap is asynchronous.
     *
     * ### Example
     *
     * ```
     * const adapter = new UpgradeAdapter(MyNg2Module);
     * const module = angular.module('myExample', []);
     * module.directive('ng2', adapter.downgradeNg2Component(Ng2));
     *
     * module.directive('ng1', function() {
     *   return {
     *      scope: { title: '=' },
     *      template: 'ng1[Hello {{title}}!](<span ng-transclude></span>)'
     *   };
     * });
     *
     *
     * \@Component({
     *   selector: 'ng2',
     *   inputs: ['name'],
     *   template: 'ng2[<ng1 [title]="name">transclude</ng1>](<ng-content></ng-content>)'
     * })
     * class Ng2 {
     * }
     *
     * \@NgModule({
     *   declarations: [Ng2, adapter.upgradeNg1Component('ng1')],
     *   imports: [BrowserModule]
     * })
     * class MyNg2Module {}
     *
     * document.body.innerHTML = '<ng2 name="World">project</ng2>';
     *
     * adapter.bootstrap(document.body, ['myExample']).ready(function() {
     *   expect(document.body.textContent).toEqual(
     *       "ng2[ng1[Hello World!](transclude)](project)");
     * });
     * ```
     * @param {?} element
     * @param {?=} modules
     * @param {?=} config
     * @return {?}
     */
    UpgradeAdapter.prototype.bootstrap = function (element, modules, config) {
        var _this = this;
        this.declareNg1Module(modules);
        var /** @type {?} */ upgrade = new UpgradeAdapterRef();
        // Make sure resumeBootstrap() only exists if the current bootstrap is deferred
        var /** @type {?} */ windowAngular = ((window) /** TODO #???? */)['angular'];
        windowAngular.resumeBootstrap = undefined;
        this.ngZone.run(function () { angular.bootstrap(element, [_this.ng1Module.name], config); });
        var /** @type {?} */ ng1BootstrapPromise = new Promise(function (resolve) {
            if (windowAngular.resumeBootstrap) {
                var /** @type {?} */ originalResumeBootstrap_1 = windowAngular.resumeBootstrap;
                windowAngular.resumeBootstrap = function () {
                    windowAngular.resumeBootstrap = originalResumeBootstrap_1;
                    windowAngular.resumeBootstrap.apply(this, arguments);
                    resolve();
                };
            }
            else {
                resolve();
            }
        });
        Promise.all([this.ng2BootstrapDeferred.promise, ng1BootstrapPromise]).then(function (_a) {
            var ng1Injector = _a[0];
            angular.element(element).data(controllerKey(NG2_INJECTOR), _this.moduleRef.injector);
            _this.moduleRef.injector.get(NgZone).run(function () { ((upgrade))._bootstrapDone(_this.moduleRef, ng1Injector); });
        }, onError);
        return upgrade;
    };
    /**
     * Allows Angular 1 service to be accessible from Angular 2+.
     *
     *
     * ### Example
     *
     * ```
     * class Login { ... }
     * class Server { ... }
     *
     * \@Injectable()
     * class Example {
     *   constructor(\@Inject('server') server, login: Login) {
     *     ...
     *   }
     * }
     *
     * const module = angular.module('myExample', []);
     * module.service('server', Server);
     * module.service('login', Login);
     *
     * const adapter = new UpgradeAdapter(MyNg2Module);
     * adapter.upgradeNg1Provider('server');
     * adapter.upgradeNg1Provider('login', {asToken: Login});
     *
     * adapter.bootstrap(document.body, ['myExample']).ready((ref) => {
     *   const example: Example = ref.ng2Injector.get(Example);
     * });
     *
     * ```
     * @param {?} name
     * @param {?=} options
     * @return {?}
     */
    UpgradeAdapter.prototype.upgradeNg1Provider = function (name, options) {
        var /** @type {?} */ token = options && options.asToken || name;
        this.providers.push({
            provide: token,
            useFactory: function (ng1Injector) { return ng1Injector.get(name); },
            deps: [NG1_INJECTOR]
        });
    };
    /**
     * Allows Angular 2+ service to be accessible from Angular 1.
     *
     *
     * ### Example
     *
     * ```
     * class Example {
     * }
     *
     * const adapter = new UpgradeAdapter(MyNg2Module);
     *
     * const module = angular.module('myExample', []);
     * module.factory('example', adapter.downgradeNg2Provider(Example));
     *
     * adapter.bootstrap(document.body, ['myExample']).ready((ref) => {
     *   const example: Example = ref.ng1Injector.get('example');
     * });
     *
     * ```
     * @param {?} token
     * @return {?}
     */
    UpgradeAdapter.prototype.downgradeNg2Provider = function (token) {
        var /** @type {?} */ factory = function (injector) { return injector.get(token); };
        ((factory)).$inject = [NG2_INJECTOR];
        return factory;
    };
    /**
     * Declare the Angular 1 upgrade module for this adapter without bootstrapping the whole
     * hybrid application.
     *
     * This method is automatically called by `bootstrap()` and `registerForNg1Tests()`.
     *
     * @param {?=} modules The Angular 1 modules that this upgrade module should depend upon.
     * @return {?} The Angular 1 upgrade module that is declared by this method
     *
     * ### Example
     *
     * ```
     * const upgradeAdapter = new UpgradeAdapter(MyNg2Module);
     * upgradeAdapter.declareNg1Module(['heroApp']);
     * ```
     */
    UpgradeAdapter.prototype.declareNg1Module = function (modules) {
        var _this = this;
        if (modules === void 0) { modules = []; }
        var /** @type {?} */ delayApplyExps = [];
        var /** @type {?} */ original$applyFn;
        var /** @type {?} */ rootScopePrototype;
        var /** @type {?} */ rootScope;
        var /** @type {?} */ componentFactoryRefMap = {};
        var /** @type {?} */ upgradeAdapter = this;
        var /** @type {?} */ ng1Module = this.ng1Module = angular.module(this.idPrefix, modules);
        var /** @type {?} */ platformRef = platformBrowserDynamic();
        this.ngZone = new NgZone({ enableLongStackTrace: Zone.hasOwnProperty('longStackTraceZoneSpec') });
        this.ng2BootstrapDeferred = new Deferred();
        ng1Module.factory(NG2_INJECTOR, function () { return _this.moduleRef.injector.get(Injector); })
            .constant(NG2_ZONE, this.ngZone)
            .constant(NG2_COMPONENT_FACTORY_REF_MAP, componentFactoryRefMap)
            .factory(NG2_COMPILER, function () { return _this.moduleRef.injector.get(Compiler); })
            .config([
            '$provide', '$injector',
            function (provide, ng1Injector) {
                provide.decorator(NG1_ROOT_SCOPE, [
                    '$delegate',
                    function (rootScopeDelegate) {
                        // Capture the root apply so that we can delay first call to $apply until we
                        // bootstrap Angular 2 and then we replay and restore the $apply.
                        rootScopePrototype = rootScopeDelegate.constructor.prototype;
                        if (rootScopePrototype.hasOwnProperty('$apply')) {
                            original$applyFn = rootScopePrototype.$apply;
                            rootScopePrototype.$apply = function (exp) { return delayApplyExps.push(exp); };
                        }
                        else {
                            throw new Error('Failed to find \'$apply\' on \'$rootScope\'!');
                        }
                        return rootScope = rootScopeDelegate;
                    }
                ]);
                if (ng1Injector.has(NG1_TESTABILITY)) {
                    provide.decorator(NG1_TESTABILITY, [
                        '$delegate',
                        function (testabilityDelegate) {
                            var /** @type {?} */ originalWhenStable = testabilityDelegate.whenStable;
                            // Cannot use arrow function below because we need the context
                            var /** @type {?} */ newWhenStable = function (callback) {
                                originalWhenStable.call(this, function () {
                                    var /** @type {?} */ ng2Testability = upgradeAdapter.moduleRef.injector.get(Testability);
                                    if (ng2Testability.isStable()) {
                                        callback.apply(this, arguments);
                                    }
                                    else {
                                        ng2Testability.whenStable(newWhenStable.bind(this, callback));
                                    }
                                });
                            };
                            testabilityDelegate.whenStable = newWhenStable;
                            return testabilityDelegate;
                        }
                    ]);
                }
            }
        ]);
        ng1Module.run([
            '$injector', '$rootScope',
            function (ng1Injector, rootScope) {
                UpgradeNg1ComponentAdapterBuilder.resolve(_this.ng1ComponentsToBeUpgraded, ng1Injector)
                    .then(function () {
                    // At this point we have ng1 injector and we have lifted ng1 components into ng2, we
                    // now can bootstrap ng2.
                    var /** @type {?} */ DynamicNgUpgradeModule = NgModule({
                        providers: [
                            { provide: NG1_INJECTOR, useFactory: function () { return ng1Injector; } },
                            { provide: NG1_COMPILE, useFactory: function () { return ng1Injector.get(NG1_COMPILE); } },
                            _this.providers
                        ],
                        imports: [_this.ng2AppModule]
                    }).Class({
                        constructor: function DynamicNgUpgradeModule() { },
                        ngDoBootstrap: function () { }
                    });
                    ((platformRef))
                        ._bootstrapModuleWithZone(DynamicNgUpgradeModule, _this.compilerOptions, _this.ngZone, function (componentFactories) {
                        componentFactories.forEach(function (componentFactory) {
                            var /** @type {?} */ type = componentFactory.componentType;
                            if (_this.upgradedComponents.indexOf(type) !== -1) {
                                componentFactoryRefMap[getComponentInfo(type).selector] =
                                    componentFactory;
                            }
                        });
                    })
                        .then(function (ref) {
                        _this.moduleRef = ref;
                        _this.ngZone.run(function () {
                            if (rootScopePrototype) {
                                rootScopePrototype.$apply = original$applyFn; // restore original $apply
                                while (delayApplyExps.length) {
                                    rootScope.$apply(delayApplyExps.shift());
                                }
                                rootScopePrototype = null;
                            }
                        });
                    })
                        .then(function () { return _this.ng2BootstrapDeferred.resolve(ng1Injector); }, onError)
                        .then(function () {
                        var /** @type {?} */ subscription = _this.ngZone.onMicrotaskEmpty.subscribe({ next: function () { return rootScope.$digest(); } });
                        rootScope.$on('$destroy', function () { subscription.unsubscribe(); });
                    });
                })
                    .catch(function (e) { return _this.ng2BootstrapDeferred.reject(e); });
            }
        ]);
        return ng1Module;
    };
    return UpgradeAdapter;
}());
function UpgradeAdapter_tsickle_Closure_declarations() {
    /** @type {?} */
    UpgradeAdapter.prototype.idPrefix;
    /** @type {?} */
    UpgradeAdapter.prototype.upgradedComponents;
    /**
     * An internal map of ng1 components which need to up upgraded to ng2.
     *
     * We can't upgrade until injector is instantiated and we can retrieve the component metadata.
     * For this reason we keep a list of components to upgrade until ng1 injector is bootstrapped.
     *
     * \@internal
     * @type {?}
     */
    UpgradeAdapter.prototype.ng1ComponentsToBeUpgraded;
    /** @type {?} */
    UpgradeAdapter.prototype.providers;
    /** @type {?} */
    UpgradeAdapter.prototype.ngZone;
    /** @type {?} */
    UpgradeAdapter.prototype.ng1Module;
    /** @type {?} */
    UpgradeAdapter.prototype.moduleRef;
    /** @type {?} */
    UpgradeAdapter.prototype.ng2BootstrapDeferred;
    /** @type {?} */
    UpgradeAdapter.prototype.ng2AppModule;
    /** @type {?} */
    UpgradeAdapter.prototype.compilerOptions;
}
/**
 * Synchronous promise-like object to wrap parent injectors,
 * to preserve the synchronous nature of Angular 1's $compile.
 */
var ParentInjectorPromise = (function () {
    /**
     * @param {?} element
     */
    function ParentInjectorPromise(element) {
        this.element = element;
        this.callbacks = [];
        // store the promise on the element
        element.data(controllerKey(NG2_INJECTOR), this);
    }
    /**
     * @param {?} callback
     * @return {?}
     */
    ParentInjectorPromise.prototype.then = function (callback) {
        if (this.injector) {
            callback(this.injector);
        }
        else {
            this.callbacks.push(callback);
        }
    };
    /**
     * @param {?} injector
     * @return {?}
     */
    ParentInjectorPromise.prototype.resolve = function (injector) {
        this.injector = injector;
        // reset the element data to point to the real injector
        this.element.data(controllerKey(NG2_INJECTOR), injector);
        // clean out the element to prevent memory leaks
        this.element = null;
        // run all the queued callbacks
        this.callbacks.forEach(function (callback) { return callback(injector); });
        this.callbacks.length = 0;
    };
    return ParentInjectorPromise;
}());
function ParentInjectorPromise_tsickle_Closure_declarations() {
    /** @type {?} */
    ParentInjectorPromise.prototype.injector;
    /** @type {?} */
    ParentInjectorPromise.prototype.callbacks;
    /** @type {?} */
    ParentInjectorPromise.prototype.element;
}
/**
 * @param {?} info
 * @param {?} idPrefix
 * @return {?}
 */
function ng1ComponentDirective(info, idPrefix) {
    ((directiveFactory)).$inject =
        [NG1_INJECTOR, NG1_COMPILE, NG2_COMPONENT_FACTORY_REF_MAP, NG1_PARSE];
    /**
     * @param {?} ng1Injector
     * @param {?} ng1Compile
     * @param {?} componentFactoryRefMap
     * @param {?} parse
     * @return {?}
     */
    function directiveFactory(ng1Injector, ng1Compile, componentFactoryRefMap, parse) {
        var /** @type {?} */ idCount = 0;
        var /** @type {?} */ dashSelector = info.selector.replace(/[A-Z]/g, function (char) { return '-' + char.toLowerCase(); });
        return {
            restrict: 'E',
            terminal: true,
            require: REQUIRE_INJECTOR,
            link: function (scope, element, attrs, parentInjector) {
                // We might have compile the contents lazily, because this might have been triggered by the
                // UpgradeNg1ComponentAdapterBuilder, when the ng2 templates have not been compiled yet
                var /** @type {?} */ id = idPrefix + (idCount++);
                ((element[0])).id = id;
                var /** @type {?} */ injectorPromise = new ParentInjectorPromise(element);
                var /** @type {?} */ ng2Compiler = (ng1Injector.get(NG2_COMPILER));
                var /** @type {?} */ ngContentSelectors = ng2Compiler.getNgContentSelectors(info.type);
                var /** @type {?} */ linkFns = compileProjectedNodes(element, ngContentSelectors);
                var /** @type {?} */ componentFactory = componentFactoryRefMap[info.selector];
                if (!componentFactory)
                    throw new Error('Expecting ComponentFactory for: ' + info.selector);
                element.empty();
                var /** @type {?} */ projectableNodes = linkFns.map(function (link) {
                    var /** @type {?} */ projectedClone;
                    link(scope, function (clone) {
                        projectedClone = clone;
                        element.append(clone);
                    });
                    return projectedClone;
                });
                parentInjector = parentInjector || ng1Injector.get(NG2_INJECTOR);
                if (parentInjector instanceof ParentInjectorPromise) {
                    parentInjector.then(function (resolvedInjector) { return downgrade(resolvedInjector); });
                }
                else {
                    downgrade(parentInjector);
                }
                /**
                 * @param {?} injector
                 * @return {?}
                 */
                function downgrade(injector) {
                    var /** @type {?} */ facade = new DowngradeNg2ComponentAdapter(info, element, attrs, scope, injector, parse, componentFactory);
                    facade.setupInputs();
                    facade.bootstrapNg2(projectableNodes);
                    facade.setupOutputs();
                    facade.registerCleanup();
                    injectorPromise.resolve(facade.componentRef.injector);
                }
            }
        };
        /**
         * @param {?} element
         * @param {?} ngContentSelectors
         * @return {?}
         */
        function compileProjectedNodes(element, ngContentSelectors) {
            if (!ngContentSelectors)
                throw new Error('Expecting ngContentSelectors for: ' + info.selector);
            // We have to sort the projected content before we compile it, hence the terminal: true
            var /** @type {?} */ projectableTemplateNodes = sortProjectableNodes(ngContentSelectors, element.contents());
            return projectableTemplateNodes.map(function (nodes) { return ng1Compile(nodes); });
        }
    }
    return directiveFactory;
}
/**
 * Use `UpgradeAdapterRef` to control a hybrid Angular 1 / Angular 2+ application.
 *
 * \@stable
 */
export var UpgradeAdapterRef = (function () {
    function UpgradeAdapterRef() {
        this._readyFn = null;
        this.ng1RootScope = null;
        this.ng1Injector = null;
        this.ng2ModuleRef = null;
        this.ng2Injector = null;
    }
    /**
     * @param {?} ngModuleRef
     * @param {?} ng1Injector
     * @return {?}
     */
    UpgradeAdapterRef.prototype._bootstrapDone = function (ngModuleRef, ng1Injector) {
        this.ng2ModuleRef = ngModuleRef;
        this.ng2Injector = ngModuleRef.injector;
        this.ng1Injector = ng1Injector;
        this.ng1RootScope = ng1Injector.get(NG1_ROOT_SCOPE);
        this._readyFn && this._readyFn(this);
    };
    /**
     * Register a callback function which is notified upon successful hybrid Angular 1 / Angular 2+
     * application has been bootstrapped.
     *
     * The `ready` callback function is invoked inside the Angular 2+ zone, therefore it does not
     * require a call to `$apply()`.
     * @param {?} fn
     * @return {?}
     */
    UpgradeAdapterRef.prototype.ready = function (fn) { this._readyFn = fn; };
    /**
     * Dispose of running hybrid Angular 1 / Angular 2+ application.
     * @return {?}
     */
    UpgradeAdapterRef.prototype.dispose = function () {
        this.ng1Injector.get(NG1_ROOT_SCOPE).$destroy();
        this.ng2ModuleRef.destroy();
    };
    return UpgradeAdapterRef;
}());
function UpgradeAdapterRef_tsickle_Closure_declarations() {
    /** @type {?} */
    UpgradeAdapterRef.prototype._readyFn;
    /** @type {?} */
    UpgradeAdapterRef.prototype.ng1RootScope;
    /** @type {?} */
    UpgradeAdapterRef.prototype.ng1Injector;
    /** @type {?} */
    UpgradeAdapterRef.prototype.ng2ModuleRef;
    /** @type {?} */
    UpgradeAdapterRef.prototype.ng2Injector;
}
/**
 * Sort a set of DOM nodes that into groups based on the given content selectors
 * @param {?} ngContentSelectors
 * @param {?} childNodes
 * @return {?}
 */
export function sortProjectableNodes(ngContentSelectors, childNodes) {
    var /** @type {?} */ projectableNodes = [];
    var /** @type {?} */ matcher = new SelectorMatcher();
    var /** @type {?} */ wildcardNgContentIndex;
    for (var /** @type {?} */ i = 0, /** @type {?} */ ii = ngContentSelectors.length; i < ii; i++) {
        projectableNodes[i] = [];
        if (ngContentSelectors[i] === '*') {
            wildcardNgContentIndex = i;
        }
        else {
            matcher.addSelectables(CssSelector.parse(ngContentSelectors[i]), i);
        }
    }
    var _loop_1 = function(node) {
        var /** @type {?} */ ngContentIndices = [];
        var /** @type {?} */ selector = createElementCssSelector(node.nodeName.toLowerCase(), getAttributesAsArray(node));
        matcher.match(selector, function (selector, ngContentIndex) { ngContentIndices.push(ngContentIndex); });
        ngContentIndices.sort();
        if (wildcardNgContentIndex !== undefined) {
            ngContentIndices.push(wildcardNgContentIndex);
        }
        if (ngContentIndices.length > 0) {
            projectableNodes[ngContentIndices[0]].push(node);
        }
    };
    for (var _i = 0, childNodes_1 = childNodes; _i < childNodes_1.length; _i++) {
        var node = childNodes_1[_i];
        _loop_1(node);
    }
    return projectableNodes;
}
//# sourceMappingURL=upgrade_adapter.js.map