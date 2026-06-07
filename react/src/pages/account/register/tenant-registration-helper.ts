export type RegisterTenantResult = {
  tenantId: number;
  tenancyName?: string;
  name?: string;
  userName?: string;
  emailAddress?: string;
  isTenantActive: boolean;
  isActive: boolean;
  isEmailConfirmationRequired: boolean;
  paymentId?: number;
} | null;

class TenantRegistrationHelper {
  private _result: RegisterTenantResult = null;

  set(result: RegisterTenantResult) {
    this._result = result ?? null;
  }

  get(): RegisterTenantResult {
    return this._result;
  }

  clear() {
    this._result = null;
  }
}

const tenantRegistrationHelper = new TenantRegistrationHelper();
export default tenantRegistrationHelper;
