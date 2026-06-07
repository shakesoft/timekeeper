import { Injector, Pipe, PipeTransform, inject } from '@angular/core';
import { PermissionCheckerService } from 'abp-ng2-module';

@Pipe({ name: 'permission' })
export class PermissionPipe implements PipeTransform {
    permission: PermissionCheckerService;

    constructor(...args: unknown[]);

    constructor() {
        const injector = inject(Injector);

        this.permission = injector.get(PermissionCheckerService);
    }

    transform(permission: string): boolean {
        return this.permission.isGranted(permission);
    }
}
