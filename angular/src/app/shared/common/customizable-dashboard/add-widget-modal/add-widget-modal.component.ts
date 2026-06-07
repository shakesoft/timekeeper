import { Component, Injector, inject, output, viewChild } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { DashboardCustomizationServiceProxy, WidgetOutput } from '@shared/service-proxies/service-proxies';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { DashboardCustomizationConst } from '../DashboardCustomizationConsts';
import { AppBsModalDirective } from '../../../../../shared/common/appBsModal/app-bs-modal.directive';
import { FormsModule } from '@angular/forms';

import { AutoFocusDirective } from '../../../../../shared/utils/auto-focus.directive';
import { LocalizePipe } from '@shared/common/pipes/localize.pipe';

@Component({
    selector: 'add-widget-modal',
    templateUrl: './add-widget-modal.component.html',
    styleUrls: ['./add-widget-modal.component.css'],
    imports: [AppBsModalDirective, FormsModule, AutoFocusDirective, LocalizePipe],
})
export class AddWidgetModalComponent extends AppComponentBase {
    private _dashboardCustomizationServiceProxy = inject(DashboardCustomizationServiceProxy);

    readonly onClose = output<any>();
    readonly modal = viewChild<ModalDirective>('addWidgetModal');

    widgets: WidgetOutput[];
    saving = false;
    selectedWidgetId: string;

    constructor(...args: unknown[]);

    constructor() {
        const injector = inject(Injector);

        super(injector);
    }

    close(): void {
        this.onClose.emit(null);
        this.hide();
    }

    save(): void {
        this.onClose.emit(this.selectedWidgetId);
        this.hide();
    }

    show(dashboardName: string, pageId: string): void {
        this._dashboardCustomizationServiceProxy
            .getAllAvailableWidgetDefinitionsForPage(
                dashboardName,
                DashboardCustomizationConst.Applications.Angular,
                pageId
            )
            .subscribe((availableWidgets) => {
                this.widgets = availableWidgets;
                if (this.widgets && this.widgets.length) {
                    this.selectedWidgetId = this.widgets[0].id;
                } else {
                    this.selectedWidgetId = null;
                }
                this.modal().show();
            });
    }

    hide(): void {
        this.modal().hide();
    }
}
