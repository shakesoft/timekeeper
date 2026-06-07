import { AfterViewInit, Component, ElementRef, Injector, OnInit, inject, viewChild } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { AppComponentBase } from '@shared/common/app-component-base';
import { LanguageServiceProxy } from '@shared/service-proxies/service-proxies';
import { map as _map, filter as _filter } from 'lodash-es';
import { LazyLoadEvent } from 'primeng/api';
import { Paginator, PaginatorModule } from 'primeng/paginator';
import { Table, TableModule } from 'primeng/table';
import { EditTextModalComponent } from './edit-text-modal.component';
import { finalize } from 'rxjs/operators';
import { SubHeaderComponent } from '../../shared/common/sub-header/sub-header.component';
import { FormsModule } from '@angular/forms';

import { AutoFocusDirective } from '../../../shared/utils/auto-focus.directive';
import { BusyIfDirective } from '../../../shared/utils/busy-if.directive';
import { LocalizePipe } from '@shared/common/pipes/localize.pipe';

@Component({
    templateUrl: './language-texts.component.html',
    styleUrls: ['./language-texts.component.less'],
    animations: [appModuleAnimation()],
    imports: [
        SubHeaderComponent,
        FormsModule,
        AutoFocusDirective,
        BusyIfDirective,
        TableModule,
        PaginatorModule,
        EditTextModalComponent,
        LocalizePipe,
    ],
})
export class LanguageTextsComponent extends AppComponentBase implements OnInit {
    private _languageService = inject(LanguageServiceProxy);
    private _router = inject(Router);
    private _activatedRoute = inject(ActivatedRoute);

    readonly targetLanguageNameCombobox = viewChild<ElementRef>('targetLanguageNameCombobox');
    readonly baseLanguageNameCombobox = viewChild<ElementRef>('baseLanguageNameCombobox');
    readonly sourceNameCombobox = viewChild<ElementRef>('sourceNameCombobox');
    readonly targetValueFilterCombobox = viewChild<ElementRef>('targetValueFilterCombobox');
    readonly textsTable = viewChild<ElementRef>('textsTable');
    readonly editTextModal = viewChild<EditTextModalComponent>('editTextModal');
    readonly dataTable = viewChild<Table>('dataTable');
    readonly paginator = viewChild<Paginator>('paginator');

    sourceNames: string[] = [];
    languages: abp.localization.ILanguageInfo[] = [];
    targetLanguageName: string;
    sourceName: string;
    baseLanguageName: string;
    targetValueFilter: string;
    filterText: string;

    constructor(...args: unknown[]);

    constructor() {
        const injector = inject(Injector);

        super(injector);
    }

    ngOnInit(): void {
        this.sourceNames = _map(
            _filter(abp.localization.sources, (source) => source.type === 'MultiTenantLocalizationSource'),
            (value) => value.name
        );
        this.languages = abp.localization.languages;
        this.init();
    }

    getLanguageTexts(event?: LazyLoadEvent) {
        const paginator = this.paginator();
        const dataTable = this.dataTable();
        if (!paginator || !dataTable || !this.sourceName) {
            return;
        }

        this.primengTableHelper.showLoadingIndicator();

        this._languageService
            .getLanguageTexts(
                this.sourceName,
                this.targetLanguageName,
                this.primengTableHelper.getMaxResultCount(paginator, event),
                this.primengTableHelper.getSkipCount(paginator, event),
                this.primengTableHelper.getSorting(dataTable),
                this.baseLanguageName,
                this.targetValueFilter,
                this.filterText
            )
            .pipe(finalize(() => this.primengTableHelper.hideLoadingIndicator()))
            .subscribe((result) => {
                this.primengTableHelper.totalRecordsCount = result.totalCount;
                this.primengTableHelper.records = result.items;
                this.primengTableHelper.hideLoadingIndicator();
            });
    }

    init(): void {
        this._activatedRoute.params.subscribe((params: Params) => {
            this.baseLanguageName = params['baseLanguageName'] || abp.localization.currentLanguage.name;
            this.targetLanguageName = params['name'];
            this.sourceName = params['sourceName'] || 'CadentManagement';
            this.targetValueFilter = params['targetValueFilter'] || 'ALL';
            this.filterText = params['filterText'] || '';

            this.reloadPage();
        });
    }

    reloadPage(): void {
        this.paginator().changePage(this.paginator().getPage());
    }

    applyFilters(event?: LazyLoadEvent): void {
        this._router.navigate([
            'app/admin/languages',
            this.targetLanguageName,
            'texts',
            {
                sourceName: this.sourceName,
                baseLanguageName: this.baseLanguageName,
                targetValueFilter: this.targetValueFilter,
                filterText: this.filterText,
            },
        ]);

        this.getLanguageTexts();
        this.paginator().changePage(0);
    }

    truncateString(text): string {
        return abp.utils.truncateStringWithPostfix(text, 32, '...');
    }

    refreshTextValueFromModal(): void {
        for (let i = 0; i < this.primengTableHelper.records.length; i++) {
            const editTextModal = this.editTextModal();
            if (this.primengTableHelper.records[i].key === editTextModal.model.key) {
                this.primengTableHelper.records[i].targetValue = editTextModal.model.value;
                return;
            }
        }
    }
}
