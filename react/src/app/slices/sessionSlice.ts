import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {
  UserLoginInfoDto,
  TenantLoginInfoDto,
  ApplicationInfoDto,
  UiCustomizationSettingsDto,
  GetCurrentLoginInformationsOutput,
} from "@/api/generated/service-proxies";

export interface SessionState {
  user: UserLoginInfoDto | null;
  tenant: TenantLoginInfoDto | null;
  permissions: { [key: string]: boolean };
  features?: { [key: string]: unknown };
  application: ApplicationInfoDto | null;
  theme?: UiCustomizationSettingsDto | null;
  isLoaded: boolean;
}

const initialState: SessionState = {
  user: null,
  tenant: null,
  permissions: {},
  features: {},
  application: null,
  theme: null,
  isLoaded: false,
};

const sessionSlice = createSlice({
  name: "session",
  initialState,
  reducers: {
    setSession: (
      state,
      action: PayloadAction<
        Partial<GetCurrentLoginInformationsOutput> & Record<string, unknown>
      >,
    ) => {
      const payload = action.payload || {};

      state.user = (payload.user as UserLoginInfoDto | null) || null;
      state.tenant = (payload.tenant as TenantLoginInfoDto | null) || null;
      state.application =
        payload.application !== undefined
          ? (payload.application as ApplicationInfoDto | null)
          : state.application;
      state.theme =
        payload.theme !== undefined
          ? (payload.theme as UiCustomizationSettingsDto | null)
          : state.theme;

      const auth = payload.auth as Record<string, unknown> | undefined;
      const granted =
        auth?.grantedPermissions ||
        payload.grantedPermissions ||
        payload.permissions ||
        {};
      const permMap: { [key: string]: boolean } = {};
      if (Array.isArray(granted)) {
        granted.forEach((p: string) => (permMap[p] = true));
      } else if (granted && typeof granted === "object") {
        Object.keys(granted).forEach(
          (k) =>
            (permMap[k] = !!(granted as Record<string, unknown>)[k] || true),
        );
      }
      state.permissions = permMap;

      const app = payload.application as Record<string, unknown> | undefined;
      state.features =
        (payload.features as Record<string, unknown> | undefined) ||
        (app?.features as Record<string, unknown> | undefined) ||
        {};
      state.isLoaded = true;
    },
    clearSession: (state) => {
      state.user = null;
      state.tenant = null;
      state.permissions = {};
      state.features = {};
      state.application = null;
      state.theme = null;
      state.isLoaded = false;
    },
  },
});

export const { setSession, clearSession } = sessionSlice.actions;
export default sessionSlice.reducer;
