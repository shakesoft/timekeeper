import { Injector, Component, ViewEncapsulation, OnInit, inject, input } from '@angular/core';
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import { DateTimeService } from '@app/shared/common/timing/date-time.service';
import { LogoService } from '@app/shared/common/logo/logo.service';

@Component({
    templateUrl: './default-logo.component.html',
    selector: 'default-logo',
    encapsulation: ViewEncapsulation.None,
    imports: [],
})
export class DefaultLogoComponent extends AppComponentBase implements OnInit {
    private _logoService = inject(LogoService);

    readonly customHrefClass = input('');

    defaultLogoUrl: string;
    defaultSmallLogoUrl: string;
    tenantLogoUrl: string;
    tenantSmallLogoUrl: string;

    constructor(...args: unknown[]);

    constructor() {
        const injector = inject(Injector);

        super(injector);
    }

    ngOnInit(): void {
        this.setLogoUrls();
    }

    private setLogoUrls(): void {
        this.defaultLogoUrl = this._logoService.getDefaultLogoUrl();
        this.defaultSmallLogoUrl = this._logoService.getDefaultLogoUrl(null, true);

        this.tenantLogoUrl = this._logoService.getLogoUrl();
        this.tenantSmallLogoUrl = this._logoService.getLogoUrl(null, true);
    }
}
