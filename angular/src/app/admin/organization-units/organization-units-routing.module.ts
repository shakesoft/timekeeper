import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
    {
        path: '',
        loadComponent: () =>
            import('@app/admin/organization-units/organization-units.component').then(
                (m) => m.OrganizationUnitsComponent
            ),
        pathMatch: 'full',
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class OrganizationUnitsRoutingModule {}
