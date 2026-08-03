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

interface CompiledPasswordPolicy {
  readonly minLength: number;
  readonly specialChars: string;
  readonly specialCharSet: ReadonlySet<string>;
}

const COMPILED_DEFAULT_PASSWORD_POLICY: CompiledPasswordPolicy = {
  minLength: DEFAULT_PASSWORD_POLICY.minLength,
  specialChars: DEFAULT_PASSWORD_POLICY.specialChars,
  specialCharSet: new Set(DEFAULT_PASSWORD_POLICY.specialChars),
};

const compiledPolicyCache = new Map<string, CompiledPasswordPolicy>();

function getCompiledPolicy(policy: PasswordPolicy): CompiledPasswordPolicy {
  if (policy === DEFAULT_PASSWORD_POLICY)
    return COMPILED_DEFAULT_PASSWORD_POLICY;

  const cacheKey = `${policy.minLength}\0${policy.specialChars}`;
  let compiled = compiledPolicyCache.get(cacheKey);
  if (!compiled) {
    compiled = {
      minLength: policy.minLength,
      specialChars: policy.specialChars,
      specialCharSet: new Set(policy.specialChars),
    };
    compiledPolicyCache.set(cacheKey, compiled);
  }

  return compiled;
}

export function getStrongPasswordMessage(
  policy: PasswordPolicy = DEFAULT_PASSWORD_POLICY,
): string {
  const compiled = getCompiledPolicy(policy);
  return `Password must be at least ${compiled.minLength} characters and include uppercase, lowercase, digit, and at least one of the following special characters: ${compiled.specialChars}`;
}

export function isStrongPassword(
  value: string,
  policy: PasswordPolicy = DEFAULT_PASSWORD_POLICY,
): boolean {
  const compiled = getCompiledPolicy(policy);

  if (value.length < compiled.minLength) return false;

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

    if (compiled.specialCharSet.has(char)) {
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
