import { Component, Injector, inject, output, viewChild } from '@angular/core';
import { AppEditionExpireAction } from '@shared/AppEnums';
import { AppComponentBase } from '@shared/common/app-component-base';
import {
    ComboboxItemDto,
    CommonLookupServiceProxy,
    UpdateEditionDto,
    EditionServiceProxy,
} from '@shared/service-proxies/service-proxies';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { FeatureTreeComponent } from '../shared/feature-tree.component';
import { finalize } from 'rxjs/operators';
import { AppBsModalDirective } from '../../../shared/common/appBsModal/app-bs-modal.directive';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TabsetComponent, TabDirective } from 'ngx-bootstrap/tabs';
import { ValidationMessagesComponent } from '../../../shared/utils/validation-messages.component';
import { ButtonBusyDirective } from '../../../shared/utils/button-busy.directive';

@Component({
    selector: 'editEditionModal',
    templateUrl: './edit-edition-modal.component.html',
    imports: [
        AppBsModalDirective,
        FormsModule,
        TabsetComponent,
        TabDirective,
        NgClass,
        ValidationMessagesComponent,
        FeatureTreeComponent,
        ButtonBusyDirective,
    ],
})
export class EditEditionModalComponent extends AppComponentBase {
    private _editionService = inject(EditionServiceProxy);
    private _commonLookupService = inject(CommonLookupServiceProxy);

    readonly modal = viewChild<ModalDirective>('editModal');
    readonly featureTree = viewChild<FeatureTreeComponent>('featureTree');

    readonly modalSave = output<any>();

    active = false;
    saving = false;

    edition: UpdateEditionDto = new UpdateEditionDto();
    expiringEditions: ComboboxItemDto[] = [];

    expireAction: AppEditionExpireAction = AppEditionExpireAction.DeactiveTenant;
    expireActionEnum: typeof AppEditionExpireAction = AppEditionExpireAction;
    isFree = false;
    isTrialActive = false;
    isWaitingDayActive = false;

    constructor(...args: unknown[]);

    constructor() {
        const injector = inject(Injector);

        super(injector);
    }

    show(editionId?: number): void {
        this.active = true;

        this._commonLookupService.getEditionsForCombobox(true).subscribe((editionsResult) => {
            this._editionService.getEditionForEdit(editionId).subscribe((editionResult) => {
                this.featureTree().editData = editionResult;
                this.edition.edition = editionResult.edition;
                this.modal().show();
            });
        });
    }

    onShown(): void {
        document.getElementById('EditionDisplayName').focus();
    }

    save(): void {
        const featureTree = this.featureTree();
        if (!featureTree.areAllValuesValid()) {
            this.message.warn(this.l('InvalidFeaturesWarning'));
            return;
        }

        const input = new UpdateEditionDto();
        input.edition = this.edition.edition;
        input.featureValues = featureTree.getGrantedFeatures();

        this.saving = true;
        this._editionService
            .updateEdition(input)
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
