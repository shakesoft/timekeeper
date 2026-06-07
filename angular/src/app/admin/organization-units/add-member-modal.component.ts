import { Component, Injector, inject, output, viewChild } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import {
    FindOrganizationUnitUsersInput,
    FindOrganizationUnitUsersOutputDto,
    NameValueDto,
    OrganizationUnitServiceProxy,
    UsersToOrganizationUnitInput,
} from '@shared/service-proxies/service-proxies';
import { map as _map } from 'lodash-es';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { LazyLoadEvent } from 'primeng/api';
import { Paginator, PaginatorModule } from 'primeng/paginator';
import { Table, TableModule } from 'primeng/table';
import { IUsersWithOrganizationUnit } from './users-with-organization-unit';
import { finalize } from 'rxjs/operators';
import { AppBsModalDirective } from '../../../shared/common/appBsModal/app-bs-modal.directive';
import { FormsModule } from '@angular/forms';
import { AutoFocusDirective } from '../../../shared/utils/auto-focus.directive';
import { BusyIfDirective } from '../../../shared/utils/busy-if.directive';

import { ButtonBusyDirective } from '../../../shared/utils/button-busy.directive';
import { LocalizePipe } from '@shared/common/pipes/localize.pipe';

@Component({
    selector: 'addMemberModal',
    templateUrl: './add-member-modal.component.html',
    imports: [
        AppBsModalDirective,
        FormsModule,
        AutoFocusDirective,
        BusyIfDirective,
        TableModule,
        PaginatorModule,
        ButtonBusyDirective,
        LocalizePipe,
    ],
})
export class AddMemberModalComponent extends AppComponentBase {
    private _organizationUnitService = inject(OrganizationUnitServiceProxy);

    readonly membersAdded = output<IUsersWithOrganizationUnit>();
    readonly modal = viewChild<ModalDirective>('modal');
    readonly dataTable = viewChild<Table>('dataTable');
    readonly paginator = viewChild<Paginator>('paginator');

    organizationUnitId: number;

    isShown = false;
    filterText = '';
    tenantId?: number;
    saving = false;
    selectedMembers: FindOrganizationUnitUsersOutputDto[];

    constructor(...args: unknown[]);

    constructor() {
        const injector = inject(Injector);

        super(injector);
    }

    show(): void {
        this.modal().show();
    }

    refreshTable(): void {
        this.paginator().changePage(this.paginator().getPage());
        this.shown();
    }

    close(): void {
        this.modal().hide();
    }

    shown(): void {
        this.isShown = true;
        this.getRecordsIfNeeds(null);
    }

    getRecordsIfNeeds(event: LazyLoadEvent): void {
        if (!this.isShown) {
            return;
        }

        this.getRecords(event);
    }

    getRecords(event?: LazyLoadEvent): void {
        if (this.primengTableHelper.shouldResetPaging(event)) {
            this.paginator().changePage(0);

            if (this.primengTableHelper.records && this.primengTableHelper.records.length > 0) {
                return;
            }
        }

        this.primengTableHelper.showLoadingIndicator();

        const input = new FindOrganizationUnitUsersInput();
        input.organizationUnitId = this.organizationUnitId;
        input.filter = this.filterText;
        input.skipCount = this.primengTableHelper.getSkipCount(this.paginator(), event);
        input.maxResultCount = this.primengTableHelper.getMaxResultCount(this.paginator(), event);

        this._organizationUnitService
            .findUsers(input)
            .pipe(finalize(() => this.primengTableHelper.hideLoadingIndicator()))
            .subscribe((result) => {
                this.primengTableHelper.totalRecordsCount = result.totalCount;
                this.primengTableHelper.records = result.items;
                this.primengTableHelper.hideLoadingIndicator();
            });
    }

    addUsersToOrganizationUnit(): void {
        const input = new UsersToOrganizationUnitInput();
        input.organizationUnitId = this.organizationUnitId;
        input.userIds = _map(this.selectedMembers, (selectedMember) => Number(selectedMember.id));
        this.saving = true;
        this._organizationUnitService.addUsersToOrganizationUnit(input).subscribe(() => {
            this.notify.success(this.l('SuccessfullyAdded'));
            this.membersAdded.emit({
                userIds: input.userIds,
                ouId: input.organizationUnitId,
            });
            this.saving = false;
            this.close();
            this.selectedMembers = [];
        });
    }
}
