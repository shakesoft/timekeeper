import { Component, Injector, OnInit, inject, viewChild } from '@angular/core';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { Router } from '@angular/router';
import { AppComponentBase } from '@shared/common/app-component-base';
import {
    RoleListDto,
    RoleServiceProxy,
    PermissionServiceProxy,
    FlatPermissionDto,
    GetRolesInput,
} from '@shared/service-proxies/service-proxies';
import { Table, TableModule } from 'primeng/table';
import { CreateOrEditRoleModalComponent } from './create-or-edit-role-modal.component';
import { filter as _filter } from 'lodash-es';
import { finalize } from 'rxjs/operators';
import { PermissionTreeModalComponent } from '../shared/permission-tree-modal.component';
import { SubHeaderComponent } from '../../shared/common/sub-header/sub-header.component';

import { BusyIfDirective } from '../../../shared/utils/busy-if.directive';
import { BsDropdownDirective, BsDropdownToggleDirective, BsDropdownMenuDirective } from 'ngx-bootstrap/dropdown';
import { TooltipDirective } from 'ngx-bootstrap/tooltip';
import { LuxonFormatPipe } from '../../../shared/utils/luxon-format.pipe';
import { LocalizePipe } from '@shared/common/pipes/localize.pipe';
import { PermissionPipe } from '@shared/common/pipes/permission.pipe';
import { PermissionAnyPipe } from '@shared/common/pipes/permission-any.pipe';

@Component({
    templateUrl: './roles.component.html',
    animations: [appModuleAnimation()],
    imports: [
        SubHeaderComponent,
        PermissionTreeModalComponent,
        BusyIfDirective,
        TableModule,
        BsDropdownDirective,
        BsDropdownToggleDirective,
        BsDropdownMenuDirective,
        TooltipDirective,
        CreateOrEditRoleModalComponent,
        LuxonFormatPipe,
        LocalizePipe,
        PermissionPipe,
        PermissionAnyPipe,
    ],
})
export class RolesComponent extends AppComponentBase implements OnInit {
    private _roleService = inject(RoleServiceProxy);
    private _router = inject(Router);

    readonly createOrEditRoleModal = viewChild<CreateOrEditRoleModalComponent>('createOrEditRoleModal');
    readonly dataTable = viewChild<Table>('dataTable');
    readonly permissionFilterTreeModal = viewChild<PermissionTreeModalComponent>('permissionFilterTreeModal');

    _entityTypeFullName = 'CadentManagement.Authorization.Roles.Role';
    entityHistoryEnabled = false;

    constructor(...args: unknown[]);

    constructor() {
        const injector = inject(Injector);

        super(injector);
    }

    ngOnInit(): void {
        this.setIsEntityHistoryEnabled();
    }

    getRoles(): void {
        this.primengTableHelper.showLoadingIndicator();
        let selectedPermissions = this.permissionFilterTreeModal().getSelectedPermissions();

        this._roleService
            .getRoles(new GetRolesInput({ permissions: selectedPermissions }))
            .pipe(finalize(() => this.primengTableHelper.hideLoadingIndicator()))
            .subscribe((result) => {
                this.primengTableHelper.records = result.items;
                this.primengTableHelper.totalRecordsCount = result.items.length;
                this.primengTableHelper.hideLoadingIndicator();
            });
    }

    createRole(): void {
        this.createOrEditRoleModal().show();
    }

    showHistory(role: RoleListDto): void {
        this._router.navigate([abp.appPath + `app/admin/entity-changes/${role.id}/${this._entityTypeFullName}`]);
    }

    deleteRole(role: RoleListDto): void {
        let self = this;
        self.message.confirm(
            self.l('RoleDeleteWarningMessage', role.displayName),
            this.l('AreYouSure'),
            (isConfirmed) => {
                if (isConfirmed) {
                    this._roleService.deleteRole(role.id).subscribe(() => {
                        this.getRoles();
                        abp.notify.success(this.l('SuccessfullyDeleted'));
                    });
                }
            }
        );
    }

    private setIsEntityHistoryEnabled(): void {
        let customSettings = (abp as any).custom;
        this.entityHistoryEnabled =
            customSettings.EntityHistory &&
            customSettings.EntityHistory.isEnabled &&
            _filter(
                customSettings.EntityHistory.enabledEntities,
                (entityType) => entityType === this._entityTypeFullName
            ).length === 1;
    }
}
