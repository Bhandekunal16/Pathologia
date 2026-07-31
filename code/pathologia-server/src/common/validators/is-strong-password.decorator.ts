import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

export interface PasswordPolicy {
  readonly minLength: number;
  readonly specialChars: string;
}

export const DEFAULT_PASSWORD_POLICY = {
  minLength: 8,
  specialChars: '@$!%*?&#',
} as const satisfies PasswordPolicy;

export function getStrongPasswordMessage(
  policy: PasswordPolicy = DEFAULT_PASSWORD_POLICY,
): string {
  return `Password must be at least ${policy.minLength} characters and include uppercase, lowercase, number, and special character`;
}

export function isStrongPassword(
  value: string,
  policy: PasswordPolicy = DEFAULT_PASSWORD_POLICY,
): boolean {
  if (value.length < policy.minLength) {
    return false;
  }

  let hasLower = false;
  let hasUpper = false;
  let hasDigit = false;
  let hasSpecial = false;

  for (const char of value) {
    if (char >= 'a' && char <= 'z') {
      hasLower = true;
      continue;
    }

    if (char >= 'A' && char <= 'Z') {
      hasUpper = true;
      continue;
    }

    if (char >= '0' && char <= '9') {
      hasDigit = true;
      continue;
    }

    if (policy.specialChars.includes(char)) {
      hasSpecial = true;
      continue;
    }

    return false;
  }

  return hasLower && hasUpper && hasDigit && hasSpecial;
}

@ValidatorConstraint({ name: 'isStrongPassword', async: false })
export class IsStrongPasswordConstraint implements ValidatorConstraintInterface {
  public validate(value: unknown): boolean {
    return typeof value === 'string' && isStrongPassword(value);
  }

  public defaultMessage(): string {
    return getStrongPasswordMessage();
  }
}

export function IsStrongPassword(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsStrongPasswordConstraint,
    });
  };
}
