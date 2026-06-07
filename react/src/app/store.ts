import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./slices/authSlice";
import sessionSlice from "./slices/sessionSlice";
import uiSlice from "./slices/uiSlice";
import localeSlice from "./slices/localeSlice";

export const store = configureStore({
  reducer: {
    auth: authSlice,
    ui: uiSlice,
    session: sessionSlice,
    locale: localeSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST"],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
