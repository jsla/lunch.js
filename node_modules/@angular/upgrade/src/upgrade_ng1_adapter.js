/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, ElementRef, EventEmitter, Inject } from '@angular/core';
import * as angular from './angular_js';
import { NG1_COMPILE, NG1_CONTROLLER, NG1_HTTP_BACKEND, NG1_SCOPE, NG1_TEMPLATE_CACHE } from './constants';
import { controllerKey } from './util';
var /** @type {?} */ CAMEL_CASE = /([A-Z])/g;
var /** @type {?} */ INITIAL_VALUE = {
    __UNINITIALIZED__: true
};
var /** @type {?} */ NOT_SUPPORTED = 'NOT_SUPPORTED';
export var UpgradeNg1ComponentAdapterBuilder = (function () {
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
            Directive({ selector: selector, inputs: this.inputsRename, outputs: this.outputsRename })
                .Class({
                constructor: [
                    new Inject(NG1_SCOPE), ElementRef,
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
function UpgradeNg1ComponentAdapterBuilder_tsickle_Closure_declarations() {
    /** @type {?} */
    UpgradeNg1ComponentAdapterBuilder.prototype.type;
    /** @type {?} */
    UpgradeNg1ComponentAdapterBuilder.prototype.inputs;
    /** @type {?} */
    UpgradeNg1ComponentAdapterBuilder.prototype.inputsRename;
    /** @type {?} */
    UpgradeNg1ComponentAdapterBuilder.prototype.outputs;
    /** @type {?} */
    UpgradeNg1ComponentAdapterBuilder.prototype.outputsRename;
    /** @type {?} */
    UpgradeNg1ComponentAdapterBuilder.prototype.propertyOutputs;
    /** @type {?} */
    UpgradeNg1ComponentAdapterBuilder.prototype.checkProperties;
    /** @type {?} */
    UpgradeNg1ComponentAdapterBuilder.prototype.propertyMap;
    /** @type {?} */
    UpgradeNg1ComponentAdapterBuilder.prototype.linkFn;
    /** @type {?} */
    UpgradeNg1ComponentAdapterBuilder.prototype.directive;
    /** @type {?} */
    UpgradeNg1ComponentAdapterBuilder.prototype.$controller;
    /** @type {?} */
    UpgradeNg1ComponentAdapterBuilder.prototype.name;
}
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
        this.$element = angular.element(this.element);
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
            var emitter = this[outputs[j]] = new EventEmitter();
            this.setComponentProperty(outputs[j], (function (emitter /** TODO #9100 */) { return function (value /** TODO #9100 */) {
                return emitter.emit(value);
            }; })(emitter));
        }
        for (var k = 0; k < propOuts.length; k++) {
            this[propOuts[k]] = new EventEmitter();
            this.checkLastValues.push(INITIAL_VALUE);
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
function UpgradeNg1ComponentAdapter_tsickle_Closure_declarations() {
    /** @type {?} */
    UpgradeNg1ComponentAdapter.prototype.controllerInstance;
    /** @type {?} */
    UpgradeNg1ComponentAdapter.prototype.destinationObj;
    /** @type {?} */
    UpgradeNg1ComponentAdapter.prototype.checkLastValues;
    /** @type {?} */
    UpgradeNg1ComponentAdapter.prototype.componentScope;
    /** @type {?} */
    UpgradeNg1ComponentAdapter.prototype.element;
    /** @type {?} */
    UpgradeNg1ComponentAdapter.prototype.$element;
    /** @type {?} */
    UpgradeNg1ComponentAdapter.prototype.linkFn;
    /** @type {?} */
    UpgradeNg1ComponentAdapter.prototype.directive;
    /** @type {?} */
    UpgradeNg1ComponentAdapter.prototype.$controller;
    /** @type {?} */
    UpgradeNg1ComponentAdapter.prototype.inputs;
    /** @type {?} */
    UpgradeNg1ComponentAdapter.prototype.outputs;
    /** @type {?} */
    UpgradeNg1ComponentAdapter.prototype.propOuts;
    /** @type {?} */
    UpgradeNg1ComponentAdapter.prototype.checkProperties;
    /** @type {?} */
    UpgradeNg1ComponentAdapter.prototype.propertyMap;
}
/**
 * @param {?} value
 * @return {?}
 */
function isFunction(value) {
    return typeof value === 'function';
}
//# sourceMappingURL=upgrade_ng1_adapter.js.map