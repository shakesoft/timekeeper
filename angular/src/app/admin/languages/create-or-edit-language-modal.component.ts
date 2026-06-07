import { Component, ElementRef, Injector, inject, output, viewChild } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import {
    ApplicationLanguageEditDto,
    CreateOrUpdateLanguageInput,
    LanguageServiceProxy,
} from '@shared/service-proxies/service-proxies';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';
import { SelectItem } from 'primeng/api';
import { map as _map } from 'lodash-es';
import { AppBsModalDirective } from '../../../shared/common/appBsModal/app-bs-modal.directive';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { ValidationMessagesComponent } from '../../../shared/utils/validation-messages.component';
import { ButtonBusyDirective } from '../../../shared/utils/button-busy.directive';
import { LocalizePipe } from '@shared/common/pipes/localize.pipe';

@Component({
    selector: 'createOrEditLanguageModal',
    templateUrl: './create-or-edit-language-modal.component.html',
    imports: [
        AppBsModalDirective,
        FormsModule,
        SelectModule,
        ValidationMessagesComponent,
        NgClass,
        ButtonBusyDirective,
        LocalizePipe,
    ],
})
export class CreateOrEditLanguageModalComponent extends AppComponentBase {
    private _languageService = inject(LanguageServiceProxy);

    readonly modal = viewChild<ModalDirective>('createOrEditModal');
    readonly languageCombobox = viewChild<ElementRef>('languageCombobox');
    readonly iconCombobox = viewChild<ElementRef>('iconCombobox');

    readonly modalSave = output<any>();

    active = false;
    saving = false;

    language: ApplicationLanguageEditDto = new ApplicationLanguageEditDto();
    languageNamesSelectItems: SelectItem[] = [];
    flagsSelectItems: SelectItem[] = [];

    constructor(...args: unknown[]);

    constructor() {
        const injector = inject(Injector);

        super(injector);
    }

    show(languageId?: number): void {
        this.active = true;

        this._languageService.getLanguageForEdit(languageId).subscribe((result) => {
            this.language = result.language;

            this.languageNamesSelectItems = _map(result.languageNames, function (language) {
                return {
                    label: language.displayText,
                    value: language.value,
                };
            });

            this.flagsSelectItems = _map(result.flags, function (flag) {
                return {
                    label: flag.displayText,
                    value: flag.value,
                };
            });

            if (!languageId) {
                this.language.isEnabled = true;
            }

            this.modal().show();
        });
    }

    save(): void {
        let input = new CreateOrUpdateLanguageInput();
        input.language = this.language;

        this.saving = true;
        this._languageService
            .createOrUpdateLanguage(input)
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
