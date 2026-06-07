import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { injectI18nMessages } from "../../app/i18n";
import { fetchAbpUserConfiguration } from "@/api/abp-user-configuration";
import AppConsts from "@/lib/app-consts";

export interface LocaleState {
  selectedLang: string;
  messages: Record<string, string>;
  status: "idle" | "loading" | "succeeded" | "failed";
  error?: string;
}

const initialState: LocaleState = {
  selectedLang: "en",
  messages: {},
  status: "idle",
};

export const loadAbpLocalization = createAsyncThunk<void, void>(
  "locale/loadAbpLocalization",
  async () => {
    const result = await fetchAbpUserConfiguration(
      AppConsts.remoteServiceBaseUrl,
    );
    if (result && window.__applyAbpUserConfiguration) {
      window.__applyAbpUserConfiguration(result);
    }
  },
);

const localeSlice = createSlice({
  name: "locale",
  initialState,
  reducers: {
    setLanguage(state, action: PayloadAction<string>) {
      state.selectedLang = action.payload;
      state.messages = {};
      state.status = "idle";
    },
    setAbpLocalization(
      state,
      action: PayloadAction<{
        selectedLang?: string;
        values?: Record<string, Record<string, string>>;
      }>,
    ) {
      const { selectedLang, values } = action.payload || {};
      if (selectedLang) {
        state.selectedLang = selectedLang;
      }
      if (values && typeof values === "object") {
        const flattened: Record<string, string> = {};
        for (const source of Object.keys(values)) {
          const dict = values[source];
          if (dict && typeof dict === "object") {
            for (const k of Object.keys(dict)) {
              const val = dict[k];
              const compositeKeyDot = `${source}.${k}`;
              const compositeKeyColon = `${source}:${k}`;
              flattened[compositeKeyDot] = val;
              flattened[compositeKeyColon] = val;
              if (flattened[k] === undefined) {
                flattened[k] = val;
              }
            }
          }
        }
        state.messages = { ...state.messages, ...flattened };
        injectI18nMessages(state.selectedLang, state.messages);
        state.status = "succeeded";
      }
    },
  },
});

export const { setLanguage, setAbpLocalization } = localeSlice.actions;
export default localeSlice.reducer;
