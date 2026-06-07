import { Component, Injector, inject, viewChild } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import {
    AuditLogServiceProxy,
    EntityChangeListDto,
    EntityPropertyChangeDto,
} from '@shared/service-proxies/service-proxies';
import { DateTime } from 'luxon';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { DateTimeService } from '../timing/date-time.service';
import { AppBsModalDirective } from '../../../../shared/common/appBsModal/app-bs-modal.directive';

import { LocalizePipe } from '@shared/common/pipes/localize.pipe';

@Component({
    selector: 'entityChangeDetailModal',
    templateUrl: './entity-change-detail-modal.component.html',
    imports: [AppBsModalDirective, LocalizePipe],
})
export class EntityChangeDetailModalComponent extends AppComponentBase {
    private _auditLogService = inject(AuditLogServiceProxy);
    private _dateTimeService = inject(DateTimeService);

    readonly modal = viewChild<ModalDirective>('entityChangeDetailModal');

    active = false;
    entityPropertyChanges: EntityPropertyChangeDto[];
    entityChange: EntityChangeListDto;

    constructor(...args: unknown[]);

    constructor() {
        const injector = inject(Injector);

        super(injector);
    }

    getPropertyChangeValue(propertyChangeValue, propertyTypeFullName) {
        if (!propertyChangeValue) {
            return propertyChangeValue;
        }
        propertyChangeValue = propertyChangeValue.replace(/^['"]+/g, '').replace(/['"]+$/g, '');
        if (this.isDate(propertyChangeValue, propertyTypeFullName)) {
            return this._dateTimeService.formatDate(
                this._dateTimeService.fromISODateString(propertyChangeValue),
                'yyyy-LL-dd HH:mm:ss'
            );
        }

        if (propertyChangeValue === 'null') {
            return '';
        }

        return propertyChangeValue;
    }

    isDate(date, propertyTypeFullName): boolean {
        return propertyTypeFullName.includes('DateTime') && !isNaN(Date.parse(date).valueOf());
    }

    show(record: EntityChangeListDto): void {
        const self = this;
        self.active = true;
        self.entityChange = record;

        this._auditLogService.getEntityPropertyChanges(record.id).subscribe((result) => {
            self.entityPropertyChanges = result;
        });

        self.modal().show();
    }

    close(): void {
        this.active = false;
        this.modal().hide();
    }
}
