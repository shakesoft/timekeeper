import { Component, Injector, inject, viewChild } from '@angular/core';
import { Table, TableModule } from 'primeng/table';
import { HostDashboardServiceProxy, GetRecentTenantsOutput } from '@shared/service-proxies/service-proxies';
import { WidgetComponentBaseComponent } from '../widget-component-base';

import { ScrollViewport, NgScrollbarExt, NgScrollbarModule } from 'ngx-scrollbar';
import { BusyIfDirective } from '../../../../../../shared/utils/busy-if.directive';
import { LuxonFormatPipe } from '../../../../../../shared/utils/luxon-format.pipe';
import { LocalizePipe } from '@shared/common/pipes/localize.pipe';

@Component({
    selector: 'app-widget-recent-tenants',
    templateUrl: './widget-recent-tenants.component.html',
    styleUrls: ['./widget-recent-tenants.component.css'],
    imports: [ScrollViewport, BusyIfDirective, NgScrollbarModule, TableModule, LuxonFormatPipe, LocalizePipe],
})
export class WidgetRecentTenantsComponent extends WidgetComponentBaseComponent {
    private _hostDashboardServiceProxy = inject(HostDashboardServiceProxy);

    readonly recentTenantsTable = viewChild<Table>('RecentTenantsTable');

    loading = true;
    recentTenantsData: GetRecentTenantsOutput;

    constructor(...args: unknown[]);

    constructor() {
        const injector = inject(Injector);

        super(injector);
        this.loadRecentTenantsData();
    }

    loadRecentTenantsData() {
        this._hostDashboardServiceProxy.getRecentTenantsData().subscribe((data) => {
            this.recentTenantsData = data;
            this.loading = false;
        });
    }

    gotoAllRecentTenants(): void {
        window.open(
            abp.appPath +
                'app/admin/tenants?' +
                'creationDateStart=' +
                encodeURIComponent(this.recentTenantsData.tenantCreationStartDate.toString())
        );
    }
}
