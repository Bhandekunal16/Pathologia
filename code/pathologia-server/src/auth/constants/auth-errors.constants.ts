import rawConfig from '../../config/json/auth.config.json';

export interface AuthErrors {
  readonly INVALID_CREDENTIALS: string;
  readonly ACCOUNT_INACTIVE: string;
  readonly INVALID_REFRESH_TOKEN: string;
  readonly USER_NOT_FOUND: string;
  readonly USER_NOT_ACTIVE: string;
}

export const AUTH_ERRORS: AuthErrors = rawConfig.AUTH_ERRORS;
