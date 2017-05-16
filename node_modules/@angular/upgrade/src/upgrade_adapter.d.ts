import { CompilerOptions, Injector, NgModuleRef, Type } from '@angular/core';
import * as angular from './angular_js';
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
 * @Component({
 *   selector: 'ng2-comp',
 *   inputs: ['name'],
 *   template: 'ng2[<ng1-hello [title]="name">transclude</ng1-hello>](<ng-content></ng-content>)',
 *   directives:
 * })
 * class Ng2Component {
 * }
 *
 * @NgModule({
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
 * @stable
 */
export declare class UpgradeAdapter {
    private ng2AppModule;
    private compilerOptions;
    private idPrefix;
    private upgradedComponents;
    private providers;
    private ngZone;
    private ng1Module;
    private moduleRef;
    private ng2BootstrapDeferred;
    constructor(ng2AppModule: Type<any>, compilerOptions?: CompilerOptions);
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
     * @Component({
     *   selector: 'greet',
     *   template: '{{salutation}} {{name}}! - <ng-content></ng-content>'
     * })
     * class Greeter {
     *   @Input() salutation: string;
     *   @Input() name: string;
     * }
     *
     * @NgModule({
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
     */
    downgradeNg2Component(type: Type<any>): Function;
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
     * @Component({
     *   selector: 'ng2',
     *   template: 'ng2 template: <greet salutation="Hello" [name]="world">text</greet>'
     * })
     * class Ng2Component {
     * }
     *
     * @NgModule({
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
     */
    upgradeNg1Component(name: string): Type<any>;
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
     * @param modules any Angular 1 modules that the upgrade module should depend upon
     * @returns an {@link UpgradeAdapterRef}, which lets you register a `ready()` callback to
     * run assertions once the Angular 2+ components are ready to test through Angular 1.
     */
    registerForNg1Tests(modules?: string[]): UpgradeAdapterRef;
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
     * @Component({
     *   selector: 'ng2',
     *   inputs: ['name'],
     *   template: 'ng2[<ng1 [title]="name">transclude</ng1>](<ng-content></ng-content>)'
     * })
     * class Ng2 {
     * }
     *
     * @NgModule({
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
     */
    bootstrap(element: Element, modules?: any[], config?: angular.IAngularBootstrapConfig): UpgradeAdapterRef;
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
     * @Injectable()
     * class Example {
     *   constructor(@Inject('server') server, login: Login) {
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
     */
    upgradeNg1Provider(name: string, options?: {
        asToken: any;
    }): void;
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
     */
    downgradeNg2Provider(token: any): Function;
    /**
     * Declare the Angular 1 upgrade module for this adapter without bootstrapping the whole
     * hybrid application.
     *
     * This method is automatically called by `bootstrap()` and `registerForNg1Tests()`.
     *
     * @param modules The Angular 1 modules that this upgrade module should depend upon.
     * @returns The Angular 1 upgrade module that is declared by this method
     *
     * ### Example
     *
     * ```
     * const upgradeAdapter = new UpgradeAdapter(MyNg2Module);
     * upgradeAdapter.declareNg1Module(['heroApp']);
     * ```
     */
    private declareNg1Module(modules?);
}
/**
 * Use `UpgradeAdapterRef` to control a hybrid Angular 1 / Angular 2+ application.
 *
 * @stable
 */
export declare class UpgradeAdapterRef {
    ng1RootScope: angular.IRootScopeService;
    ng1Injector: angular.IInjectorService;
    ng2ModuleRef: NgModuleRef<any>;
    ng2Injector: Injector;
    /**
     * Register a callback function which is notified upon successful hybrid Angular 1 / Angular 2+
     * application has been bootstrapped.
     *
     * The `ready` callback function is invoked inside the Angular 2+ zone, therefore it does not
     * require a call to `$apply()`.
     */
    ready(fn: (upgradeAdapterRef?: UpgradeAdapterRef) => void): void;
    /**
     * Dispose of running hybrid Angular 1 / Angular 2+ application.
     */
    dispose(): void;
}
/**
 * Sort a set of DOM nodes that into groups based on the given content selectors
 */
export declare function sortProjectableNodes(ngContentSelectors: string[], childNodes: Node[]): Node[][];
