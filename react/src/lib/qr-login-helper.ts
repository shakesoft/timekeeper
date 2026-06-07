export function isQrLoginEnabled(): boolean {
  try {
    return !!abp?.setting?.getBoolean?.("App.UserManagement.IsQrLoginEnabled");
  } catch {
    return false;
  }
}
