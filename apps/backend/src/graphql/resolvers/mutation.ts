import { AuthContext } from '../../middleware/auth';
import { hashPassword, comparePassword } from '../../utils/password';
import { signToken } from '../../utils/jwt';
import User from '../../models/User';
import Gym from '../../models/Gym';
import mongoose from 'mongoose';

export const Mutation = {
  registerOwner: async (
    _: unknown,
    { input }: { input: { name: string; email: string; password: string; gymName: string } },
    _context: AuthContext
  ) => {
    const existingUser = await User.findOne({ email: input.email.toLowerCase() });
    if (existingUser) {
      throw new Error('An account with this email already exists');
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const passwordHash = await hashPassword(input.password);

      const gym = await Gym.create(
        [{ name: input.gymName, ownerId: new mongoose.Types.ObjectId() }],
        { session }
      );

      const user = await User.create(
        [{
          name: input.name,
          email: input.email.toLowerCase(),
          passwordHash,
          role: 'owner',
          gymId: gym[0]._id,
          isActive: true
        }],
        { session }
      );

      await Gym.findByIdAndUpdate(
        gym[0]._id,
        { ownerId: user[0]._id },
        { session }
      );

      await session.commitTransaction();

      const token = signToken({
        userId: user[0]._id.toString(),
        role: 'owner',
        gymId: gym[0]._id.toString()
      });

      return { token, user: user[0] };

    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  },

  login: async (
    _: unknown,
    { input }: { input: { email: string; password: string } },
    _context: AuthContext
  ) => {
    const user = await User.findOne({ email: input.email.toLowerCase() });

    if (!user) {
      throw new Error('Invalid email or password');
    }

    if (!user.isActive) {
      throw new Error('This account has been deactivated');
    }

    const valid = await comparePassword(input.password, user.passwordHash);
    if (!valid) {
      throw new Error('Invalid email or password');
    }

    const token = signToken({
      userId: user._id.toString(),
      role: user.role,
      gymId: user.gymId.toString()
    });

    return { token, user };
  }
};