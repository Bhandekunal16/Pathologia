import { Role } from '../../shared/enums/role.enum';

export interface AuthJwtPayload {
  readonly sub: string;
  readonly email: string;
  readonly username: string;
  readonly role: Role;
}

export interface AuthenticatedUser extends AuthJwtPayload {
  readonly userId: string;
}
