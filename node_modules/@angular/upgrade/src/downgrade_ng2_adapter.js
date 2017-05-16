/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ReflectiveInjector } from '@angular/core';
import { NG1_SCOPE } from './constants';
var /** @type {?} */ INITIAL_VALUE = {
    __UNINITIALIZED__: true
};
export var DowngradeNg2ComponentAdapter = (function () {
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
        var /** @type {?} */ childInjector = ReflectiveInjector.resolveAndCreate([{ provide: NG1_SCOPE, useValue: this.componentScope }], this.parentInjector);
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
function DowngradeNg2ComponentAdapter_tsickle_Closure_declarations() {
    /** @type {?} */
    DowngradeNg2ComponentAdapter.prototype.component;
    /** @type {?} */
    DowngradeNg2ComponentAdapter.prototype.inputChangeCount;
    /** @type {?} */
    DowngradeNg2ComponentAdapter.prototype.inputChanges;
    /** @type {?} */
    DowngradeNg2ComponentAdapter.prototype.componentRef;
    /** @type {?} */
    DowngradeNg2ComponentAdapter.prototype.changeDetector;
    /** @type {?} */
    DowngradeNg2ComponentAdapter.prototype.componentScope;
    /** @type {?} */
    DowngradeNg2ComponentAdapter.prototype.info;
    /** @type {?} */
    DowngradeNg2ComponentAdapter.prototype.element;
    /** @type {?} */
    DowngradeNg2ComponentAdapter.prototype.attrs;
    /** @type {?} */
    DowngradeNg2ComponentAdapter.prototype.scope;
    /** @type {?} */
    DowngradeNg2ComponentAdapter.prototype.parentInjector;
    /** @type {?} */
    DowngradeNg2ComponentAdapter.prototype.parse;
    /** @type {?} */
    DowngradeNg2ComponentAdapter.prototype.componentFactory;
}
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
function Ng1Change_tsickle_Closure_declarations() {
    /** @type {?} */
    Ng1Change.prototype.previousValue;
    /** @type {?} */
    Ng1Change.prototype.currentValue;
}
//# sourceMappingURL=downgrade_ng2_adapter.js.map