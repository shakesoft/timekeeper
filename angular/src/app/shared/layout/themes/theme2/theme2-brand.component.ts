import { Injector, Component, ViewEncapsulation, inject } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { LogoService } from '@app/shared/common/logo/logo.service';

@Component({
    templateUrl: './theme2-brand.component.html',
    selector: 'theme2-brand',
    encapsulation: ViewEncapsulation.None,
    imports: [],
})
export class Theme2BrandComponent extends AppComponentBase {
    private _logoService = inject(LogoService);

    defaultLogoUrl: string;
    defaultSmallLogoUrl: string;
    tenantLogoUrl: string;
    tenantSmallLogoUrl: string;

    constructor(...args: unknown[]);

    constructor() {
        const injector = inject(Injector);

        super(injector);

        this.defaultLogoUrl = this._logoService.getDefaultLogoUrl('dark', false);
        this.defaultSmallLogoUrl = this._logoService.getDefaultLogoUrl('dark', true);
        this.tenantLogoUrl = this._logoService.getLogoUrl();
        this.tenantSmallLogoUrl = this._logoService.getLogoUrl(null, true);
    }
}
