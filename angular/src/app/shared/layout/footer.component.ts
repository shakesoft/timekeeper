import { Component, Injector, OnInit, inject, input } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppConsts } from '@shared/AppConsts';
import { ThemeAssetContributorFactory } from '@shared/helpers/ThemeAssetContributorFactory';

@Component({
    templateUrl: './footer.component.html',
    selector: 'footer-bar',
    imports: [],
})
export class FooterComponent extends AppComponentBase implements OnInit {
    readonly useBottomDiv = input(true);

    releaseDate: string;
    webAppGuiVersion: string;
    footerStyle = 'footer py-4 d-flex flex-lg-column';

    constructor(...args: unknown[]);

    constructor() {
        const injector = inject(Injector);

        super(injector);
    }

    ngOnInit(): void {
        this.releaseDate = this.appSession.application.releaseDate.toFormat('yyyyLLdd');
        this.webAppGuiVersion = AppConsts.WebAppGuiVersion;

        let themeAssetContributor = ThemeAssetContributorFactory.getCurrent();
        if (themeAssetContributor) {
            this.footerStyle = themeAssetContributor.getFooterStyle();
        }
    }
}
