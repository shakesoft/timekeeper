import {
    Directive,
    ComponentFactoryResolver,
    ViewContainerRef,
    Injector,
    SimpleChanges,
    OnChanges,
    inject,
    input,
} from '@angular/core';
import { NgxSpinnerService, NgxSpinnerComponent } from 'ngx-spinner';

@Directive({ selector: '[busyIf]' })
export class BusyIfDirective implements OnChanges {
    private _viewContainer = inject(ViewContainerRef);
    private _componentFactoryResolver = inject(ComponentFactoryResolver);
    private _injector = inject(Injector);

    private static index = 0;

    private spinnerName = '';

    readonly busyIf = input<boolean>(undefined);

    ngxSpinnerService: NgxSpinnerService;
    isBusy = false;

    constructor(...args: unknown[]);

    constructor() {
        const _injector = this._injector;

        this.ngxSpinnerService = _injector.get(NgxSpinnerService);
        this.loadComponent();
    }

    refreshState(): void {
        if (this.isBusy === undefined || this.spinnerName === '') {
            return;
        }

        setTimeout(() => {
            if (this.isBusy) {
                this.ngxSpinnerService.show(this.spinnerName);
            } else {
                this.ngxSpinnerService.hide(this.spinnerName);
            }
        }, 1000);
    }

    loadComponent() {
        const componentFactory = this._componentFactoryResolver.resolveComponentFactory(NgxSpinnerComponent);
        const componentRef = this._viewContainer.createComponent(componentFactory);
        this.spinnerName = 'busyIfSpinner-' + BusyIfDirective.index++ + '-' + Math.floor(Math.random() * 1000000); // generate random name
        let component = <NgxSpinnerComponent>componentRef.instance;
        component.name = this.spinnerName;
        component.fullScreen = false;

        component.type = 'ball-clip-rotate';
        component.size = 'medium';
        component.color = '#5ba7ea';
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.busyIf) {
            this.isBusy = changes.busyIf.currentValue;
            this.refreshState();
        }
    }
}
