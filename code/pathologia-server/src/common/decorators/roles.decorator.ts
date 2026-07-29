import { SetMetadata } from '@nestjs/common';
import { Role } from '../../shared/enums/role.enum';
import { ROLES_KEY } from '../../config/constants';

export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
