import { AfterViewInit, Directive, ElementRef, EventEmitter, Injector, Output, inject, input } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';

@Directive({ selector: '[datePickerInitialValue]' })
export class DatePickerInitialValueSetterDirective implements AfterViewInit {
    private _element = inject(ElementRef);

    readonly ngModel = input(undefined);
    hostElement: ElementRef;

    constructor(...args: unknown[]);

    constructor() {
        const _element = this._element;

        this.hostElement = _element;
    }

    ngAfterViewInit(): void {
        if (this.ngModel()) {
            setTimeout(() => {
                (this.hostElement.nativeElement as any).value = this.ngModel().toFormat('D');
            });
        }
    }
}
