import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
    {
        path: '',
        loadComponent: () =>
            import('@app/admin/entity-changes/entity-changes.component').then((m) => m.EntityChangesComponent),
        pathMatch: 'full',
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class EntityChangesRoutingModule {}
