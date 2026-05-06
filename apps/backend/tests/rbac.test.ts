import mongoose from 'mongoose';
import { connectTestDB, closeTestDB, clearTestDB } from './setup';
import { requireAuth, requireRole } from '../src/middleware/rbac';
import User from '../src/models/User';
import Gym from '../src/models/Gym';

beforeAll(async () => {
  await connectTestDB();
});

afterAll(async () => {
  await closeTestDB();
});

beforeEach(async () => {
  await clearTestDB();
});

describe('requireAuth', () => {
  it('throws if no user in context', async () => {
    await expect(
      requireAuth({ user: null })
    ).rejects.toThrow('UNAUTHENTICATED');
  });

  it('throws if user is deactivated', async () => {
    const gym = await Gym.create({
      name: 'Test Gym',
      ownerId: new mongoose.Types.ObjectId()
    });

    const user = await User.create({
      name: 'Test User',
      email: 'test@test.com',
      passwordHash: 'hash',
      role: 'member',
      gymId: gym._id,
      isActive: false
    });

    await expect(
      requireAuth({
        user: {
          userId: user._id.toString(),
          role: 'member',
          gymId: gym._id.toString()
        }
      })
    ).rejects.toThrow('UNAUTHENTICATED');
  });

  it('returns user payload if active', async () => {
    const gym = await Gym.create({
      name: 'Test Gym',
      ownerId: new mongoose.Types.ObjectId()
    });

    const user = await User.create({
      name: 'Active User',
      email: 'active@test.com',
      passwordHash: 'hash',
      role: 'member',
      gymId: gym._id,
      isActive: true
    });

    const payload = {
      userId: user._id.toString(),
      role: 'member' as const,
      gymId: gym._id.toString()
    };

    const result = await requireAuth({ user: payload });
    expect(result.userId).toBe(payload.userId);
  });
});

describe('requireRole', () => {
  it('throws if role does not match', async () => {
    const gym = await Gym.create({
      name: 'Test Gym',
      ownerId: new mongoose.Types.ObjectId()
    });

    const user = await User.create({
      name: 'Member User',
      email: 'member@test.com',
      passwordHash: 'hash',
      role: 'member',
      gymId: gym._id,
      isActive: true
    });

    await expect(
      requireRole(
        {
          user: {
            userId: user._id.toString(),
            role: 'member',
            gymId: gym._id.toString()
          }
        },
        'owner'
      )
    ).rejects.toThrow('UNAUTHORIZED');
  });
});