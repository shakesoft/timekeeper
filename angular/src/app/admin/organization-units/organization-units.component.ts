import { Component, Injector, inject, viewChild } from '@angular/core';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { AppComponentBase } from '@shared/common/app-component-base';
import { OrganizationTreeComponent } from './organization-tree.component';
import { OrganizationUnitMembersComponent } from './organization-unit-members.component';
import { OrganizationUnitRolesComponent } from './organization-unit-roles.component';
import { IBasicOrganizationUnitInfo } from './basic-organization-unit-info';
import { SubHeaderComponent } from '../../shared/common/sub-header/sub-header.component';

import { TabsetComponent, TabDirective } from 'ngx-bootstrap/tabs';
import { LocalizePipe } from '@shared/common/pipes/localize.pipe';

@Component({
    templateUrl: './organization-units.component.html',
    animations: [appModuleAnimation()],
    imports: [
        SubHeaderComponent,
        OrganizationTreeComponent,
        TabsetComponent,
        TabDirective,
        OrganizationUnitMembersComponent,
        OrganizationUnitRolesComponent,
        LocalizePipe,
    ],
})
export class OrganizationUnitsComponent extends AppComponentBase {
    readonly ouMembers = viewChild<OrganizationUnitMembersComponent>('ouMembers');
    readonly ouRoles = viewChild<OrganizationUnitRolesComponent>('ouRoles');
    readonly ouTree = viewChild<OrganizationTreeComponent>('ouTree');
    organizationUnit: IBasicOrganizationUnitInfo = null;

    constructor(...args: unknown[]);

    constructor() {
        const injector = inject(Injector);

        super(injector);
    }

    ouSelected(event: any): void {
        this.organizationUnit = event;
        this.ouMembers().organizationUnit = event;
        this.ouRoles().organizationUnit = event;
    }
}
