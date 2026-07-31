import type { Request } from 'express';
import { Role } from '../../shared/enums/role.enum';
import { Status } from '../../shared/enums/status.enum';

export type JwtExpiresIn = `${number}${'s' | 'm' | 'h' | 'd'}`;

export interface JwtUser {
  _id: { toString(): string };
  email: string;
  username: string;
  role: Role;
}

export interface AuthSourceUser extends JwtUser {
  fullName: string;
  status: Status;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface LoginAuditContext {
  request?: Request;
  defaultPath: string;
}

export interface LogoutAuditContext {
  request?: Request;
  defaultPath: string;
}
