import { Component, Injector, OnInit, ViewEncapsulation, inject, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { AppComponentBase } from '@shared/common/app-component-base';
import {
    EntityDto,
    GetRateLimitPoliciesInput,
    RateLimitAlgorithm,
    RateLimitPartitionType,
    RateLimitPolicyDto,
    RateLimitPolicyServiceProxy,
} from '@shared/service-proxies/service-proxies';
import { LazyLoadEvent } from 'primeng/api';
import { Paginator, PaginatorModule } from 'primeng/paginator';
import { Table, TableModule } from 'primeng/table';
import { BsDropdownDirective, BsDropdownToggleDirective, BsDropdownMenuDirective } from 'ngx-bootstrap/dropdown';
import { finalize } from 'rxjs/operators';
import { SubHeaderComponent } from '../../shared/common/sub-header/sub-header.component';
import { BusyIfDirective } from '../../../shared/utils/busy-if.directive';
import { LocalizePipe } from '@shared/common/pipes/localize.pipe';
import { PermissionPipe } from '@shared/common/pipes/permission.pipe';
import { PermissionAnyPipe } from '@shared/common/pipes/permission-any.pipe';
import { CreateOrEditRateLimitPolicyModalComponent } from './create-or-edit-rate-limit-policy-modal.component';

@Component({
    templateUrl: './rate-limiting.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()],
    imports: [
        SubHeaderComponent,
        BusyIfDirective,
        FormsModule,
        TableModule,
        PaginatorModule,
        BsDropdownDirective,
        BsDropdownToggleDirective,
        BsDropdownMenuDirective,
        CreateOrEditRateLimitPolicyModalComponent,
        LocalizePipe,
        PermissionPipe,
        PermissionAnyPipe,
    ],
})
export class RateLimitingComponent extends AppComponentBase implements OnInit {
    private _rateLimitPolicyService = inject(RateLimitPolicyServiceProxy);

    readonly dataTable = viewChild<Table>('dataTable');
    readonly paginator = viewChild<Paginator>('paginator');

    filterText = '';
    isEnabled = false;

    // Enum name doubles as localization key (FixedWindow, ByClientIp, ...)
    readonly algorithmName = RateLimitAlgorithm;
    readonly partitionTypeName = RateLimitPartitionType;

    constructor() {
        const injector = inject(Injector);

        super(injector);
    }

    ngOnInit(): void {
        this._rateLimitPolicyService.getIsEnabled().subscribe((result) => (this.isEnabled = result));
    }

    setIsEnabled(isEnabled: boolean): void {
        this._rateLimitPolicyService.setIsEnabled(isEnabled).subscribe(() => {
            this.isEnabled = isEnabled;
            this.notify.success(this.l(isEnabled ? 'RateLimitingIsEnabled' : 'RateLimitingIsDisabled'));
        });
    }

    getPolicies(event?: LazyLoadEvent): void {
        if (this.primengTableHelper.shouldResetPaging(event)) {
            this.paginator().changePage(0);

            if (this.primengTableHelper.records && this.primengTableHelper.records.length > 0) {
                return;
            }
        }

        this.primengTableHelper.showLoadingIndicator();

        const input = new GetRateLimitPoliciesInput();
        input.filter = this.filterText;
        input.sorting = this.primengTableHelper.getSorting(this.dataTable());
        input.maxResultCount = this.primengTableHelper.getMaxResultCount(this.paginator(), event);
        input.skipCount = this.primengTableHelper.getSkipCount(this.paginator(), event);

        this._rateLimitPolicyService
            .getPolicies(input)
            .pipe(finalize(() => this.primengTableHelper.hideLoadingIndicator()))
            .subscribe((result) => {
                this.primengTableHelper.totalRecordsCount = result.totalCount;
                this.primengTableHelper.records = result.items;
            });
    }

    reloadPage(): void {
        this.paginator().changePage(this.paginator().getPage());
    }

    togglePolicyEnabled(policy: RateLimitPolicyDto): void {
        this._rateLimitPolicyService.togglePolicyEnabled(new EntityDto({ id: policy.id })).subscribe(() => {
            this.reloadPage();
            this.notify.success(this.l('SavedSuccessfully'));
        });
    }

    deletePolicy(policy: RateLimitPolicyDto): void {
        this.message.confirm(
            this.l('RateLimitPolicyDeleteWarningMessage', policy.name),
            this.l('AreYouSure'),
            (isConfirmed) => {
                if (isConfirmed) {
                    this._rateLimitPolicyService.delete(policy.id).subscribe(() => {
                        this.reloadPage();
                        this.notify.success(this.l('SuccessfullyDeleted'));
                    });
                }
            }
        );
    }
}
