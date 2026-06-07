import { Component, ElementRef, Injector, Input, inject, output, viewChild } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import {
    ProfileServiceProxy,
    VerifyAuthenticatorCodeInput,
    VerifySmsCodeInputDto,
} from '@shared/service-proxies/service-proxies';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';
import { AppBsModalDirective } from '../../../../shared/common/appBsModal/app-bs-modal.directive';

import { FormsModule } from '@angular/forms';
import { AutoFocusDirective } from '../../../../shared/utils/auto-focus.directive';
import { ValidationMessagesComponent } from '../../../../shared/utils/validation-messages.component';
import { LocalizePipe } from '@shared/common/pipes/localize.pipe';

@Component({
    selector: 'verifyCodeModal',
    templateUrl: './verify-code-modal.component.html',
    imports: [AppBsModalDirective, FormsModule, AutoFocusDirective, ValidationMessagesComponent, LocalizePipe],
})
export class VerifyCodeModalComponent extends AppComponentBase {
    private _profileService = inject(ProfileServiceProxy);

    readonly modal = viewChild<ModalDirective>('verifyCodeModal');
    readonly modalSave = output<any>();

    public active = false;
    public saving = false;
    public verifyCodeInput: VerifyAuthenticatorCodeInput = new VerifyAuthenticatorCodeInput();

    constructor(...args: unknown[]);

    constructor() {
        const injector = inject(Injector);

        super(injector);
    }

    show(): void {
        this.active = true;
        this.modal().show();
    }

    close(): void {
        this.active = false;
        this.modal().hide();
    }

    save(): void {
        this.saving = true;
        this._profileService
            .verifyAuthenticatorCode(this.verifyCodeInput)
            .pipe(
                finalize(() => {
                    this.saving = false;
                    this.verifyCodeInput.code = '';
                })
            )
            .subscribe(() => {
                this.close();
                // TODO: The 'emit' function requires a mandatory any argument
                this.modalSave.emit(null);
            });
    }
}
