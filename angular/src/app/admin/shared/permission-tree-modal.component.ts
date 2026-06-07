import { Component, Injector, OnInit, inject, input, output, viewChild } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { TreeNode } from 'primeng/api';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { PermissionTreeComponent } from './permission-tree.component';
import { PermissionServiceProxy, FlatPermissionDto } from '@shared/service-proxies/service-proxies';

import { AppBsModalDirective } from '../../../shared/common/appBsModal/app-bs-modal.directive';
import { LocalizePipe } from '@shared/common/pipes/localize.pipe';

@Component({
    selector: 'permission-tree-modal',
    templateUrl: './permission-tree-modal.component.html',
    imports: [AppBsModalDirective, PermissionTreeComponent, LocalizePipe],
})
export class PermissionTreeModalComponent extends AppComponentBase implements OnInit {
    private _permissionService = inject(PermissionServiceProxy);

    readonly dontAddOpenerButton = input<boolean>(undefined);
    readonly singleSelect = input<boolean>(undefined);
    readonly disableCascade = input<boolean>(undefined);
    readonly onModalclose = output<string[]>();

    readonly permissionTreeModal = viewChild<ModalDirective>('permissionTreeModal');
    readonly permissionTree = viewChild<PermissionTreeComponent>('permissionTree');

    selectedPermissions: TreeNode[] = [];
    NumberOfFilteredPermission = 0;

    constructor(...args: unknown[]);
    constructor() {
        const injector = inject(Injector);

        super(injector);
    }

    ngOnInit(): void {
        this.loadAllPermissionsToFilterTree();
    }

    openPermissionTreeModal(): void {
        this.permissionTreeModal().show();
    }

    closePermissionTreeModal(): void {
        let selections = this.getSelectedPermissions();
        this.NumberOfFilteredPermission = selections.length;

        this.onModalclose.emit(selections);
        this.permissionTreeModal().hide();

        abp.notify.success(this.l('XCountPermissionFiltered', this.NumberOfFilteredPermission));
    }

    getSelectedPermissions(): string[] {
        const permissionTree = this.permissionTree();
        if (!permissionTree) {
            return [];
        }

        let permissions = permissionTree
            .getGrantedPermissionNames()
            .filter((test, index, array) => index === array.findIndex((findTest) => findTest === test));

        return permissions;
    }

    private loadAllPermissionsToFilterTree() {
        let treeModel: FlatPermissionDto[] = [];
        this._permissionService.getAllPermissions().subscribe((result) => {
            if (result.items) {
                result.items.forEach((item) => {
                    treeModel.push(
                        new FlatPermissionDto({
                            name: item.name,
                            description: item.description,
                            displayName: item.displayName,
                            isGrantedByDefault: item.isGrantedByDefault,
                            parentName: item.parentName,
                        })
                    );
                });
            }

            this.permissionTree().editData = { permissions: treeModel, grantedPermissionNames: [] };
        });
    }
}
