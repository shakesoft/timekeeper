import { Component, OnInit, Injector, inject } from '@angular/core';
import { DashboardChartBase } from '../dashboard-chart-base';
import { TenantDashboardServiceProxy } from '@shared/service-proxies/service-proxies';
import { WidgetComponentBaseComponent } from '../widget-component-base';
import { NgScrollbar } from 'ngx-scrollbar';

class MemberActivityTable extends DashboardChartBase {
    memberActivities: Array<any>;

    constructor(private _dashboardService: TenantDashboardServiceProxy) {
        super();
    }

    init() {
        this.reload();
    }

    reload() {
        this.showLoading();
        this._dashboardService.getMemberActivity().subscribe((result) => {
            this.memberActivities = result.memberActivities;
            this.hideLoading();
        });
    }
}

@Component({
    selector: 'app-widget-member-activity',
    templateUrl: './widget-member-activity.component.html',
    styleUrls: ['./widget-member-activity.component.css'],
    imports: [NgScrollbar],
})
export class WidgetMemberActivityComponent extends WidgetComponentBaseComponent implements OnInit {
    private _dashboardService = inject(TenantDashboardServiceProxy);

    memberActivityTable: MemberActivityTable;

    constructor(...args: unknown[]);

    constructor() {
        const injector = inject(Injector);

        super(injector);
        this.memberActivityTable = new MemberActivityTable(this._dashboardService);
    }

    ngOnInit() {
        this.memberActivityTable.init();
    }
}
