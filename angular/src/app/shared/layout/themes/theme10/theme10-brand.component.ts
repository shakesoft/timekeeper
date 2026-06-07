import { Injector, Component, ViewEncapsulation, inject } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { LogoService } from '@app/shared/common/logo/logo.service';

@Component({
    templateUrl: './theme10-brand.component.html',
    selector: 'theme10-brand',
    encapsulation: ViewEncapsulation.None,
    imports: [],
})
export class Theme10BrandComponent extends AppComponentBase {
    private _logoService = inject(LogoService);

    tenantLogoUrl: string;
    defaultLogoUrl: string;

    constructor(...args: unknown[]);

    constructor() {
        const injector = inject(Injector);

        super(injector);

        this.tenantLogoUrl = this._logoService.getLogoUrl();
        this.defaultLogoUrl = this._logoService.getDefaultLogoUrl();
    }
}
