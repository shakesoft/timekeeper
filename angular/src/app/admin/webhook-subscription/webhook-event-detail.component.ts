import { Component, OnInit, Injector, inject, viewChild } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import {
    WebhookSendAttemptServiceProxy,
    WebhookSubscription,
    WebhookEventServiceProxy,
    WebhookEvent,
} from '@shared/service-proxies/service-proxies';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { Router, ActivatedRoute } from '@angular/router';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { SubHeaderComponent } from '../../shared/common/sub-header/sub-header.component';

import { BusyIfDirective } from '../../../shared/utils/busy-if.directive';
import { TableModule } from 'primeng/table';
import { BsDropdownDirective, BsDropdownToggleDirective, BsDropdownMenuDirective } from 'ngx-bootstrap/dropdown';
import { CreateOrEditWebhookSubscriptionModalComponent } from './create-or-edit-webhook-subscription-modal.component';
import { LuxonFormatPipe } from '../../../shared/utils/luxon-format.pipe';
import { LocalizePipe } from '@shared/common/pipes/localize.pipe';
import { PermissionPipe } from '@shared/common/pipes/permission.pipe';

@Component({
    templateUrl: './webhook-event-detail.component.html',
    styleUrls: ['./webhook-event-detail.component.css'],
    animations: [appModuleAnimation()],
    imports: [
        SubHeaderComponent,
        BusyIfDirective,
        TableModule,
        BsDropdownDirective,
        BsDropdownToggleDirective,
        BsDropdownMenuDirective,
        CreateOrEditWebhookSubscriptionModalComponent,
        ModalDirective,
        LuxonFormatPipe,
        LocalizePipe,
        PermissionPipe,
    ],
})
export class WebhookEventDetailComponent extends AppComponentBase implements OnInit {
    private _webhookEventService = inject(WebhookEventServiceProxy);
    private _webhookSendAttemptService = inject(WebhookSendAttemptServiceProxy);
    private _router = inject(Router);
    private _activatedRoute = inject(ActivatedRoute);

    readonly detailModal = viewChild<ModalDirective>('detailModal');
    subscription: WebhookSubscription;
    loading = true;
    webhookEventId: string;
    webhookEvent: WebhookEvent;

    maxDataLength = 300;
    listMaxResponseLength = 100;
    detailModalText = '';

    constructor(...args: unknown[]);

    constructor() {
        const injector = inject(Injector);

        super(injector);
    }

    ngOnInit() {
        this.webhookEventId = this._activatedRoute.snapshot.queryParams['id'];
        this.getDetail();
    }

    getSendAttempts(event?: any): void {
        this.primengTableHelper.showLoadingIndicator();

        this._webhookSendAttemptService.getAllSendAttemptsOfWebhookEvent(this.webhookEventId).subscribe((result) => {
            this.primengTableHelper.totalRecordsCount = result.items.length;
            this.primengTableHelper.records = result.items;
            this.primengTableHelper.hideLoadingIndicator();
        });
    }

    getDetail(): void {
        this._webhookEventService.get(this.webhookEventId).subscribe((webhookEvent) => {
            this.webhookEvent = webhookEvent;
            this.loading = false;
        });
    }

    goToWebhookSubscriptionDetail(subscriptionId: string): void {
        this._router.navigate(['app/admin/webhook-subscriptions-detail'], {
            queryParams: {
                id: subscriptionId,
            },
        });
    }

    resend(id: string): void {
        this.message.confirm(
            this.l('WebhookEventWillBeSendWithSameParameters'),
            this.l('AreYouSure'),
            (isConfirmed) => {
                if (isConfirmed) {
                    this.showMainSpinner();
                    this._webhookSendAttemptService.resend(id).subscribe(
                        () => {
                            abp.notify.success(this.l('WebhookSendAttemptInQueue'));
                            this.hideMainSpinner();
                        },
                        () => {
                            this.hideMainSpinner();
                        }
                    );
                }
            }
        );
    }

    showDetailModal(text): void {
        this.detailModalText = text;
        this.detailModal().show();
    }

    showMoreData(): void {
        document.getElementById('dataDots').classList.add('d-none');
        document.getElementById('dataShowMoreBtn').classList.add('d-none');
        document.getElementById('dataMore').classList.remove('d-none');
    }
}
