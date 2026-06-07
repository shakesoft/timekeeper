import { Injector, Component, ViewEncapsulation, inject } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { LogoService } from '@app/shared/common/logo/logo.service';

@Component({
    templateUrl: './theme11-brand.component.html',
    selector: 'theme11-brand',
    encapsulation: ViewEncapsulation.None,
    imports: [],
})
export class Theme11BrandComponent extends AppComponentBase {
    private _logoService = inject(LogoService);

    defaultLogoUrl: string;
    tenantLogoUrl: string;

    constructor(...args: unknown[]);

    constructor() {
        const injector = inject(Injector);

        super(injector);
        this.tenantLogoUrl = this._logoService.getLogoUrl();
        this.defaultLogoUrl = this._logoService.getDefaultLogoUrl();
    }
}
