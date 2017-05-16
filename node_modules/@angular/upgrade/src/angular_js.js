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
export var /** @type {?} */ bootstrap = angular.bootstrap;
export var /** @type {?} */ module = angular.module;
export var /** @type {?} */ element = angular.element;
export var /** @type {?} */ version = angular.version;
export var /** @type {?} */ resumeBootstrap = angular.resumeBootstrap;
export var /** @type {?} */ getTestability = angular.getTestability;
//# sourceMappingURL=angular_js.js.map