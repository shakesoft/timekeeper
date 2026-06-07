import { Component, Injector, inject } from '@angular/core';
import { AppConsts } from '@shared/AppConsts';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { AppComponentBase } from '@shared/common/app-component-base';
import { DemoUiComponentsServiceProxy } from '@shared/service-proxies/service-proxies';
import { FileUploadModule } from 'primeng/fileupload';
import { LocalizePipe } from '@shared/common/pipes/localize.pipe';

@Component({
    selector: 'demo-ui-file-upload',
    templateUrl: './demo-ui-file-upload.component.html',
    animations: [appModuleAnimation()],
    imports: [FileUploadModule, LocalizePipe],
})
export class DemoUiFileUploadComponent extends AppComponentBase {
    private demoUiComponentsService = inject(DemoUiComponentsServiceProxy);

    uploadUrl: string;
    uploadedFiles: any[] = [];

    constructor(...args: unknown[]);

    constructor() {
        const injector = inject(Injector);

        super(injector);
        this.uploadUrl = AppConsts.remoteServiceBaseUrl + '/DemoUiComponents/UploadFiles';
    }

    // upload completed event
    onUpload(event): void {
        for (const file of event.files) {
            this.uploadedFiles.push(file);
        }
    }

    onBeforeSend(event): void {
        event.xhr.setRequestHeader('Authorization', 'Bearer ' + abp.auth.getToken());
    }
}
