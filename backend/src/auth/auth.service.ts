import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import { createHash, randomBytes } from 'node:crypto';
import { Model, Types } from 'mongoose';
import { UserRole } from '../common/enums';
import { User } from '../users/schemas/user.schema';
import { RefreshToken } from './schemas/refresh-token.schema';
import { AuthResult, AuthUser, JwtPayload } from './auth.types';
import { LoginDto, RegisterDto } from './dto/auth.dto';

const LOCKOUT_THRESHOLD = 5;
const LOCKOUT_MINUTES = 15;
const INVALID = 'Invalid email or password.';
const ACCESS_TTL_S = 15 * 60;
const REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000;

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly users: Model<User>,
    @InjectModel(RefreshToken.name) private readonly tokens: Model<RefreshToken>,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResult> {
    const email = dto.email.toLowerCase().trim();
    if (await this.users.exists({ email })) {
      throw new ConflictException('An account with this email already exists.');
    }
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.users.create({
      email, passwordHash, name: dto.name.trim(), role: dto.role ?? UserRole.Diner,
    });
    return this.issue(user);
  }

  async login(dto: LoginDto): Promise<AuthResult> {
    const email = dto.email.toLowerCase().trim();
    const user = await this.users.findOne({ email });
    if (!user) throw new UnauthorizedException(INVALID); // no user enumeration

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const mins = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
      throw new UnauthorizedException(`Account locked. Try again in ${mins} minute(s).`);
    }

    if (!(await bcrypt.compare(dto.password, user.passwordHash))) {
      await this.registerFailure(user);
      throw new UnauthorizedException(INVALID);
    }

    if (user.failedLogins > 0 || user.lockedUntil) {
      user.failedLogins = 0;
      user.lockedUntil = null;
      await user.save();
    }
    return this.issue(user);
  }

  async refresh(refreshToken: string): Promise<AuthResult> {
    const tokenHash = this.hash(refreshToken);
    const stored = await this.tokens.findOne({ tokenHash });
    if (!stored) throw new UnauthorizedException('Invalid refresh token.');

    if (stored.revokedAt) {
      // Reuse of a rotated token → revoke the whole family.
      await this.tokens.updateMany({ userId: stored.userId, revokedAt: null }, { revokedAt: new Date() });
      throw new UnauthorizedException('Refresh token has been revoked.');
    }
    if (stored.expiresAt <= new Date()) throw new UnauthorizedException('Refresh token has expired.');

    const user = await this.users.findById(stored.userId);
    if (!user) throw new UnauthorizedException('Invalid refresh token.');

    const next = await this.issue(user);
    stored.revokedAt = new Date();
    await stored.save();
    return next;
  }

  async logout(refreshToken: string): Promise<void> {
    await this.tokens.updateMany({ tokenHash: this.hash(refreshToken), revokedAt: null }, { revokedAt: new Date() });
  }

  async me(userId: string): Promise<AuthUser> {
    const user = await this.users.findById(userId);
    if (!user) throw new UnauthorizedException();
    return this.toAuthUser(user);
  }

  private async registerFailure(user: import('../users/schemas/user.schema').UserDocument): Promise<void> {
    user.failedLogins += 1;
    if (user.failedLogins >= LOCKOUT_THRESHOLD) {
      user.lockedUntil = new Date(Date.now() + LOCKOUT_MINUTES * 60000);
    }
    await user.save();
  }

  private async issue(user: import('../users/schemas/user.schema').UserDocument): Promise<AuthResult> {
    const authUser = this.toAuthUser(user);
    const payload: JwtPayload = {
      sub: authUser.id, email: authUser.email, name: authUser.name,
      role: authUser.role, restaurantId: authUser.restaurantId,
    };
    const accessToken = await this.jwt.signAsync(payload, { expiresIn: ACCESS_TTL_S });

    const refreshToken = randomBytes(32).toString('base64url');
    await this.tokens.create({
      userId: user._id, tokenHash: this.hash(refreshToken),
      expiresAt: new Date(Date.now() + REFRESH_TTL_MS),
    });

    return { accessToken, refreshToken, expiresIn: ACCESS_TTL_S, user: authUser };
  }

  private toAuthUser(user: import('../users/schemas/user.schema').UserDocument): AuthUser {
    return {
      id: (user._id as Types.ObjectId).toString(),
      email: user.email, name: user.name, role: user.role,
      restaurantId: user.restaurantId ? user.restaurantId.toString() : null,
    };
  }

  private hash(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
