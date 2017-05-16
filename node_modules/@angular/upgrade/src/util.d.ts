/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
export declare function onError(e: any): void;
export declare function controllerKey(name: string): string;
export declare function getAttributesAsArray(node: Node): [string, string][];
export declare class Deferred<R> {
    promise: Promise<R>;
    resolve: (value?: R | PromiseLike<R>) => void;
    reject: (error?: any) => void;
    constructor();
}
