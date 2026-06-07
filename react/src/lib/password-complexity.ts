import { PasswordComplexitySetting } from "@api/generated/service-proxies";
import L from "./L";

export function getPasswordComplexityErrors(
  password: string | undefined,
  rules?: PasswordComplexitySetting | null,
): string[] {
  const errors: string[] = [];
  if (!password || !rules) return errors;

  if (rules.requiredLength && password.length < rules.requiredLength) {
    errors.push(
      L("PasswordComplexity_RequiredLength_Hint", rules.requiredLength),
    );
  }
  if (rules.requireDigit && !/[0-9]/.test(password)) {
    errors.push(L("PasswordComplexity_RequireDigit_Hint"));
  }
  if (rules.requireLowercase && !/[a-z]/.test(password)) {
    errors.push(L("PasswordComplexity_RequireLowercase_Hint"));
  }
  if (rules.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push(L("PasswordComplexity_RequireUppercase_Hint"));
  }
  if (rules.requireNonAlphanumeric && !/[^A-Za-z0-9]/.test(password)) {
    errors.push(L("PasswordComplexity_RequireNonAlphanumeric_Hint"));
  }

  return errors;
}

export function getPasswordComplexityHints(
  rules?: PasswordComplexitySetting | null,
): string[] {
  if (!rules) return [];
  const hints: string[] = [];
  if (rules.requireDigit) hints.push(L("PasswordComplexity_RequireDigit_Hint"));
  if (rules.requireLowercase)
    hints.push(L("PasswordComplexity_RequireLowercase_Hint"));
  if (rules.requireUppercase)
    hints.push(L("PasswordComplexity_RequireUppercase_Hint"));
  if (rules.requireNonAlphanumeric)
    hints.push(L("PasswordComplexity_RequireNonAlphanumeric_Hint"));
  if (rules.requiredLength)
    hints.push(
      L("PasswordComplexity_RequiredLength_Hint", {
        0: rules.requiredLength,
      }),
    );
  return hints;
}
