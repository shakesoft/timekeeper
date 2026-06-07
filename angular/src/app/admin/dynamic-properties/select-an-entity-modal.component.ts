import { Component, Injector, inject, output, viewChild } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import {
    DynamicEntityPropertyDefinitionServiceProxy,
    DynamicEntityPropertyServiceProxy,
} from '@shared/service-proxies/service-proxies';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { forkJoin } from 'rxjs';
import { AppBsModalDirective } from '../../../shared/common/appBsModal/app-bs-modal.directive';

import { FormsModule } from '@angular/forms';
import { LocalizePipe } from '@shared/common/pipes/localize.pipe';

@Component({
    selector: 'select-and-entity-modal',
    templateUrl: './select-an-entity-modal.component.html',
    imports: [AppBsModalDirective, FormsModule, LocalizePipe],
})
export class SelectAnEntityModalComponent extends AppComponentBase {
    private _dynamicEntityPropertyService = inject(DynamicEntityPropertyServiceProxy);
    private _dynamicEntityPropertyDefinitionService = inject(DynamicEntityPropertyDefinitionServiceProxy);

    readonly modalSave = output<any>();
    readonly modal = viewChild<ModalDirective>('createModal');

    allEntities: string[];
    initialized = false;
    saving = false;
    entityFullName: string;

    constructor(...args: unknown[]);

    constructor() {
        const injector = inject(Injector);

        super(injector);
    }

    show(): void {
        this.initialize();
        this.modal().show();
    }

    save(): void {
        this.saving = true;
        this.showMainSpinner();
        this.modalSave.emit(this.entityFullName);
        this.modal().hide();
    }

    close(): void {
        this.modal().hide();
    }

    private initialize() {
        if (this.initialized) {
            return;
        }

        this.showMainSpinner();
        let allEntitiesObservable = this._dynamicEntityPropertyDefinitionService.getAllEntities();
        let allEntitiesHasPropertyObservable = this._dynamicEntityPropertyService.getAllEntitiesHasDynamicProperty();

        forkJoin([allEntitiesObservable, allEntitiesHasPropertyObservable]).subscribe(
            ([allEntities, allEntitiesHasProperty]) => {
                this.allEntities = allEntities.filter(function (element) {
                    return allEntitiesHasProperty.items.map((item) => item.entityFullName).indexOf(element) === -1;
                });
                this.hideMainSpinner();
                this.initialized = true;
            },
            (err) => {
                this.hideMainSpinner();
            }
        );
    }
}
