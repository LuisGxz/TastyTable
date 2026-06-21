import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import * as bcrypt from 'bcryptjs';
import { UserRole } from '../common/enums';
import { User } from '../users/schemas/user.schema';
import { RefreshToken } from './schemas/refresh-token.schema';
import { AuthService } from './auth.service';

/** A mutable in-memory user the fake model hands back. */
function makeUser(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    _id: { toString: () => '64b000000000000000000001' },
    email: 'diner@tastytable.app',
    name: 'Diner',
    role: UserRole.Diner,
    restaurantId: null,
    passwordHash: bcrypt.hashSync('Taste123!', 10),
    failedLogins: 0,
    lockedUntil: null as Date | null,
    save: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

async function build(user: ReturnType<typeof makeUser> | null) {
  const userModel = {
    findOne: jest.fn().mockResolvedValue(user),
    exists: jest.fn().mockResolvedValue(false),
    create: jest.fn().mockResolvedValue(makeUser()),
    findById: jest.fn().mockResolvedValue(user),
  };
  const tokenModel = { create: jest.fn().mockResolvedValue({}), updateMany: jest.fn().mockResolvedValue({}) };
  const moduleRef = await Test.createTestingModule({
    imports: [JwtModule.register({ secret: 'test-secret', signOptions: { expiresIn: '15m' } })],
    providers: [
      AuthService,
      { provide: getModelToken(User.name), useValue: userModel },
      { provide: getModelToken(RefreshToken.name), useValue: tokenModel },
    ],
  }).compile();
  return { svc: moduleRef.get(AuthService), userModel, tokenModel };
}

describe('AuthService', () => {
  it('registers a new account and issues tokens', async () => {
    const { svc, tokenModel } = await build(null);
    const res = await svc.register({ email: 'New@T.app', password: 'Taste123!', name: 'New' });
    expect(res.accessToken).toBeTruthy();
    expect(res.refreshToken).toBeTruthy();
    expect(res.user.role).toBe(UserRole.Diner);
    expect(tokenModel.create).toHaveBeenCalled(); // refresh token persisted
  });

  it('rejects duplicate registration', async () => {
    const { svc, userModel } = await build(null);
    userModel.exists.mockResolvedValueOnce(true);
    await expect(svc.register({ email: 'dup@t.app', password: 'Taste123!', name: 'Dup' })).rejects.toBeInstanceOf(ConflictException);
  });

  it('logs in with correct credentials', async () => {
    const { svc } = await build(makeUser());
    const res = await svc.login({ email: 'diner@tastytable.app', password: 'Taste123!' });
    expect(res.user.email).toBe('diner@tastytable.app');
  });

  it('rejects a wrong password and counts the failure', async () => {
    const user = makeUser();
    const { svc } = await build(user);
    await expect(svc.login({ email: 'diner@tastytable.app', password: 'nope' })).rejects.toBeInstanceOf(UnauthorizedException);
    expect(user.failedLogins).toBe(1);
    expect(user.save).toHaveBeenCalled();
  });

  it('locks the account after 5 failures', async () => {
    const user = makeUser({ failedLogins: 4 });
    const { svc } = await build(user);
    await expect(svc.login({ email: 'diner@tastytable.app', password: 'nope' })).rejects.toBeInstanceOf(UnauthorizedException);
    expect(user.failedLogins).toBe(5);
    expect(user.lockedUntil).toBeInstanceOf(Date);
  });

  it('does not leak whether an email exists', async () => {
    const { svc } = await build(null);
    await expect(svc.login({ email: 'ghost@t.app', password: 'whatever' })).rejects.toThrow('Invalid email or password.');
  });
});
