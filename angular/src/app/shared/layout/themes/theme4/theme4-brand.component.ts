import { Injector, Component, ViewEncapsulation, inject, input } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { LogoService } from '@app/shared/common/logo/logo.service';

@Component({
    templateUrl: './theme4-brand.component.html',
    selector: 'theme4-brand',
    encapsulation: ViewEncapsulation.None,
    imports: [],
})
export class Theme4BrandComponent extends AppComponentBase {
    private _logoService = inject(LogoService);

    readonly customStyle = input('h-55px');

    defaultSmallLogoUrl: string;
    tenantSmallLogoUrl: string;

    constructor(...args: unknown[]);

    constructor() {
        const injector = inject(Injector);

        super(injector);
        this.defaultSmallLogoUrl = this._logoService.getDefaultLogoUrl(null, true);
        this.tenantSmallLogoUrl = this._logoService.getLogoUrl(null, true);
    }
}
