import { Injector, Component, ViewEncapsulation, inject, input } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { LogoService } from '@app/shared/common/logo/logo.service';

@Component({
    templateUrl: './theme13-brand.component.html',
    selector: 'theme13-brand',
    encapsulation: ViewEncapsulation.None,
    imports: [],
})
export class Theme13BrandComponent extends AppComponentBase {
    private _logoService = inject(LogoService);

    readonly anchorClass = input('');
    readonly imageClass = input('h-25px logo');

    defaultLogoUrl: string;
    tenantLogoUrl: string;

    constructor(...args: unknown[]);

    constructor() {
        const injector = inject(Injector);

        super(injector);
        this.defaultLogoUrl = this._logoService.getDefaultLogoUrl('dark');
        this.tenantLogoUrl = this._logoService.getLogoUrl('dark');
    }

    triggerAsideToggleClickEvent(): void {
        abp.event.trigger('app.kt_aside_toggler.onClick');
    }
}
