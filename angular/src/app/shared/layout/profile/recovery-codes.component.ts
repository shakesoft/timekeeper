import { Component, Injector, OnInit, inject, viewChild } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { UpdateGoogleAuthenticatorKeyOutput } from '@shared/service-proxies/service-proxies';
import { ModalDirective } from 'ngx-bootstrap/modal';

import { LocalizePipe } from '@shared/common/pipes/localize.pipe';

@Component({
    selector: 'recoveryCodesComponent',
    templateUrl: './recovery-codes.component.html',
    imports: [LocalizePipe],
})
export class RecoveryCodesComponent extends AppComponentBase implements OnInit {
    readonly recoveryCodesComponent = viewChild<ModalDirective>('recoveryCodesComponent');

    public model: UpdateGoogleAuthenticatorKeyOutput;

    constructor(...args: unknown[]);

    constructor() {
        const injector = inject(Injector);

        super(injector);
    }

    ngOnInit(): void {
        this.model = new UpdateGoogleAuthenticatorKeyOutput();
    }
}
