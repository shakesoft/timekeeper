import { Injector, Component, ViewEncapsulation, inject } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { LogoService } from '@app/shared/common/logo/logo.service';

@Component({
    templateUrl: './theme5-brand.component.html',
    selector: 'theme5-brand',
    encapsulation: ViewEncapsulation.None,
    imports: [],
})
export class Theme5BrandComponent extends AppComponentBase {
    private _logoService = inject(LogoService);

    defaultLogoUrl: string;
    defaultSmallLogoUrl: string;
    tenantLogoUrl: string;
    tenantSmallLogoUrl: string;

    constructor(...args: unknown[]);

    constructor() {
        const injector = inject(Injector);

        super(injector);
        this.defaultLogoUrl = this._logoService.getDefaultLogoUrl();
        this.defaultSmallLogoUrl = this._logoService.getDefaultLogoUrl(null, true);
        this.tenantLogoUrl = this._logoService.getLogoUrl();
        this.tenantSmallLogoUrl = this._logoService.getLogoUrl(null, true);
    }
}
