import { Component, ElementRef, Injector, inject, output, viewChild } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { CreateOrUpdateRoleInput, RoleEditDto, RoleServiceProxy } from '@shared/service-proxies/service-proxies';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { PermissionTreeComponent } from '../shared/permission-tree.component';
import { finalize } from 'rxjs/operators';
import { AppBsModalDirective } from '../../../shared/common/appBsModal/app-bs-modal.directive';

import { FormsModule } from '@angular/forms';
import { TabsetComponent, TabDirective } from 'ngx-bootstrap/tabs';
import { ValidationMessagesComponent } from '../../../shared/utils/validation-messages.component';
import { ButtonBusyDirective } from '../../../shared/utils/button-busy.directive';
import { LocalizePipe } from '@shared/common/pipes/localize.pipe';

@Component({
    selector: 'createOrEditRoleModal',
    templateUrl: './create-or-edit-role-modal.component.html',
    imports: [
        AppBsModalDirective,
        FormsModule,
        TabsetComponent,
        TabDirective,
        ValidationMessagesComponent,
        PermissionTreeComponent,
        ButtonBusyDirective,
        LocalizePipe,
    ],
})
export class CreateOrEditRoleModalComponent extends AppComponentBase {
    private _roleService = inject(RoleServiceProxy);

    readonly modal = viewChild<ModalDirective>('createOrEditModal');
    readonly permissionTree = viewChild<PermissionTreeComponent>('permissionTree');

    readonly modalSave = output<any>();

    active = false;
    saving = false;

    role: RoleEditDto = new RoleEditDto();

    constructor(...args: unknown[]);
    constructor() {
        const injector = inject(Injector);

        super(injector);
    }

    show(roleId?: number): void {
        const self = this;
        self.active = true;

        self._roleService.getRoleForEdit(roleId).subscribe((result) => {
            self.role = result.role;
            this.permissionTree().editData = result;

            self.modal().show();
        });
    }

    onShown(): void {
        document.getElementById('RoleDisplayName').focus();
    }

    save(): void {
        const self = this;

        const input = new CreateOrUpdateRoleInput();
        input.role = self.role;
        input.grantedPermissionNames = self.permissionTree().getGrantedPermissionNames();

        this.saving = true;
        this._roleService
            .createOrUpdateRole(input)
            .pipe(finalize(() => (this.saving = false)))
            .subscribe(() => {
                this.notify.info(this.l('SavedSuccessfully'));
                this.close();
                this.modalSave.emit(null);
            });
    }

    close(): void {
        this.active = false;
        this.modal().hide();
    }
}
