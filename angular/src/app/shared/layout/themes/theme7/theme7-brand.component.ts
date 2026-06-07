import { Injector, Component, ViewEncapsulation, inject, input } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { LogoService } from '@app/shared/common/logo/logo.service';

@Component({
    templateUrl: './theme7-brand.component.html',
    selector: 'theme7-brand',
    encapsulation: ViewEncapsulation.None,
    imports: [],
})
export class Theme7BrandComponent extends AppComponentBase {
    private _logoService = inject(LogoService);

    readonly imageClass = input('h-35px');

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
