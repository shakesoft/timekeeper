import { ChangeDetectorRef, Component, ElementRef, Injector, inject, output, viewChild } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import {
    CreateOrganizationUnitInput,
    OrganizationUnitDto,
    OrganizationUnitServiceProxy,
    UpdateOrganizationUnitInput,
} from '@shared/service-proxies/service-proxies';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';
import { AppBsModalDirective } from '../../../shared/common/appBsModal/app-bs-modal.directive';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ValidationMessagesComponent } from '../../../shared/utils/validation-messages.component';
import { ButtonBusyDirective } from '../../../shared/utils/button-busy.directive';
import { LocalizePipe } from '@shared/common/pipes/localize.pipe';

export interface IOrganizationUnitOnEdit {
    id?: number;
    parentId?: number;
    displayName?: string;
}

@Component({
    selector: 'createOrEditOrganizationUnitModal',
    templateUrl: './create-or-edit-unit-modal.component.html',
    imports: [
        AppBsModalDirective,
        FormsModule,
        NgClass,
        ValidationMessagesComponent,
        ButtonBusyDirective,
        LocalizePipe,
    ],
})
export class CreateOrEditUnitModalComponent extends AppComponentBase {
    private _organizationUnitService = inject(OrganizationUnitServiceProxy);
    private _changeDetector = inject(ChangeDetectorRef);

    readonly modal = viewChild<ModalDirective>('createOrEditModal');
    readonly organizationUnitDisplayNameInput = viewChild<ElementRef>('organizationUnitDisplayName');

    readonly unitCreated = output<OrganizationUnitDto>();
    readonly unitUpdated = output<OrganizationUnitDto>();

    active = false;
    saving = false;

    organizationUnit: IOrganizationUnitOnEdit = {};

    constructor(...args: unknown[]);

    constructor() {
        const injector = inject(Injector);

        super(injector);
    }

    onShown(): void {
        document.getElementById('OrganizationUnitDisplayName').focus();
    }

    show(organizationUnit: IOrganizationUnitOnEdit): void {
        this.organizationUnit = organizationUnit;
        this.active = true;
        this.modal().show();
        this._changeDetector.detectChanges();
    }

    save(): void {
        if (!this.organizationUnit.id) {
            this.createUnit();
        } else {
            this.updateUnit();
        }
    }

    createUnit() {
        const createInput = new CreateOrganizationUnitInput();
        createInput.parentId = this.organizationUnit.parentId;
        createInput.displayName = this.organizationUnit.displayName;

        this.saving = true;
        this._organizationUnitService
            .createOrganizationUnit(createInput)
            .pipe(finalize(() => (this.saving = false)))
            .subscribe((result: OrganizationUnitDto) => {
                this.notify.info(this.l('SavedSuccessfully'));
                this.close();
                this.unitCreated.emit(result);
            });
    }

    updateUnit() {
        const updateInput = new UpdateOrganizationUnitInput();
        updateInput.id = this.organizationUnit.id;
        updateInput.displayName = this.organizationUnit.displayName;

        this.saving = true;
        this._organizationUnitService
            .updateOrganizationUnit(updateInput)
            .pipe(finalize(() => (this.saving = false)))
            .subscribe((result: OrganizationUnitDto) => {
                this.notify.info(this.l('SavedSuccessfully'));
                this.close();
                this.unitUpdated.emit(result);
            });
    }

    close(): void {
        this.modal().hide();
        this.active = false;
    }
}
