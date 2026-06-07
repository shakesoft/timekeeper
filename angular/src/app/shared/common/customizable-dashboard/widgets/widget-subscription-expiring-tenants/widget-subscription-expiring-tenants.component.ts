import { Component, OnInit, Injector, inject, viewChild } from '@angular/core';
import { Table, TableModule } from 'primeng/table';
import { HostDashboardServiceProxy, GetExpiringTenantsOutput } from '@shared/service-proxies/service-proxies';
import { WidgetComponentBaseComponent } from '../widget-component-base';

import { NgScrollbar } from 'ngx-scrollbar';
import { BusyIfDirective } from '../../../../../../shared/utils/busy-if.directive';
import { LocalizePipe } from '@shared/common/pipes/localize.pipe';

@Component({
    selector: 'app-widget-subscription-expiring-tenants',
    templateUrl: './widget-subscription-expiring-tenants.component.html',
    styleUrls: ['./widget-subscription-expiring-tenants.component.css'],
    imports: [NgScrollbar, BusyIfDirective, TableModule, LocalizePipe],
})
export class WidgetSubscriptionExpiringTenantsComponent extends WidgetComponentBaseComponent implements OnInit {
    private _hostDashboardServiceProxy = inject(HostDashboardServiceProxy);

    readonly expiringTenantsTable = viewChild<Table>('ExpiringTenantsTable');

    dataLoading = true;
    expiringTenantsData: GetExpiringTenantsOutput;

    constructor(...args: unknown[]);

    constructor() {
        const injector = inject(Injector);

        super(injector);
    }

    ngOnInit() {
        this.getData();
    }

    getData() {
        this._hostDashboardServiceProxy.getSubscriptionExpiringTenantsData().subscribe((data) => {
            this.expiringTenantsData = data;
            this.dataLoading = false;
        });
    }

    gotoAllExpiringTenants(): void {
        const url =
            abp.appPath +
            'app/admin/tenants?' +
            'subscriptionEndDateStart=' +
            encodeURIComponent(this.expiringTenantsData.subscriptionEndDateStart.toString()) +
            '&' +
            'subscriptionEndDateEnd=' +
            encodeURIComponent(this.expiringTenantsData.subscriptionEndDateEnd.toString());

        window.open(url);
    }
}
