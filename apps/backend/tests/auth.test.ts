import mongoose from 'mongoose';
import { connectTestDB, closeTestDB, clearTestDB } from './setup';
import { Mutation } from '../src/graphql/resolvers/mutation';
import User from '../src/models/User';
import Gym from '../src/models/Gym';

const mockContext = { user: null };

beforeAll(async () => {
  await connectTestDB();
});

afterAll(async () => {
  await closeTestDB();
});

beforeEach(async () => {
  await clearTestDB();
});

describe('registerOwner', () => {
  const validInput = {
    name: 'Test Owner',
    email: 'owner@test.com',
    password: 'Password1',
    gymName: 'Test Gym'
  };

  it('returns a token and user on valid input', async () => {
    const result = await Mutation.registerOwner(
      {},
      { input: validInput },
      mockContext
    );

    expect(result.token).toBeDefined();
    expect(typeof result.token).toBe('string');
    expect(result.user.name).toBe('Test Owner');
    expect(result.user.role).toBe('owner');
  });

  it('creates both user and gym in the database', async () => {
    await Mutation.registerOwner({}, { input: validInput }, mockContext);

    const user = await User.findOne({ email: 'owner@test.com' });
    const gym = await Gym.findOne({ name: 'Test Gym' });

    expect(user).not.toBeNull();
    expect(gym).not.toBeNull();
    expect(user!.gymId.toString()).toBe(gym!._id.toString());
  });

  it('stores password as hash not plaintext', async () => {
    await Mutation.registerOwner({}, { input: validInput }, mockContext);

    const user = await User.findOne({ email: 'owner@test.com' });
    expect(user!.passwordHash).not.toBe('Password1');
    expect(user!.passwordHash).toMatch(/^\$2[aby]\$\d+\$/);
  });

  it('normalizes email to lowercase', async () => {
    await Mutation.registerOwner(
      {},
      { input: { ...validInput, email: 'Owner@TEST.com' } },
      mockContext
    );

    const user = await User.findOne({ email: 'owner@test.com' });
    expect(user).not.toBeNull();
  });

  it('throws if email already exists', async () => {
    await Mutation.registerOwner({}, { input: validInput }, mockContext);

    await expect(
      Mutation.registerOwner({}, { input: validInput }, mockContext)
    ).rejects.toThrow('An account with this email already exists');
  });

  it('throws validation error for invalid email', async () => {
    await expect(
      Mutation.registerOwner(
        {},
        { input: { ...validInput, email: 'notanemail' } },
        mockContext
      )
    ).rejects.toThrow();
  });

  it('throws validation error for short password', async () => {
    await expect(
      Mutation.registerOwner(
        {},
        { input: { ...validInput, password: 'abc' } },
        mockContext
      )
    ).rejects.toThrow();
  });
});

describe('login', () => {
  beforeEach(async () => {
    await Mutation.registerOwner(
      {},
      {
        input: {
          name: 'Test Owner',
          email: 'owner@test.com',
          password: 'Password1',
          gymName: 'Test Gym'
        }
      },
      mockContext
    );
  });

  it('returns token and user on valid credentials', async () => {
    const result = await Mutation.login(
      {},
      { input: { email: 'owner@test.com', password: 'Password1' } },
      mockContext
    );

    expect(result.token).toBeDefined();
    expect(result.user.email).toBe('owner@test.com');
  });

    it('throws correct error for wrong password', async () => {
        await expect(
            Mutation.login(
            {},
            { input: { email: 'owner@test.com', password: 'WrongPass1' } },
            mockContext
            )
        ).rejects.toThrow('Invalid email or password');
    });

    it('throws correct error for wrong email', async () => {
        await expect(
            Mutation.login(
            {},
            { input: { email: 'nobody@test.com', password: 'Password1' } },
            mockContext
            )
        ).rejects.toThrow('Invalid email or password');
    });

  it('throws if account is deactivated', async () => {
    const user = await User.findOne({ email: 'owner@test.com' });
    user!.isActive = false;
    await user!.save();

    await expect(
      Mutation.login(
        {},
        { input: { email: 'owner@test.com', password: 'Password1' } },
        mockContext
      )
    ).rejects.toThrow('This account has been deactivated');
  });
});