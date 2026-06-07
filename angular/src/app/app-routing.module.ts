import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AppRouteGuard } from './shared/common/auth/auth-route-guard';

export const routes: Routes = [
    {
        path: 'app',
        loadComponent: () => import('./app.component').then((m) => m.AppComponent),
        canActivate: [AppRouteGuard],
        canActivateChild: [AppRouteGuard],
        children: [
            {
                path: '',
                children: [
                    {
                        path: 'notifications',
                        loadComponent: () =>
                            import('./shared/layout/notifications/notifications.component').then(
                                (m) => m.NotificationsComponent
                            ),
                    },
                    { path: '', redirectTo: '/app/main/dashboard', pathMatch: 'full' },
                ],
            },
            {
                path: 'main',
                loadChildren: () => import('app/main/main.module').then((m) => m.MainModule), //Lazy load main module
                data: { preload: true },
            },
            {
                path: 'admin',
                loadChildren: () => import('app/admin/admin.module').then((m) => m.AdminModule), //Lazy load admin module
                data: { preload: true },
                canLoad: [AppRouteGuard],
            },
            {
                path: '**',
                redirectTo: 'notifications',
            },
        ],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class AppRoutingModule {}
