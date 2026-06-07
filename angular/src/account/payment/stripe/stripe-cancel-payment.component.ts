import { Component, Injector, inject } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { LocalizePipe } from '@shared/common/pipes/localize.pipe';

@Component({
    selector: 'stripe-cancel-payment',
    templateUrl: './stripe-cancel-payment.component.html',
    imports: [LocalizePipe],
})
export class StripeCancelPaymentComponent extends AppComponentBase {
    constructor(...args: unknown[]);

    constructor() {
        const _injector = inject(Injector);

        super(_injector);
    }
}
