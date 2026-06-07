import "/metronic/assets/sass/style.react.scss";
import "/metronic/flaticon/flaticon.css";
import "/metronic/fonticon/fonticon.css";

import "animate.css";
import "quill/dist/quill.core.css";
import "quill/dist/quill.snow.css";
import "sweetalert2/dist/sweetalert2.css";
import "cookieconsent/build/cookieconsent.min.css";
import "famfamfam-flags/dist/sprite/famfamfam-flags.css";
import "primeicons/primeicons.css";

import Swal from "sweetalert2";

import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./app/store";
import "./app/i18n";
import App from "./App.tsx";
import "./lib/jquery-polyfill";
import "abp-web-resources";
import "./lib/abp-base";
import { AppPreBootstrap } from "./app/bootstrap/AppPreBootstrap.ts";
import { initializeAuth } from "./app/bootstrap/AppBootstrap";
import { initializeDayjs } from "./lib/dayjs-config";

if (typeof window !== "undefined") {
  (window as { Swal?: typeof Swal }).Swal = Swal;
}

declare global {
  interface Window {
    __msalPopupCallback?: boolean;
  }
}

if (window.__msalPopupCallback) {
  import("@azure/msal-browser/redirect-bridge")
    .then(({ broadcastResponseToMainFrame }) => broadcastResponseToMainFrame())
    .catch(() => {});
} else {
  initializeApp();
}

async function initializeApp() {
  initializeDayjs();

  await AppPreBootstrap.run(async () => {
    await initializeAuth();

    createRoot(document.getElementById("root")!).render(
      <Provider store={store}>
        <App />
      </Provider>,
    );
  });
}
