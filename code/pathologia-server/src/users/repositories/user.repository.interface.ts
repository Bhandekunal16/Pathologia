import { Role } from '../../shared/enums/role.enum';
import { Status } from '../../shared/enums/status.enum';
import { UserDocument } from '../schemas/user.schema';

export interface CreateUserData {
  fullName: string;
  email: string;
  username: string;
  password: string;
  role: Role;
  status?: Status;
  department?: string;
  specialization?: string;
}

export interface UpdateUserData {
  fullName?: string;
  email?: string;
  username?: string;
  role?: Role;
  status?: Status;
  department?: string;
  specialization?: string;
}

export interface UserListFilter {
  role?: Role;
  status?: Status;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IUserRepository {
  create(data: CreateUserData): Promise<UserDocument>;
  findById(id: string): Promise<UserDocument | null>;
  findByEmail(email: string): Promise<UserDocument | null>;
  findByUsername(username: string): Promise<UserDocument | null>;
  findByEmailOrUsername(identifier: string): Promise<UserDocument | null>;
  findAll(filter: UserListFilter): Promise<PaginatedResult<UserDocument>>;
  update(id: string, data: UpdateUserData): Promise<UserDocument | null>;
  delete(id: string): Promise<boolean>;
  updateStatus(id: string, status: Status): Promise<UserDocument | null>;
  updatePassword(id: string, passwordHash: string): Promise<void>;
  updateLastLogin(id: string): Promise<void>;
  setRefreshTokenHash(id: string, hash: string | null): Promise<void>;
  findByIdWithSecrets(id: string): Promise<UserDocument | null>;
}

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');
