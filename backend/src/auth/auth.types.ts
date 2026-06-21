import { UserRole } from '../common/enums';

export interface JwtPayload {
  sub: string;
  email: string;
  name: string;
  role: UserRole;
  restaurantId: string | null;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  restaurantId: string | null;
}

export interface AuthResult {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: AuthUser;
}
