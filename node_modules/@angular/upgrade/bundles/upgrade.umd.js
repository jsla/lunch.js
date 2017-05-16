/**
 * @license Angular v2.4.10
 * (c) 2010-2017 Google, Inc. https://angular.io/
 * License: MIT
 */
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/compiler'), require('@angular/core'), require('@angular/platform-browser-dynamic')) :
    typeof define === 'function' && define.amd ? define(['exports', '@angular/compiler', '@angular/core', '@angular/platform-browser-dynamic'], factory) :
    (factory((global.ng = global.ng || {}, global.ng.upgrade = global.ng.upgrade || {}),global.ng.compiler,global.ng.core,global.ng.platformBrowserDynamic));
}(this, function (exports,_angular_compiler,_angular_core,_angular_platformBrowserDynamic) { 'use strict';

    /**
     * @license
     * Copyright Google Inc. All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    /**
     * @return {?}
     */
    function noNg() {
        throw new Error('AngularJS v1.x is not loaded!');
    }
    var /** @type {?} */ angular = ({
        bootstrap: noNg,
        module: noNg,
        element: noNg,
        version: noNg,
        resumeBootstrap: noNg,
        getTestability: noNg
    });
    try {
        if (window.hasOwnProperty('angular')) {
            angular = ((window)).angular;
        }
    }
    catch (e) {
    }
    var /** @type {?} */ bootstrap = angular.bootstrap;
    var /** @type {?} */ module$1 = angular.module;
    var /** @type {?} */ element = angular.element;

    /**
     * @license
     * Copyright Google Inc. All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var /** @type {?} */ NG2_COMPILER = 'ng2.Compiler';
    var /** @type {?} */ NG2_INJECTOR = 'ng2.Injector';
    var /** @type {?} */ NG2_COMPONENT_FACTORY_REF_MAP = 'ng2.ComponentFactoryRefMap';
    var /** @type {?} */ NG2_ZONE = 'ng2.NgZone';
    var /** @type {?} */ NG1_CONTROLLER = '$controller';
    var /** @type {?} */ NG1_SCOPE = '$scope';
    var /** @type {?} */ NG1_ROOT_SCOPE = '$rootScope';
    var /** @type {?} */ NG1_COMPILE = '$compile';
    var /** @type {?} */ NG1_HTTP_BACKEND = '$httpBackend';
    var /** @type {?} */ NG1_INJECTOR = '$injector';
    var /** @type {?} */ NG1_PARSE = '$parse';
    var /** @type {?} */ NG1_TEMPLATE_CACHE = '$templateCache';
    var /** @type {?} */ NG1_TESTABILITY = '$$testability';
    var /** @type {?} */ REQUIRE_INJECTOR = '?^^' + NG2_INJECTOR;

    var /** @type {?} */ INITIAL_VALUE = {
        __UNINITIALIZED__: true
    };
    var DowngradeNg2ComponentAdapter = (function () {
        /**
         * @param {?} info
         * @param {?} element
         * @param {?} attrs
         * @param {?} scope
         * @param {?} parentInjector
         * @param {?} parse
         * @param {?} componentFactory
         */
        function DowngradeNg2ComponentAdapter(info, element, attrs, scope, parentInjector, parse, componentFactory) {
            this.info = info;
            this.element = element;
            this.attrs = attrs;
            this.scope = scope;
            this.parentInjector = parentInjector;
            this.parse = parse;
            this.componentFactory = componentFactory;
            this.component = null;
            this.inputChangeCount = 0;
            this.inputChanges = null;
            this.componentRef = null;
            this.changeDetector = null;
            this.componentScope = scope.$new();
        }
        /**
         * @param {?} projectableNodes
         * @return {?}
         */
        DowngradeNg2ComponentAdapter.prototype.bootstrapNg2 = function (projectableNodes) {
            var /** @type {?} */ childInjector = _angular_core.ReflectiveInjector.resolveAndCreate([{ provide: NG1_SCOPE, useValue: this.componentScope }], this.parentInjector);
            this.componentRef =
                this.componentFactory.create(childInjector, projectableNodes, this.element[0]);
            this.changeDetector = this.componentRef.changeDetectorRef;
            this.component = this.componentRef.instance;
        };
        /**
         * @return {?}
         */
        DowngradeNg2ComponentAdapter.prototype.setupInputs = function () {
            var _this = this;
            var /** @type {?} */ attrs = this.attrs;
            var /** @type {?} */ inputs = this.info.inputs || [];
            for (var /** @type {?} */ i = 0; i < inputs.length; i++) {
                var /** @type {?} */ input = inputs[i];
                var /** @type {?} */ expr = null;
                if (attrs.hasOwnProperty(input.attr)) {
                    var /** @type {?} */ observeFn = (function (prop) {
                        var /** @type {?} */ prevValue = INITIAL_VALUE;
                        return function (currValue) {
                            if (prevValue === INITIAL_VALUE) {
                                prevValue = currValue;
                            }
                            _this.updateInput(prop, prevValue, currValue);
                            prevValue = currValue;
                        };
                    })(input.prop);
                    attrs.$observe(input.attr, observeFn);
                }
                else if (attrs.hasOwnProperty(input.bindAttr)) {
                    expr = ((attrs) /** TODO #9100 */)[input.bindAttr];
                }
                else if (attrs.hasOwnProperty(input.bracketAttr)) {
                    expr = ((attrs) /** TODO #9100 */)[input.bracketAttr];
                }
                else if (attrs.hasOwnProperty(input.bindonAttr)) {
                    expr = ((attrs) /** TODO #9100 */)[input.bindonAttr];
                }
                else if (attrs.hasOwnProperty(input.bracketParenAttr)) {
                    expr = ((attrs) /** TODO #9100 */)[input.bracketParenAttr];
                }
                if (expr != null) {
                    var /** @type {?} */ watchFn = (function (prop) { return function (currValue, prevValue) {
                        return _this.updateInput(prop, prevValue, currValue);
                    }; })(input.prop);
                    this.componentScope.$watch(expr, watchFn);
                }
            }
            var /** @type {?} */ prototype = this.info.type.prototype;
            if (prototype && ((prototype)).ngOnChanges) {
                // Detect: OnChanges interface
                this.inputChanges = {};
                this.componentScope.$watch(function () { return _this.inputChangeCount; }, function () {
                    var /** @type {?} */ inputChanges = _this.inputChanges;
                    _this.inputChanges = {};
                    ((_this.component)).ngOnChanges(inputChanges);
                });
            }
            this.componentScope.$watch(function () { return _this.changeDetector && _this.changeDetector.detectChanges(); });
        };
        /**
         * @return {?}
         */
        DowngradeNg2ComponentAdapter.prototype.setupOutputs = function () {
            var _this = this;
            var /** @type {?} */ attrs = this.attrs;
            var /** @type {?} */ outputs = this.info.outputs || [];
            for (var /** @type {?} */ j = 0; j < outputs.length; j++) {
                var /** @type {?} */ output = outputs[j];
                var /** @type {?} */ expr = null;
                var /** @type {?} */ assignExpr = false;
                var /** @type {?} */ bindonAttr = output.bindonAttr ? output.bindonAttr.substring(0, output.bindonAttr.length - 6) : null;
                var /** @type {?} */ bracketParenAttr = output.bracketParenAttr ?
                    "[(" + output.bracketParenAttr.substring(2, output.bracketParenAttr.length - 8) + ")]" :
                    null;
                if (attrs.hasOwnProperty(output.onAttr)) {
                    expr = ((attrs) /** TODO #9100 */)[output.onAttr];
                }
                else if (attrs.hasOwnProperty(output.parenAttr)) {
                    expr = ((attrs) /** TODO #9100 */)[output.parenAttr];
                }
                else if (attrs.hasOwnProperty(bindonAttr)) {
                    expr = ((attrs) /** TODO #9100 */)[bindonAttr];
                    assignExpr = true;
                }
                else if (attrs.hasOwnProperty(bracketParenAttr)) {
                    expr = ((attrs) /** TODO #9100 */)[bracketParenAttr];
                    assignExpr = true;
                }
                if (expr != null && assignExpr != null) {
                    var /** @type {?} */ getter = this.parse(expr);
                    var /** @type {?} */ setter = getter.assign;
                    if (assignExpr && !setter) {
                        throw new Error("Expression '" + expr + "' is not assignable!");
                    }
                    var /** @type {?} */ emitter = (this.component[output.prop]);
                    if (emitter) {
                        emitter.subscribe({
                            next: assignExpr ?
                                (function (setter) { return function (v /** TODO #9100 */) { return setter(_this.scope, v); }; })(setter) :
                                (function (getter) { return function (v /** TODO #9100 */) {
                                    return getter(_this.scope, { $event: v });
                                }; })(getter)
                        });
                    }
                    else {
                        throw new Error("Missing emitter '" + output.prop + "' on component '" + this.info.selector + "'!");
                    }
                }
            }
        };
        /**
         * @return {?}
         */
        DowngradeNg2ComponentAdapter.prototype.registerCleanup = function () {
            var _this = this;
            this.element.bind('$destroy', function () {
                _this.componentScope.$destroy();
                _this.componentRef.destroy();
            });
        };
        /**
         * @param {?} prop
         * @param {?} prevValue
         * @param {?} currValue
         * @return {?}
         */
        DowngradeNg2ComponentAdapter.prototype.updateInput = function (prop, prevValue, currValue) {
            if (this.inputChanges) {
                this.inputChangeCount++;
                this.inputChanges[prop] = new Ng1Change(prevValue, currValue);
            }
            this.component[prop] = currValue;
        };
        return DowngradeNg2ComponentAdapter;
    }());
    var Ng1Change = (function () {
        /**
         * @param {?} previousValue
         * @param {?} currentValue
         */
        function Ng1Change(previousValue, currentValue) {
            this.previousValue = previousValue;
            this.currentValue = currentValue;
        }
        /**
         * @return {?}
         */
        Ng1Change.prototype.isFirstChange = function () { return this.previousValue === this.currentValue; };
        return Ng1Change;
    }());

    var /** @type {?} */ directiveResolver = new _angular_compiler.DirectiveResolver();
    /**
     * @param {?} type
     * @return {?}
     */
    function getComponentInfo(type) {
        var /** @type {?} */ resolvedMetadata = directiveResolver.resolve(type);
        var /** @type {?} */ selector = resolvedMetadata.selector;
        return {
            type: type,
            selector: selector,
            inputs: parseFields(resolvedMetadata.inputs),
            outputs: parseFields(resolvedMetadata.outputs)
        };
    }
    /**
     * @param {?} names
     * @return {?}
     */
    function parseFields(names) {
        var /** @type {?} */ attrProps = [];
        if (names) {
            for (var /** @type {?} */ i = 0; i < names.length; i++) {
                var /** @type {?} */ parts = names[i].split(':');
                var /** @type {?} */ prop = parts[0].trim();
                var /** @type {?} */ attr = (parts[1] || parts[0]).trim();
                var /** @type {?} */ capitalAttr = attr.charAt(0).toUpperCase() + attr.substr(1);
                attrProps.push(/** @type {?} */ ({
                    prop: prop,
                    attr: attr,
                    bracketAttr: "[" + attr + "]",
                    parenAttr: "(" + attr + ")",
                    bracketParenAttr: "[(" + attr + ")]",
                    onAttr: "on" + capitalAttr,
                    bindAttr: "bind" + capitalAttr,
                    bindonAttr: "bindon" + capitalAttr
                }));
            }
        }
        return attrProps;
    }

    /**
     * @license
     * Copyright Google Inc. All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     * @param {?} e
     * @return {?}
     */
    function onError(e) {
        // TODO: (misko): We seem to not have a stack trace here!
        if (console.error) {
            console.error(e, e.stack);
        }
        else {
            // tslint:disable-next-line:no-console
            console.log(e, e.stack);
        }
        throw e;
    }
    /**
     * @param {?} name
     * @return {?}
     */
    function controllerKey(name) {
        return '$' + name + 'Controller';
    }
    /**
     * @param {?} node
     * @return {?}
     */
    function getAttributesAsArray(node) {
        var /** @type {?} */ attributes = node.attributes;
        var /** @type {?} */ asArray;
        if (attributes) {
            var /** @type {?} */ attrLen = attributes.length;
            asArray = new Array(attrLen);
            for (var /** @type {?} */ i = 0; i < attrLen; i++) {
                asArray[i] = [attributes[i].nodeName, attributes[i].nodeValue];
            }
        }
        return asArray || [];
    }
    var Deferred = (function () {
        function Deferred() {
            var _this = this;
            this.promise = new Promise(function (res, rej) {
                _this.resolve = res;
                _this.reject = rej;
            });
        }
        return Deferred;
    }());

    var /** @type {?} */ CAMEL_CASE = /([A-Z])/g;
    var /** @type {?} */ INITIAL_VALUE$1 = {
        __UNINITIALIZED__: true
    };
    var /** @type {?} */ NOT_SUPPORTED = 'NOT_SUPPORTED';
    var UpgradeNg1ComponentAdapterBuilder = (function () {
        /**
         * @param {?} name
         */
        function UpgradeNg1ComponentAdapterBuilder(name) {
            this.name = name;
            this.inputs = [];
            this.inputsRename = [];
            this.outputs = [];
            this.outputsRename = [];
            this.propertyOutputs = [];
            this.checkProperties = [];
            this.propertyMap = {};
            this.linkFn = null;
            this.directive = null;
            this.$controller = null;
            var selector = name.replace(CAMEL_CASE, function (all /** TODO #9100 */, next) { return '-' + next.toLowerCase(); });
            var self = this;
            this.type =
                _angular_core.Directive({ selector: selector, inputs: this.inputsRename, outputs: this.outputsRename })
                    .Class({
                    constructor: [
                        new _angular_core.Inject(NG1_SCOPE), _angular_core.ElementRef,
                        function (scope, elementRef) {
                            return new UpgradeNg1ComponentAdapter(self.linkFn, scope, self.directive, elementRef, self.$controller, self.inputs, self.outputs, self.propertyOutputs, self.checkProperties, self.propertyMap);
                        }
                    ],
                    ngOnInit: function () { },
                    ngOnChanges: function () { },
                    ngDoCheck: function () { },
                    ngOnDestroy: function () { },
                });
        }
        /**
         * @param {?} injector
         * @return {?}
         */
        UpgradeNg1ComponentAdapterBuilder.prototype.extractDirective = function (injector) {
            var /** @type {?} */ directives = injector.get(this.name + 'Directive');
            if (directives.length > 1) {
                throw new Error('Only support single directive definition for: ' + this.name);
            }
            var /** @type {?} */ directive = directives[0];
            if (directive.replace)
                this.notSupported('replace');
            if (directive.terminal)
                this.notSupported('terminal');
            var /** @type {?} */ link = directive.link;
            if (typeof link == 'object') {
                if (((link)).post)
                    this.notSupported('link.post');
            }
            return directive;
        };
        /**
         * @param {?} feature
         * @return {?}
         */
        UpgradeNg1ComponentAdapterBuilder.prototype.notSupported = function (feature) {
            throw new Error("Upgraded directive '" + this.name + "' does not support '" + feature + "'.");
        };
        /**
         * @return {?}
         */
        UpgradeNg1ComponentAdapterBuilder.prototype.extractBindings = function () {
            var /** @type {?} */ btcIsObject = typeof this.directive.bindToController === 'object';
            if (btcIsObject && Object.keys(this.directive.scope).length) {
                throw new Error("Binding definitions on scope and controller at the same time are not supported.");
            }
            var /** @type {?} */ context = (btcIsObject) ? this.directive.bindToController : this.directive.scope;
            if (typeof context == 'object') {
                for (var name_1 in context) {
                    if (((context)).hasOwnProperty(name_1)) {
                        var /** @type {?} */ localName = context[name_1];
                        var /** @type {?} */ type = localName.charAt(0);
                        var /** @type {?} */ typeOptions = localName.charAt(1);
                        localName = typeOptions === '?' ? localName.substr(2) : localName.substr(1);
                        localName = localName || name_1;
                        var /** @type {?} */ outputName = 'output_' + name_1;
                        var /** @type {?} */ outputNameRename = outputName + ': ' + name_1;
                        var /** @type {?} */ outputNameRenameChange = outputName + ': ' + name_1 + 'Change';
                        var /** @type {?} */ inputName = 'input_' + name_1;
                        var /** @type {?} */ inputNameRename = inputName + ': ' + name_1;
                        switch (type) {
                            case '=':
                                this.propertyOutputs.push(outputName);
                                this.checkProperties.push(localName);
                                this.outputs.push(outputName);
                                this.outputsRename.push(outputNameRenameChange);
                                this.propertyMap[outputName] = localName;
                                this.inputs.push(inputName);
                                this.inputsRename.push(inputNameRename);
                                this.propertyMap[inputName] = localName;
                                break;
                            case '@':
                            // handle the '<' binding of angular 1.5 components
                            case '<':
                                this.inputs.push(inputName);
                                this.inputsRename.push(inputNameRename);
                                this.propertyMap[inputName] = localName;
                                break;
                            case '&':
                                this.outputs.push(outputName);
                                this.outputsRename.push(outputNameRename);
                                this.propertyMap[outputName] = localName;
                                break;
                            default:
                                var /** @type {?} */ json = JSON.stringify(context);
                                throw new Error("Unexpected mapping '" + type + "' in '" + json + "' in '" + this.name + "' directive.");
                        }
                    }
                }
            }
        };
        /**
         * @param {?} compile
         * @param {?} templateCache
         * @param {?} httpBackend
         * @return {?}
         */
        UpgradeNg1ComponentAdapterBuilder.prototype.compileTemplate = function (compile, templateCache, httpBackend) {
            var _this = this;
            if (this.directive.template !== undefined) {
                this.linkFn = compileHtml(isFunction(this.directive.template) ? this.directive.template() :
                    this.directive.template);
            }
            else if (this.directive.templateUrl) {
                var /** @type {?} */ url_1 = isFunction(this.directive.templateUrl) ? this.directive.templateUrl() :
                    this.directive.templateUrl;
                var /** @type {?} */ html = templateCache.get(url_1);
                if (html !== undefined) {
                    this.linkFn = compileHtml(html);
                }
                else {
                    return new Promise(function (resolve, err) {
                        httpBackend('GET', url_1, null, function (status /** TODO #9100 */, response /** TODO #9100 */) {
                            if (status == 200) {
                                resolve(_this.linkFn = compileHtml(templateCache.put(url_1, response)));
                            }
                            else {
                                err("GET " + url_1 + " returned " + status + ": " + response);
                            }
                        });
                    });
                }
            }
            else {
                throw new Error("Directive '" + this.name + "' is not a component, it is missing template.");
            }
            return null;
            /**
             * @param {?} html
             * @return {?}
             */
            function compileHtml(html /** TODO #9100 */) {
                var /** @type {?} */ div = document.createElement('div');
                div.innerHTML = html;
                return compile(div.childNodes);
            }
        };
        /**
         * Upgrade ng1 components into Angular 2.
         * @param {?} exportedComponents
         * @param {?} injector
         * @return {?}
         */
        UpgradeNg1ComponentAdapterBuilder.resolve = function (exportedComponents, injector) {
            var /** @type {?} */ promises = [];
            var /** @type {?} */ compile = injector.get(NG1_COMPILE);
            var /** @type {?} */ templateCache = injector.get(NG1_TEMPLATE_CACHE);
            var /** @type {?} */ httpBackend = injector.get(NG1_HTTP_BACKEND);
            var /** @type {?} */ $controller = injector.get(NG1_CONTROLLER);
            for (var name_2 in exportedComponents) {
                if (((exportedComponents)).hasOwnProperty(name_2)) {
                    var /** @type {?} */ exportedComponent = exportedComponents[name_2];
                    exportedComponent.directive = exportedComponent.extractDirective(injector);
                    exportedComponent.$controller = $controller;
                    exportedComponent.extractBindings();
                    var /** @type {?} */ promise = exportedComponent.compileTemplate(compile, templateCache, httpBackend);
                    if (promise)
                        promises.push(promise);
                }
            }
            return Promise.all(promises);
        };
        return UpgradeNg1ComponentAdapterBuilder;
    }());
    var UpgradeNg1ComponentAdapter = (function () {
        /**
         * @param {?} linkFn
         * @param {?} scope
         * @param {?} directive
         * @param {?} elementRef
         * @param {?} $controller
         * @param {?} inputs
         * @param {?} outputs
         * @param {?} propOuts
         * @param {?} checkProperties
         * @param {?} propertyMap
         */
        function UpgradeNg1ComponentAdapter(linkFn, scope, directive, elementRef, $controller, inputs, outputs, propOuts, checkProperties, propertyMap) {
            this.linkFn = linkFn;
            this.directive = directive;
            this.$controller = $controller;
            this.inputs = inputs;
            this.outputs = outputs;
            this.propOuts = propOuts;
            this.checkProperties = checkProperties;
            this.propertyMap = propertyMap;
            this.controllerInstance = null;
            this.destinationObj = null;
            this.checkLastValues = [];
            this.$element = null;
            this.element = elementRef.nativeElement;
            this.componentScope = scope.$new(!!directive.scope);
            this.$element = element(this.element);
            var controllerType = directive.controller;
            if (directive.bindToController && controllerType) {
                this.controllerInstance = this.buildController(controllerType);
                this.destinationObj = this.controllerInstance;
            }
            else {
                this.destinationObj = this.componentScope;
            }
            for (var i = 0; i < inputs.length; i++) {
                this[inputs[i]] = null;
            }
            for (var j = 0; j < outputs.length; j++) {
                var emitter = this[outputs[j]] = new _angular_core.EventEmitter();
                this.setComponentProperty(outputs[j], (function (emitter /** TODO #9100 */) { return function (value /** TODO #9100 */) {
                    return emitter.emit(value);
                }; })(emitter));
            }
            for (var k = 0; k < propOuts.length; k++) {
                this[propOuts[k]] = new _angular_core.EventEmitter();
                this.checkLastValues.push(INITIAL_VALUE$1);
            }
        }
        /**
         * @return {?}
         */
        UpgradeNg1ComponentAdapter.prototype.ngOnInit = function () {
            var _this = this;
            if (!this.directive.bindToController && this.directive.controller) {
                this.controllerInstance = this.buildController(this.directive.controller);
            }
            if (this.controllerInstance && isFunction(this.controllerInstance.$onInit)) {
                this.controllerInstance.$onInit();
            }
            var /** @type {?} */ link = this.directive.link;
            if (typeof link == 'object')
                link = ((link)).pre;
            if (link) {
                var /** @type {?} */ attrs = NOT_SUPPORTED;
                var /** @type {?} */ transcludeFn = NOT_SUPPORTED;
                var /** @type {?} */ linkController = this.resolveRequired(this.$element, this.directive.require);
                ((this.directive.link))(this.componentScope, this.$element, attrs, linkController, transcludeFn);
            }
            var /** @type {?} */ childNodes = [];
            var /** @type {?} */ childNode;
            while (childNode = this.element.firstChild) {
                this.element.removeChild(childNode);
                childNodes.push(childNode);
            }
            this.linkFn(this.componentScope, function (clonedElement, scope) {
                for (var /** @type {?} */ i = 0, /** @type {?} */ ii = clonedElement.length; i < ii; i++) {
                    _this.element.appendChild(clonedElement[i]);
                }
            }, {
                parentBoundTranscludeFn: function (scope /** TODO #9100 */, cloneAttach /** TODO #9100 */) { cloneAttach(childNodes); }
            });
            if (this.controllerInstance && isFunction(this.controllerInstance.$postLink)) {
                this.controllerInstance.$postLink();
            }
        };
        /**
         * @param {?} changes
         * @return {?}
         */
        UpgradeNg1ComponentAdapter.prototype.ngOnChanges = function (changes) {
            var _this = this;
            var /** @type {?} */ ng1Changes = {};
            Object.keys(changes).forEach(function (name) {
                var /** @type {?} */ change = changes[name];
                _this.setComponentProperty(name, change.currentValue);
                ng1Changes[_this.propertyMap[name]] = change;
            });
            if (isFunction(this.destinationObj.$onChanges)) {
                this.destinationObj.$onChanges(ng1Changes);
            }
        };
        /**
         * @return {?}
         */
        UpgradeNg1ComponentAdapter.prototype.ngDoCheck = function () {
            var /** @type {?} */ destinationObj = this.destinationObj;
            var /** @type {?} */ lastValues = this.checkLastValues;
            var /** @type {?} */ checkProperties = this.checkProperties;
            for (var /** @type {?} */ i = 0; i < checkProperties.length; i++) {
                var /** @type {?} */ value = destinationObj[checkProperties[i]];
                var /** @type {?} */ last = lastValues[i];
                if (value !== last) {
                    if (typeof value == 'number' && isNaN(value) && typeof last == 'number' && isNaN(last)) {
                    }
                    else {
                        var /** @type {?} */ eventEmitter = ((this) /** TODO #9100 */)[this.propOuts[i]];
                        eventEmitter.emit(lastValues[i] = value);
                    }
                }
            }
            if (this.controllerInstance && isFunction(this.controllerInstance.$doCheck)) {
                this.controllerInstance.$doCheck();
            }
        };
        /**
         * @return {?}
         */
        UpgradeNg1ComponentAdapter.prototype.ngOnDestroy = function () {
            if (this.controllerInstance && isFunction(this.controllerInstance.$onDestroy)) {
                this.controllerInstance.$onDestroy();
            }
        };
        /**
         * @param {?} name
         * @param {?} value
         * @return {?}
         */
        UpgradeNg1ComponentAdapter.prototype.setComponentProperty = function (name, value) {
            this.destinationObj[this.propertyMap[name]] = value;
        };
        /**
         * @param {?} controllerType
         * @return {?}
         */
        UpgradeNg1ComponentAdapter.prototype.buildController = function (controllerType /** TODO #9100 */) {
            var /** @type {?} */ locals = { $scope: this.componentScope, $element: this.$element };
            var /** @type {?} */ controller = this.$controller(controllerType, locals, null, this.directive.controllerAs);
            this.$element.data(controllerKey(this.directive.name), controller);
            return controller;
        };
        /**
         * @param {?} $element
         * @param {?} require
         * @return {?}
         */
        UpgradeNg1ComponentAdapter.prototype.resolveRequired = function ($element, require) {
            if (!require) {
                return undefined;
            }
            else if (typeof require == 'string') {
                var /** @type {?} */ name_3 = (require);
                var /** @type {?} */ isOptional = false;
                var /** @type {?} */ startParent = false;
                var /** @type {?} */ searchParents = false;
                if (name_3.charAt(0) == '?') {
                    isOptional = true;
                    name_3 = name_3.substr(1);
                }
                if (name_3.charAt(0) == '^') {
                    searchParents = true;
                    name_3 = name_3.substr(1);
                }
                if (name_3.charAt(0) == '^') {
                    startParent = true;
                    name_3 = name_3.substr(1);
                }
                var /** @type {?} */ key = controllerKey(name_3);
                if (startParent)
                    $element = $element.parent();
                var /** @type {?} */ dep = searchParents ? $element.inheritedData(key) : $element.data(key);
                if (!dep && !isOptional) {
                    throw new Error("Can not locate '" + require + "' in '" + this.directive.name + "'.");
                }
                return dep;
            }
            else if (require instanceof Array) {
                var /** @type {?} */ deps = [];
                for (var /** @type {?} */ i = 0; i < require.length; i++) {
                    deps.push(this.resolveRequired($element, require[i]));
                }
                return deps;
            }
            throw new Error("Directive '" + this.directive.name + "' require syntax unrecognized: " + this.directive.require);
        };
        return UpgradeNg1ComponentAdapter;
    }());
    /**
     * @param {?} value
     * @return {?}
     */
    function isFunction(value) {
        return typeof value === 'function';
    }

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
    var UpgradeAdapter = (function () {
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
        UpgradeAdapter.prototype.bootstrap = function (element$$, modules, config) {
            var _this = this;
            this.declareNg1Module(modules);
            var /** @type {?} */ upgrade = new UpgradeAdapterRef();
            // Make sure resumeBootstrap() only exists if the current bootstrap is deferred
            var /** @type {?} */ windowAngular = ((window) /** TODO #???? */)['angular'];
            windowAngular.resumeBootstrap = undefined;
            this.ngZone.run(function () { bootstrap(element$$, [_this.ng1Module.name], config); });
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
                element(element$$).data(controllerKey(NG2_INJECTOR), _this.moduleRef.injector);
                _this.moduleRef.injector.get(_angular_core.NgZone).run(function () { ((upgrade))._bootstrapDone(_this.moduleRef, ng1Injector); });
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
            var /** @type {?} */ ng1Module = this.ng1Module = module$1(this.idPrefix, modules);
            var /** @type {?} */ platformRef = _angular_platformBrowserDynamic.platformBrowserDynamic();
            this.ngZone = new _angular_core.NgZone({ enableLongStackTrace: Zone.hasOwnProperty('longStackTraceZoneSpec') });
            this.ng2BootstrapDeferred = new Deferred();
            ng1Module.factory(NG2_INJECTOR, function () { return _this.moduleRef.injector.get(_angular_core.Injector); })
                .constant(NG2_ZONE, this.ngZone)
                .constant(NG2_COMPONENT_FACTORY_REF_MAP, componentFactoryRefMap)
                .factory(NG2_COMPILER, function () { return _this.moduleRef.injector.get(_angular_core.Compiler); })
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
                                        var /** @type {?} */ ng2Testability = upgradeAdapter.moduleRef.injector.get(_angular_core.Testability);
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
                        var /** @type {?} */ DynamicNgUpgradeModule = _angular_core.NgModule({
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
    var UpgradeAdapterRef = (function () {
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
    /**
     * Sort a set of DOM nodes that into groups based on the given content selectors
     * @param {?} ngContentSelectors
     * @param {?} childNodes
     * @return {?}
     */
    function sortProjectableNodes(ngContentSelectors, childNodes) {
        var /** @type {?} */ projectableNodes = [];
        var /** @type {?} */ matcher = new _angular_compiler.SelectorMatcher();
        var /** @type {?} */ wildcardNgContentIndex;
        for (var /** @type {?} */ i = 0, /** @type {?} */ ii = ngContentSelectors.length; i < ii; i++) {
            projectableNodes[i] = [];
            if (ngContentSelectors[i] === '*') {
                wildcardNgContentIndex = i;
            }
            else {
                matcher.addSelectables(_angular_compiler.CssSelector.parse(ngContentSelectors[i]), i);
            }
        }
        var _loop_1 = function(node) {
            var /** @type {?} */ ngContentIndices = [];
            var /** @type {?} */ selector = _angular_compiler.createElementCssSelector(node.nodeName.toLowerCase(), getAttributesAsArray(node));
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

    /**
     * @stable
     */
    var /** @type {?} */ VERSION = new _angular_core.Version('2.4.10');

    exports.UpgradeAdapter = UpgradeAdapter;
    exports.UpgradeAdapterRef = UpgradeAdapterRef;
    exports.VERSION = VERSION;

}));