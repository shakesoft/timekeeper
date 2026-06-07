import { Component, Injector, OnInit, inject, viewChild } from '@angular/core';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AbpLoginResultType, UserLoginServiceProxy } from '@shared/service-proxies/service-proxies';
import { Table, TableModule } from 'primeng/table';
import { filter as _filter } from 'lodash-es';
import { finalize } from 'rxjs/operators';
import { DateTimeService } from '@app/shared/common/timing/date-time.service';
import { DateTime } from 'luxon';
import { LazyLoadEvent } from 'primeng/api';
import { Paginator, PaginatorModule } from 'primeng/paginator';
import { PrimengTableHelper } from 'shared/helpers/PrimengTableHelper';
import { SubHeaderComponent } from '../../shared/common/sub-header/sub-header.component';
import { FormsModule } from '@angular/forms';
import { BsDaterangepickerInputDirective, BsDaterangepickerDirective } from 'ngx-bootstrap/datepicker';
import { DateRangePickerLuxonModifierDirective } from '../../../shared/utils/date-time/date-range-picker-luxon-modifier.directive';
import { LoginResultTypeComboComponent } from './login-result-type.combo';
import { BusyIfDirective } from '../../../shared/utils/busy-if.directive';

import { LuxonFormatPipe } from '../../../shared/utils/luxon-format.pipe';
import { LocalizePipe } from '@shared/common/pipes/localize.pipe';

@Component({
    templateUrl: './login-attempts.component.html',
    animations: [appModuleAnimation()],
    imports: [
        SubHeaderComponent,
        FormsModule,
        BsDaterangepickerInputDirective,
        BsDaterangepickerDirective,
        DateRangePickerLuxonModifierDirective,
        LoginResultTypeComboComponent,
        BusyIfDirective,
        TableModule,
        PaginatorModule,
        LuxonFormatPipe,
        LocalizePipe,
    ],
})
export class LoginAttemptsComponent extends AppComponentBase implements OnInit {
    private _dateTimeService = inject(DateTimeService);
    private _userLoginService = inject(UserLoginServiceProxy);

    readonly dataTable = viewChild<Table>('dataTable');
    readonly paginator = viewChild<Paginator>('paginator');

    public filter: string;
    public dateRange: DateTime[] = [
        this._dateTimeService.getStartOfWeek().toDateTime(),
        this._dateTimeService.getEndOfDay().toDateTime(),
    ];

    public loginResultFilter: AbpLoginResultType;

    primengTableHelper = new PrimengTableHelper();

    constructor(...args: unknown[]);

    constructor() {
        const injector = inject(Injector);

        super(injector);
    }

    ngOnInit(): void {
        this.loginResultFilter = '' as any;
    }

    getLoginAttempts(event?: LazyLoadEvent): void {
        this.primengTableHelper.showLoadingIndicator();

        this._userLoginService
            .getUserLoginAttempts(
                this.filter,
                this._dateTimeService.getStartOfDayForDate(this.dateRange[0]).toDateTime(),
                this._dateTimeService.getEndOfDayForDate(this.dateRange[1]).toDateTime(),
                this.loginResultFilter,
                this.primengTableHelper.getSorting(this.dataTable()),
                this.primengTableHelper.getMaxResultCount(this.paginator(), event),
                this.primengTableHelper.getSkipCount(this.paginator(), event)
            )
            .pipe(finalize(() => this.primengTableHelper.hideLoadingIndicator()))
            .subscribe((result) => {
                this.primengTableHelper.records = result.items;
                this.primengTableHelper.totalRecordsCount = result.totalCount;
                this.primengTableHelper.hideLoadingIndicator();
            });
    }
}
