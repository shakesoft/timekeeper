import { Component, Injector, inject, viewChild } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import {
    EntityDtoOfInt64,
    UpdateUserPermissionsInput,
    UserServiceProxy,
} from '@shared/service-proxies/service-proxies';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { PermissionTreeComponent } from '../shared/permission-tree.component';
import { finalize } from 'rxjs/operators';
import { AppBsModalDirective } from '../../../shared/common/appBsModal/app-bs-modal.directive';
import { FormsModule } from '@angular/forms';

import { ButtonBusyDirective } from '../../../shared/utils/button-busy.directive';
import { TooltipDirective } from 'ngx-bootstrap/tooltip';
import { LocalizePipe } from '@shared/common/pipes/localize.pipe';

@Component({
    selector: 'editUserPermissionsModal',
    templateUrl: './edit-user-permissions-modal.component.html',
    imports: [
        AppBsModalDirective,
        FormsModule,
        PermissionTreeComponent,
        ButtonBusyDirective,
        TooltipDirective,
        LocalizePipe,
    ],
})
export class EditUserPermissionsModalComponent extends AppComponentBase {
    private _userService = inject(UserServiceProxy);

    readonly modal = viewChild<ModalDirective>('editModal');
    readonly permissionTree = viewChild<PermissionTreeComponent>('permissionTree');

    saving = false;
    resettingPermissions = false;

    userId: number;
    userName: string;

    constructor(...args: unknown[]);

    constructor() {
        const injector = inject(Injector);

        super(injector);
    }

    show(userId: number, userName?: string): void {
        this.userId = userId;
        this.userName = userName;

        const tree = this.permissionTree();
        this._userService.getUserPermissionsForEdit(userId).subscribe((result) => {
            tree.editData = result;
            tree.filter = '';
            this.modal().show();
        });
    }

    save(): void {
        let input = new UpdateUserPermissionsInput();

        input.id = this.userId;
        input.grantedPermissionNames = this.permissionTree().getGrantedPermissionNames();

        this.saving = true;
        this._userService
            .updateUserPermissions(input)
            .pipe(
                finalize(() => {
                    this.saving = false;
                })
            )
            .subscribe(() => {
                this.notify.info(this.l('SavedSuccessfully'));
                this.close();
            });
    }

    resetPermissions(): void {
        let input = new EntityDtoOfInt64();

        input.id = this.userId;

        this.resettingPermissions = true;
        this._userService.resetUserSpecificPermissions(input).subscribe({
            next: () => {
                this.notify.info(this.l('ResetSuccessfully'));
                this._userService.getUserPermissionsForEdit(this.userId).subscribe((result) => {
                    this.permissionTree().editData = result;
                });
            },
            complete: () => {
                this.resettingPermissions = false;
            },
        });
    }

    close(): void {
        this.modal().hide();
    }
}
