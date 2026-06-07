import { Component, Injector, OnInit, inject, output, viewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { AppComponentBase } from '@shared/common/app-component-base';
import {
    DynamicPropertyServiceProxy,
    DynamicPropertyDto,
    DynamicEntityPropertyDefinitionServiceProxy,
} from '@shared/service-proxies/service-proxies';
import { Observable } from 'rxjs';
import { PermissionTreeModalComponent } from '@app/admin/shared/permission-tree-modal.component';

import { AppBsModalDirective } from '../../../shared/common/appBsModal/app-bs-modal.directive';
import { FormsModule } from '@angular/forms';
import { ButtonBusyDirective } from '../../../shared/utils/button-busy.directive';
import { PermissionTreeModalComponent as PermissionTreeModalComponent_1 } from '../shared/permission-tree-modal.component';
import { LocalizePipe } from '@shared/common/pipes/localize.pipe';

@Component({
    selector: 'create-or-edit-dynamic-property-modal',
    templateUrl: './create-or-edit-dynamic-property-modal.component.html',
    imports: [AppBsModalDirective, FormsModule, ButtonBusyDirective, PermissionTreeModalComponent_1, LocalizePipe],
})
export class CreateOrEditDynamicPropertyModalComponent extends AppComponentBase implements OnInit {
    private _dynamicPropertyService = inject(DynamicPropertyServiceProxy);
    private _dynamicEntityPropertyDefinitionServiceProxy = inject(DynamicEntityPropertyDefinitionServiceProxy);

    readonly modalSave = output<any>();
    readonly modal = viewChild<ModalDirective>('createOrEditModal');
    readonly permissionFilterTreeModal = viewChild<PermissionTreeModalComponent>('permissionFilterTreeModal');

    dynamicProperty: DynamicPropertyDto;
    allIputTypes: string[];
    dynamicPropertyId: number;
    active: boolean;
    loading = true;
    saving = false;

    constructor(...args: unknown[]);

    constructor() {
        const injector = inject(Injector);

        super(injector);
    }

    public show(dynamicPropertyId?: number): void {
        this.dynamicPropertyId = dynamicPropertyId;
        if (!dynamicPropertyId) {
            this.dynamicProperty = new DynamicPropertyDto();
            this.active = true;
            this.modal().show();
            return;
        }

        this.showMainSpinner();
        this._dynamicPropertyService.get(dynamicPropertyId).subscribe(
            (result) => {
                this.dynamicProperty = result;
                this.active = true;
                this.modal().show();
                this.hideMainSpinner();
            },
            (e) => {
                this.hideMainSpinner();
            }
        );
    }

    save(): void {
        this.saving = true;
        let observable: Observable<void>;
        if (!this.dynamicProperty.id) {
            observable = this._dynamicPropertyService.add(this.dynamicProperty);
        } else {
            observable = this._dynamicPropertyService.update(this.dynamicProperty);
        }

        this.showMainSpinner();
        observable.subscribe(
            () => {
                this.notify.info(this.l('SavedSuccessfully'));
                this.hideMainSpinner();
                this.modalSave.emit(null);
                this.modal().hide();
                this.saving = false;
            },
            (e) => {
                this.hideMainSpinner();
                this.saving = false;
            }
        );
    }

    ngOnInit(): void {
        this._dynamicEntityPropertyDefinitionServiceProxy.getAllAllowedInputTypeNames().subscribe((data) => {
            this.allIputTypes = data;
            this.loading = false;
        });
    }

    close(): void {
        this.modal().hide();
    }

    openPermissionTreeModal(): void {
        this.permissionFilterTreeModal().openPermissionTreeModal();
    }

    onPermissionSelected(selectedValues: string[]): void {
        this.dynamicProperty.permission = selectedValues[0];
    }
}
