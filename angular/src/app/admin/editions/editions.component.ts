import { Component, Injector, inject, viewChild } from '@angular/core';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { AppComponentBase } from '@shared/common/app-component-base';
import { EditionListDto, EditionServiceProxy } from '@shared/service-proxies/service-proxies';
import { Paginator } from 'primeng/paginator';
import { Table, TableModule } from 'primeng/table';
import { CreateEditionModalComponent } from './create-edition-modal.component';
import { EditEditionModalComponent } from './edit-edition-modal.component';
import { MoveTenantsToAnotherEditionModalComponent } from './move-tenants-to-another-edition-modal.component';
import { finalize } from 'rxjs/operators';
import { SubHeaderComponent } from '../../shared/common/sub-header/sub-header.component';

import { BusyIfDirective } from '../../../shared/utils/busy-if.directive';
import { BsDropdownDirective, BsDropdownToggleDirective, BsDropdownMenuDirective } from 'ngx-bootstrap/dropdown';
import { LocalizePipe } from '@shared/common/pipes/localize.pipe';
import { PermissionPipe } from '@shared/common/pipes/permission.pipe';
import { PermissionAnyPipe } from '@shared/common/pipes/permission-any.pipe';

@Component({
    templateUrl: './editions.component.html',
    animations: [appModuleAnimation()],
    imports: [
        SubHeaderComponent,
        BusyIfDirective,
        TableModule,
        BsDropdownDirective,
        BsDropdownToggleDirective,
        BsDropdownMenuDirective,
        CreateEditionModalComponent,
        EditEditionModalComponent,
        MoveTenantsToAnotherEditionModalComponent,
        LocalizePipe,
        PermissionPipe,
        PermissionAnyPipe,
    ],
})
export class EditionsComponent extends AppComponentBase {
    private _editionService = inject(EditionServiceProxy);

    readonly createEditionModal = viewChild<CreateEditionModalComponent>('createEditionModal');
    readonly editEditionModal = viewChild<EditEditionModalComponent>('editEditionModal');
    readonly moveTenantsToAnotherEditionModal = viewChild<MoveTenantsToAnotherEditionModalComponent>(
        'moveTenantsToAnotherEditionModal'
    );
    readonly dataTable = viewChild<Table>('dataTable');
    readonly paginator = viewChild<Paginator>('paginator');

    constructor() {
        const injector = inject(Injector);

        super(injector);
    }

    getEditions(): void {
        this.primengTableHelper.showLoadingIndicator();
        this._editionService
            .getEditions()
            .pipe(finalize(() => this.primengTableHelper.hideLoadingIndicator()))
            .subscribe((result) => {
                this.primengTableHelper.totalRecordsCount = result.items.length;
                this.primengTableHelper.records = result.items;
                this.primengTableHelper.hideLoadingIndicator();
            });
    }

    createEdition(): void {
        this.createEditionModal().show();
    }

    deleteEdition(edition: EditionListDto): void {
        this.message.confirm(
            this.l('EditionDeleteWarningMessage', edition.displayName),
            this.l('AreYouSure'),
            (isConfirmed) => {
                if (isConfirmed) {
                    this._editionService.deleteEdition(edition.id).subscribe(() => {
                        this.getEditions();
                        this.notify.success(this.l('SuccessfullyDeleted'));
                    });
                }
            }
        );
    }
}
