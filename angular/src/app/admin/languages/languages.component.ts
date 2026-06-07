import { Component, ElementRef, Injector, ViewEncapsulation, inject, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { AppComponentBase } from '@shared/common/app-component-base';
import {
    ApplicationLanguageListDto,
    LanguageServiceProxy,
    SetDefaultLanguageInput,
} from '@shared/service-proxies/service-proxies';
import { Paginator } from 'primeng/paginator';
import { Table, TableModule } from 'primeng/table';
import { CreateOrEditLanguageModalComponent } from './create-or-edit-language-modal.component';
import { AbpSessionService } from 'abp-ng2-module';
import { finalize } from 'rxjs/operators';
import { SubHeaderComponent } from '../../shared/common/sub-header/sub-header.component';
import { NgClass } from '@angular/common';
import { BusyIfDirective } from '../../../shared/utils/busy-if.directive';
import { BsDropdownDirective, BsDropdownToggleDirective, BsDropdownMenuDirective } from 'ngx-bootstrap/dropdown';
import { LuxonFormatPipe } from '../../../shared/utils/luxon-format.pipe';
import { LocalizePipe } from '@shared/common/pipes/localize.pipe';
import { PermissionPipe } from '@shared/common/pipes/permission.pipe';
import { PermissionAnyPipe } from '@shared/common/pipes/permission-any.pipe';

@Component({
    templateUrl: './languages.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()],
    imports: [
        SubHeaderComponent,
        BusyIfDirective,
        TableModule,
        BsDropdownDirective,
        BsDropdownToggleDirective,
        BsDropdownMenuDirective,
        NgClass,
        CreateOrEditLanguageModalComponent,
        LuxonFormatPipe,
        LocalizePipe,
        PermissionPipe,
        PermissionAnyPipe,
    ],
})
export class LanguagesComponent extends AppComponentBase {
    private _languageService = inject(LanguageServiceProxy);
    private _sessionService = inject(AbpSessionService);
    private _router = inject(Router);

    readonly languagesTable = viewChild<ElementRef>('languagesTable');
    readonly createOrEditLanguageModal = viewChild<CreateOrEditLanguageModalComponent>('createOrEditLanguageModal');
    readonly dataTable = viewChild<Table>('dataTable');
    readonly paginator = viewChild<Paginator>('paginator');

    defaultLanguageName: string;

    constructor() {
        const injector = inject(Injector);

        super(injector);
    }

    get multiTenancySideIsHost(): boolean {
        return !this._sessionService.tenantId;
    }

    getLanguages(): void {
        this.primengTableHelper.showLoadingIndicator();

        this._languageService
            .getLanguages()
            .pipe(finalize(() => this.primengTableHelper.hideLoadingIndicator()))
            .subscribe((result) => {
                this.defaultLanguageName = result.defaultLanguageName;
                this.primengTableHelper.records = result.items;
                this.primengTableHelper.totalRecordsCount = result.items.length;
                this.primengTableHelper.hideLoadingIndicator();
            });
    }

    changeTexts(language: ApplicationLanguageListDto): void {
        this._router.navigate(['app/admin/languages', language.name, 'texts']);
    }

    setAsDefaultLanguage(language: ApplicationLanguageListDto): void {
        const input = new SetDefaultLanguageInput();
        input.name = language.name;
        this._languageService.setDefaultLanguage(input).subscribe(() => {
            this.getLanguages();
            this.notify.success(this.l('SuccessfullySaved'));
        });
    }

    deleteLanguage(language: ApplicationLanguageListDto): void {
        this.message.confirm(
            this.l('LanguageDeleteWarningMessage', language.displayName),
            this.l('AreYouSure'),
            (isConfirmed) => {
                if (isConfirmed) {
                    this._languageService.deleteLanguage(language.id).subscribe(() => {
                        this.getLanguages();
                        this.notify.success(this.l('SuccessfullyDeleted'));
                    });
                }
            }
        );
    }
}
