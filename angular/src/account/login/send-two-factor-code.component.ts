import { Component, Injector, OnInit, inject } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { accountModuleAnimation } from '@shared/animations/routerTransition';
import { AppComponentBase } from '@shared/common/app-component-base';
import { SendTwoFactorAuthCodeModel, TokenAuthServiceProxy } from '@shared/service-proxies/service-proxies';
import { LoginService } from './login.service';
import { finalize } from 'rxjs/operators';
import { ValidateTwoFactorCodeComponent } from '@account/login/validate-two-factor-code.component';

import { FormsModule } from '@angular/forms';
import { AutoFocusDirective } from '../../shared/utils/auto-focus.directive';
import { LocalizePipe } from '@shared/common/pipes/localize.pipe';

@Component({
    templateUrl: './send-two-factor-code.component.html',
    animations: [accountModuleAnimation()],
    imports: [FormsModule, AutoFocusDirective, LocalizePipe],
})
export class SendTwoFactorCodeComponent extends AppComponentBase implements CanActivate, OnInit {
    private _tokenAuthService = inject(TokenAuthServiceProxy);
    private _router = inject(Router);

    loginService = inject(LoginService);

    selectedTwoFactorProvider: string;
    submitting = false;

    constructor(...args: unknown[]);

    constructor() {
        const injector = inject(Injector);

        super(injector);
    }

    canActivate(): boolean {
        if (
            this.loginService.authenticateModel &&
            this.loginService.authenticateResult &&
            this.loginService.authenticateResult.twoFactorAuthProviders &&
            this.loginService.authenticateResult.twoFactorAuthProviders.length
        ) {
            return true;
        }

        return false;
    }

    ngOnInit(): void {
        if (!this.canActivate()) {
            this._router.navigate(['account/login']);
            return;
        }

        this.selectedTwoFactorProvider = this.loginService.authenticateResult.twoFactorAuthProviders[0];
    }

    submit(): void {
        const model = new SendTwoFactorAuthCodeModel();
        model.userId = this.loginService.authenticateResult.userId;
        model.provider = this.selectedTwoFactorProvider;

        this.submitting = true;
        this._tokenAuthService
            .sendTwoFactorAuthCode(model)
            .pipe(finalize(() => (this.submitting = false)))
            .subscribe(() => {
                this._router.navigate(['account/verify-code']);
            });
    }
}
