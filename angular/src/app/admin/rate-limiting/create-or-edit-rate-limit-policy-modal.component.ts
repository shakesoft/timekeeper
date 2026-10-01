import { Component, Injector, inject, output, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppComponentBase } from '@shared/common/app-component-base';
import {
    ComboboxItemDto,
    CreateOrEditRateLimitPolicyDto,
    RateLimitAlgorithm,
    RateLimitPolicyServiceProxy,
} from '@shared/service-proxies/service-proxies';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';
import { AppBsModalDirective } from '../../../shared/common/appBsModal/app-bs-modal.directive';
import { ValidationMessagesComponent } from '../../../shared/utils/validation-messages.component';
import { ButtonBusyDirective } from '../../../shared/utils/button-busy.directive';
import { LocalizePipe } from '@shared/common/pipes/localize.pipe';

@Component({
    selector: 'createOrEditRateLimitPolicyModal',
    templateUrl: './create-or-edit-rate-limit-policy-modal.component.html',
    imports: [AppBsModalDirective, FormsModule, ValidationMessagesComponent, ButtonBusyDirective, LocalizePipe],
})
export class CreateOrEditRateLimitPolicyModalComponent extends AppComponentBase {
    private _rateLimitPolicyService = inject(RateLimitPolicyServiceProxy);

    readonly modal = viewChild<ModalDirective>('createOrEditModal');

    readonly modalSave = output<any>();

    active = false;
    saving = false;

    policy: CreateOrEditRateLimitPolicyDto = new CreateOrEditRateLimitPolicyDto();
    algorithms: { value: number; displayText: string }[] = [];
    partitionTypes: { value: number; displayText: string }[] = [];

    constructor(...args: unknown[]);

    constructor() {
        const injector = inject(Injector);

        super(injector);
    }

    get showWindow(): boolean {
        return (
            this.policy.algorithm === RateLimitAlgorithm.FixedWindow ||
            this.policy.algorithm === RateLimitAlgorithm.SlidingWindow
        );
    }

    get showSlidingWindow(): boolean {
        return this.policy.algorithm === RateLimitAlgorithm.SlidingWindow;
    }

    get showTokenBucket(): boolean {
        return this.policy.algorithm === RateLimitAlgorithm.TokenBucket;
    }

    show(policyId?: number): void {
        this.active = true;

        this._rateLimitPolicyService.getPolicyForEdit(policyId).subscribe((result) => {
            this.policy = result.rateLimitPolicy;
            this.algorithms = this.toNumericItems(result.algorithms);
            this.partitionTypes = this.toNumericItems(result.partitionTypes);
            this.modal().show();
        });
    }

    save(): void {
        this.saving = true;
        this._rateLimitPolicyService
            .createOrEdit(this.policy)
            .pipe(finalize(() => (this.saving = false)))
            .subscribe(() => {
                this.notify.info(this.l('SavedSuccessfully'));
                this.close();
                this.modalSave.emit(null);
            });
    }

    close(): void {
        this.active = false;
        this.modal().hide();
    }

    // Combobox values are enum ints serialized as strings; the DTO expects numbers.
    private toNumericItems(items: ComboboxItemDto[]): { value: number; displayText: string }[] {
        return items.map((i) => ({ value: Number(i.value), displayText: i.displayText }));
    }
}
