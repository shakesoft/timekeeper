import { Injector, Pipe, PipeTransform, inject } from '@angular/core';
import { PermissionCheckerService } from 'abp-ng2-module';

@Pipe({ name: 'permissionAll' })
export class PermissionAllPipe implements PipeTransform {
    permission: PermissionCheckerService;

    constructor(...args: unknown[]);

    constructor() {
        const injector = inject(Injector);

        this.permission = injector.get(PermissionCheckerService);
    }

    transform(arrPermissions: string[]): boolean {
        if (!arrPermissions) {
            return false;
        }

        for (const permission of arrPermissions) {
            if (!this.permission.isGranted(permission)) {
                return false;
            }
        }

        return true; //all permissions are granted
    }
}
