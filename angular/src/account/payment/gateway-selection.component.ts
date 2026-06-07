import { Component, Injector, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { accountModuleAnimation } from '@shared/animations/routerTransition';
import { AppComponentBase } from '@shared/common/app-component-base';
import {
    PaymentServiceProxy,
    TenantRegistrationServiceProxy,
    PaymentGatewayModel,
    CreatePaymentDto,
    SubscriptionPaymentDto,
    UpdatePaymentDto,
} from '@shared/service-proxies/service-proxies';
import { AppConsts } from '@shared/AppConsts';
import { PaymentHelperService } from './payment-helper.service';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LocalizePipe } from '@shared/common/pipes/localize.pipe';

@Component({
    templateUrl: './gateway-selection.component.html',
    animations: [accountModuleAnimation()],
    imports: [FormsModule, DecimalPipe, LocalizePipe],
})
export class GatewaySelectionComponent extends AppComponentBase implements OnInit {
    private _activatedRoute = inject(ActivatedRoute);
    private _router = inject(Router);
    private _paymnetHelperService = inject(PaymentHelperService);
    private _paymentAppService = inject(PaymentServiceProxy);
    private _tenantRegistrationService = inject(TenantRegistrationServiceProxy);

    payment: SubscriptionPaymentDto = new SubscriptionPaymentDto();
    tenantId: number = abp.session.tenantId;
    paymentId: number;

    paymentGateways: PaymentGatewayModel[];
    supportsRecurringPayments = false;
    recurringPaymentEnabled = false;

    constructor(...args: unknown[]);

    constructor() {
        const injector = inject(Injector);

        super(injector);
    }

    ngOnInit(): void {
        this.paymentId = parseInt(this._activatedRoute.snapshot.queryParams['paymentId']);
        this._paymentAppService.getPayment(this.paymentId).subscribe((result: SubscriptionPaymentDto) => {
            this.payment = result;
            abp.multiTenancy.setTenantIdCookie(result.tenantId);
        });

        this._paymentAppService.getActiveGateways(undefined).subscribe((result: PaymentGatewayModel[]) => {
            this.paymentGateways = result;
            this.supportsRecurringPayments = result.some((pg) => pg.supportsRecurringPayments);
        });
    }

    checkout(gatewayType) {
        let input = {} as UpdatePaymentDto;
        input.paymentId = this.paymentId;
        input.isRecurring = this.recurringPaymentEnabled;
        input.gateway = gatewayType.toString();

        this._paymentAppService.updatePayment(input).subscribe(() => {
            this._router.navigate(
                ['account/' + this.getPaymentGatewayType(gatewayType).toLocaleLowerCase() + '-pre-payment'],
                {
                    queryParams: {
                        paymentId: this.paymentId,
                    },
                }
            );
        });
    }

    getPaymentGatewayType(gatewayType): string {
        return this._paymnetHelperService.getPaymentGatewayType(gatewayType);
    }
}
