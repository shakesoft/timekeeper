import { Injector, Component, ViewEncapsulation, DOCUMENT, inject, input } from '@angular/core';

import { AppComponentBase } from '@shared/common/app-component-base';

import { LogoService } from '@app/shared/common/logo/logo.service';

@Component({
    templateUrl: './theme3-brand.component.html',
    selector: 'theme3-brand',
    encapsulation: ViewEncapsulation.None,
    imports: [],
})
export class Theme3BrandComponent extends AppComponentBase {
    private document = inject<Document>(DOCUMENT);
    private _logoService = inject(LogoService);

    readonly logoSize = input('');

    defaultLogoUrl: string;
    tenantLogoUrl: string;

    constructor(...args: unknown[]);

    constructor() {
        const injector = inject(Injector);

        super(injector);
        this.defaultLogoUrl = this._logoService.getDefaultLogoUrl();
        this.tenantLogoUrl = this._logoService.getLogoUrl();
    }

    clickTopbarToggle(): void {
        this.document.body.classList.toggle('topbar-mobile-on');
    }

    clickLeftAsideHideToggle(): void {
        this.document.body.classList.toggle('header-menu-wrapper-on');
    }
}
