export function handleAbpError(error: unknown): void {
  if (!error || typeof error !== "object" || !("response" in error)) {
    return;
  }

  const response = (error as { response?: unknown }).response;
  if (!response || typeof response !== "object" || !("data" in response)) {
    return;
  }
  const data = (response as { data: unknown }).data as Record<string, unknown>;

  if (
    data.error &&
    typeof data.error === "object" &&
    "validationErrors" in data.error &&
    Array.isArray((data.error as Record<string, unknown>).validationErrors) &&
    (data.error as Record<string, unknown[]>).validationErrors.length > 0
  ) {
    let validationErrorMessage = "";
    const validationErrors = (data.error as Record<string, unknown[]>)
      .validationErrors;
    for (let i = 0; i < validationErrors.length; i++) {
      const validationError = validationErrors[i];
      if (
        validationError &&
        typeof validationError === "object" &&
        "message" in validationError
      ) {
        const msg = (validationError as Record<string, unknown>).message;
        if (typeof msg === "string") {
          validationErrorMessage += msg + "\n";
        }
      }
    }
    if (validationErrorMessage) {
      abp.message.error(validationErrorMessage);
    }
  } else if (
    data.error &&
    typeof data.error === "object" &&
    "message" in data.error
  ) {
    const msg = (data.error as Record<string, unknown>).message;
    if (typeof msg === "string") {
      abp.message.error(msg);
    }
  } else if (!data.success) {
    const errorObj = data.error as Record<string, unknown> | undefined;
    const details = errorObj?.details;
    if (typeof details === "string") {
      abp.message.error(details);
    }
  }
}
