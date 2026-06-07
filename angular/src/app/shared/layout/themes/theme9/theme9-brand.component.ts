import { Injector, Component, ViewEncapsulation, inject, input } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { LogoService } from '@app/shared/common/logo/logo.service';

@Component({
    templateUrl: './theme9-brand.component.html',
    selector: 'theme9-brand',
    encapsulation: ViewEncapsulation.None,
    imports: [],
})
export class Theme9BrandComponent extends AppComponentBase {
    private _logoService = inject(LogoService);

    readonly imageClass = input('h-40px');

    defaultLogoUrl: string;
    tenantLogoUrl: string;

    constructor(...args: unknown[]);

    constructor() {
        const injector = inject(Injector);

        super(injector);
        this.defaultLogoUrl = this._logoService.getDefaultLogoUrl();
        this.tenantLogoUrl = this._logoService.getLogoUrl();
    }
}
