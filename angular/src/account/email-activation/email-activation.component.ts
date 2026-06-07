import { AfterViewInit, Component, Injector, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { accountModuleAnimation } from '@shared/animations/routerTransition';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AccountServiceProxy, SendEmailActivationLinkInput } from '@shared/service-proxies/service-proxies';
import { finalize } from 'rxjs/operators';
import { ReCaptchaV3WrapperService } from '@account/shared/recaptchav3-wrapper.service';
import { FormsModule } from '@angular/forms';
import { ValidationMessagesComponent } from '../../shared/utils/validation-messages.component';
import { ButtonBusyDirective } from '../../shared/utils/button-busy.directive';
import { LocalizePipe } from '@shared/common/pipes/localize.pipe';

@Component({
    templateUrl: './email-activation.component.html',
    animations: [accountModuleAnimation()],
    imports: [FormsModule, ValidationMessagesComponent, RouterLink, ButtonBusyDirective, LocalizePipe],
})
export class EmailActivationComponent extends AppComponentBase implements AfterViewInit {
    private _accountService = inject(AccountServiceProxy);
    private _router = inject(Router);
    private _recaptchaWrapperService = inject(ReCaptchaV3WrapperService);

    model: SendEmailActivationLinkInput = new SendEmailActivationLinkInput();
    saving = false;

    constructor(...args: unknown[]);

    constructor() {
        const injector = inject(Injector);

        super(injector);
    }

    ngAfterViewInit(): void {
        this._recaptchaWrapperService.setCaptchaVisibilityOnEmailActivation();
    }

    save(): void {
        let recaptchaCallback = (token: string) => {
            this.saving = true;
            this.model.captchaResponse = token;
            this._accountService
                .sendEmailActivationLink(this.model)
                .pipe(
                    finalize(() => {
                        this.saving = false;
                    })
                )
                .subscribe(() => {
                    this.message
                        .success(this.l('ActivationMailSentIfEmailAssociatedMessage'), this.l('MailSent'))
                        .then(() => {
                            this._router.navigate(['account/login']);
                        });
                });
        };

        if (this._recaptchaWrapperService.useCaptchaOnEmailActivation()) {
            this._recaptchaWrapperService
                .getService()
                .execute('emailActivation')
                .subscribe((token) => recaptchaCallback(token));
        } else {
            recaptchaCallback(null);
        }
    }
}
