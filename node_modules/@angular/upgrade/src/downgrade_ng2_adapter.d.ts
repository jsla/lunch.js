/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ChangeDetectorRef, ComponentFactory, ComponentRef, Injector, SimpleChanges } from '@angular/core';
import * as angular from './angular_js';
import { ComponentInfo } from './metadata';
export declare class DowngradeNg2ComponentAdapter {
    private info;
    private element;
    private attrs;
    private scope;
    private parentInjector;
    private parse;
    private componentFactory;
    component: any;
    inputChangeCount: number;
    inputChanges: SimpleChanges;
    componentRef: ComponentRef<any>;
    changeDetector: ChangeDetectorRef;
    componentScope: angular.IScope;
    constructor(info: ComponentInfo, element: angular.IAugmentedJQuery, attrs: angular.IAttributes, scope: angular.IScope, parentInjector: Injector, parse: angular.IParseService, componentFactory: ComponentFactory<any>);
    bootstrapNg2(projectableNodes: Node[][]): void;
    setupInputs(): void;
    setupOutputs(): void;
    registerCleanup(): void;
    private updateInput(prop, prevValue, currValue);
}
