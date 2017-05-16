/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 * @param {?} e
 * @return {?}
 */
export function onError(e) {
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
export function controllerKey(name) {
    return '$' + name + 'Controller';
}
/**
 * @param {?} node
 * @return {?}
 */
export function getAttributesAsArray(node) {
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
export var Deferred = (function () {
    function Deferred() {
        var _this = this;
        this.promise = new Promise(function (res, rej) {
            _this.resolve = res;
            _this.reject = rej;
        });
    }
    return Deferred;
}());
function Deferred_tsickle_Closure_declarations() {
    /** @type {?} */
    Deferred.prototype.promise;
    /** @type {?} */
    Deferred.prototype.resolve;
    /** @type {?} */
    Deferred.prototype.reject;
}
//# sourceMappingURL=util.js.map