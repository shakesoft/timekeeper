import { store } from "@/app/store";
import { setLanguage, loadAbpLocalization } from "@/app/slices/localeSlice";

export async function changeLanguage(lang: string) {
  const expireDate = new Date(
    new Date().getTime() + 365 * 86400000,
  ).toUTCString();
  document.cookie = `Abp.Localization.CultureName=${lang}; path=/; expires=${expireDate}`;
  document.cookie = `.AspNetCore.Culture=c=${lang}|uic=${lang}; path=/; expires=${expireDate}`;

  store.dispatch(setLanguage(lang));
  store.dispatch(loadAbpLocalization());
}
