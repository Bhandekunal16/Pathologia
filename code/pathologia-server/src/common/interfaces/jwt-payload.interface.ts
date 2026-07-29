export interface AuthJwtPayload {
  sub: string;
  email: string;
  username: string;
  role: string;
}

export interface AuthenticatedUser extends AuthJwtPayload {
  userId: string;
}
