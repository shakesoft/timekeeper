import { Injector, Component, ViewEncapsulation, inject } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { LogoService } from '@app/shared/common/logo/logo.service';

@Component({
    templateUrl: './theme8-brand.component.html',
    selector: 'theme8-brand',
    encapsulation: ViewEncapsulation.None,
    imports: [],
})
export class Theme8BrandComponent extends AppComponentBase {
    private _logoService = inject(LogoService);

    defaultLogoUrl: string;
    tenantLogoUrl: string;

    constructor(...args: unknown[]);

    constructor() {
        const injector = inject(Injector);

        super(injector);
        this.defaultLogoUrl = this._logoService.getDefaultLogoUrl('dark');
        this.tenantLogoUrl = this._logoService.getLogoUrl('dark');
    }
}
