import { Component, OnInit, Injector, InjectionToken, inject, input, output } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import {
    DynamicEntityPropertyValueServiceProxy,
    GetAllDynamicEntityPropertyValuesOutputItem,
    CleanValuesInput,
    InsertOrUpdateAllValuesInput,
    InsertOrUpdateAllValuesInputItem,
} from '@shared/service-proxies/service-proxies';
import {
    InputTypeConfigurationDefinition,
    InputTypeConfigurationService,
} from '@app/shared/common/input-types/input-type-configuration.service';
import { InputTypeComponentBase } from '@app/shared/common/input-types/input-type-component-base';
import {
    SelectedValuesOptions,
    ComponentInstanceOptions,
    AllValuesOptions,
} from '@app/shared/common/input-types/InputTypeConsts';
import { NgComponentOutlet } from '@angular/common';
import { BusyIfDirective } from '../../../../../shared/utils/busy-if.directive';
import { TableModule } from 'primeng/table';
import { LocalizePipe } from '@shared/common/pipes/localize.pipe';
import { PermissionPipe } from '@shared/common/pipes/permission.pipe';

export class DynamicEntityPropertyValueViewItem {
    data: GetAllDynamicEntityPropertyValuesOutputItem;
    definition: InputTypeConfigurationDefinition;
    injector: Injector;
    componentInstance: InputTypeComponentBase;
    constructor(data: GetAllDynamicEntityPropertyValuesOutputItem, definition: InputTypeConfigurationDefinition) {
        this.data = data;
        this.definition = definition;
    }
}

@Component({
    selector: 'dynamic-entity-property-value-manager',
    templateUrl: './manager.component.html',
    imports: [BusyIfDirective, TableModule, NgComponentOutlet, LocalizePipe, PermissionPipe],
})
export class ManagerComponent extends AppComponentBase implements OnInit {
    private _injector: Injector;
    private _dynamicEntityPropertyValueService = inject(DynamicEntityPropertyValueServiceProxy);
    private _inputTypeConfigurationService = inject(InputTypeConfigurationService);

    readonly entityFullName = input<string>(undefined);
    readonly entityId = input<string>(undefined);

    readonly onSaveDone = output<any>();

    initialized = false;
    items: DynamicEntityPropertyValueViewItem[];

    constructor(...args: unknown[]);

    constructor() {
        const _injector = inject(Injector);

        super(_injector);

        this._injector = _injector;
    }

    ngOnInit() {
        this.initialize();
    }

    initialize(): void {
        this.initialized = false;
        this._dynamicEntityPropertyValueService
            .getAllDynamicEntityPropertyValues(this.entityFullName(), this.entityId())
            .subscribe(
                (data) => {
                    if (data.items) {
                        this.items = data.items.map((item) => {
                            let definition = this._inputTypeConfigurationService.getByInputType(item.inputType);

                            let viewItem = new DynamicEntityPropertyValueViewItem(item, definition);

                            const componentInstanceCallback = (instance: InputTypeComponentBase) => {
                                viewItem.componentInstance = instance;
                            };

                            let injector = Injector.create({
                                providers: [
                                    { provide: SelectedValuesOptions, useValue: item.selectedValues },
                                    { provide: AllValuesOptions, useValue: item.allValuesInputTypeHas },
                                    { provide: ComponentInstanceOptions, useValue: componentInstanceCallback },
                                ],
                                parent: this._injector,
                            });

                            viewItem.injector = injector;
                            return viewItem;
                        });
                    }
                    this.initialized = true;
                    this.hideMainSpinner();
                },
                (err) => {
                    this.hideMainSpinner();
                }
            );
    }

    deleteAllValuesOfDynamicEntityPropertyId(item: DynamicEntityPropertyValueViewItem): void {
        this.message.confirm(
            this.l('DeleteDynamicEntityPropertyValueMessage', item.data.propertyName),
            this.l('AreYouSure'),
            (isConfirmed) => {
                if (isConfirmed) {
                    this._dynamicEntityPropertyValueService
                        .cleanValues(
                            new CleanValuesInput({
                                dynamicEntityPropertyId: item.data.dynamicEntityPropertyId,
                                entityId: this.entityId(),
                            })
                        )
                        .subscribe(() => {
                            abp.notify.success(this.l('SuccessfullyDeleted'));
                            this.initialize();
                        });
                }
            }
        );
    }

    saveAll(): void {
        if (!this.items || this.items.length === 0) {
            return;
        }

        let newItems: InsertOrUpdateAllValuesInputItem[] = [];
        for (let i = 0; i < this.items.length; i++) {
            const element = this.items[i];
            newItems.push(
                new InsertOrUpdateAllValuesInputItem({
                    dynamicEntityPropertyId: element.data.dynamicEntityPropertyId,
                    entityId: this.entityId(),
                    values: element.componentInstance.getSelectedValues(),
                })
            );
        }

        this._dynamicEntityPropertyValueService
            .insertOrUpdateAllValues(
                new InsertOrUpdateAllValuesInput({
                    items: newItems,
                })
            )
            .subscribe(
                () => {
                    abp.notify.success(this.l('SavedSuccessfully'));
                    this.initialize();
                    this.hideMainSpinner();

                    if (this.onSaveDone) {
                        // TODO: The 'emit' function requires a mandatory any argument
                        this.onSaveDone.emit(null);
                    }
                },
                (err) => {
                    this.hideMainSpinner();
                }
            );
    }
}
