import { Component, ElementRef, Injector, Input, OnInit, inject, output, viewChild } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import {
    ProfileServiceProxy,
    UpdateGoogleAuthenticatorKeyOutput,
    VerifyAuthenticatorCodeInput,
    VerifySmsCodeInputDto,
} from '@shared/service-proxies/service-proxies';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';
import { RecoveryCodesComponent } from './recovery-codes.component';
import { VerifyCodeModalComponent } from './verify-code-modal.component';
import { AppBsModalDirective } from '../../../../shared/common/appBsModal/app-bs-modal.directive';
import { LocalizePipe } from '@shared/common/pipes/localize.pipe';

@Component({
    selector: 'viewRecoveryCodesModal',
    templateUrl: './view-recovery-codes-modal.component.html',
    imports: [AppBsModalDirective, RecoveryCodesComponent, VerifyCodeModalComponent, LocalizePipe],
})
export class ViewRecoveryCodesModalComponent extends AppComponentBase {
    private _profileService = inject(ProfileServiceProxy);

    readonly modal = viewChild<ModalDirective>('viewRecoveryCodesModal');
    readonly verifyCodeModal = viewChild<VerifyCodeModalComponent>('verifyCodeModal');
    readonly recoveryCodesComponent = viewChild<RecoveryCodesComponent>('recoveryCodesComponent');
    readonly modalSave = output<any>();

    public active = false;
    public saving = false;

    constructor(...args: unknown[]);

    constructor() {
        const injector = inject(Injector);

        super(injector);
    }

    show(): void {
        this.verifyCodeModal().show();
    }

    close(): void {
        this.active = false;
        this.modal().hide();
    }

    showRecoveryCodes(verifyCodeInput: VerifyAuthenticatorCodeInput): void {
        this.saving = true;
        this._profileService
            .viewRecoveryCodes(verifyCodeInput)
            .pipe(
                finalize(() => {
                    this.saving = false;
                })
            )
            .subscribe((result: UpdateGoogleAuthenticatorKeyOutput) => {
                this.recoveryCodesComponent().model = result;
                this.modal().show();
                // TODO: The 'emit' function requires a mandatory any argument
                this.modalSave.emit(null);
            });
    }
}
