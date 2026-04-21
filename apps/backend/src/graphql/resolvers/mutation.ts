import { AuthContext } from '../../middleware/auth';
import { requireRole } from '../../middleware/rbac';
import { hashPassword, comparePassword } from '../../utils/password';
import { signToken } from '../../utils/jwt';
import User from '../../models/User';
import Gym from '../../models/Gym';
import ProgramAssignment from '../../models/ProgramAssignment';
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
  },

  // --- Owner Mutations ---

  createCoach: async (
    _: unknown,
    { input }: { input: { name: string; email: string; password: string } },
    context: AuthContext
  ) => {
    const { gymId } = requireRole(context, 'owner');

    const existing = await User.findOne({ email: input.email.toLowerCase() });
    if (existing) {
      throw new Error('An account with this email already exists');
    }

    const passwordHash = await hashPassword(input.password);

    return User.create({
      name: input.name,
      email: input.email.toLowerCase(),
      passwordHash,
      role: 'coach',
      gymId: new mongoose.Types.ObjectId(gymId),
      isActive: true
    });
  },

  createMember: async (
    _: unknown,
    { input }: { input: { name: string; email: string; password: string } },
    context: AuthContext
  ) => {
    const { gymId } = requireRole(context, 'owner');

    const existing = await User.findOne({ email: input.email.toLowerCase() });
    if (existing) {
      throw new Error('An account with this email already exists');
    }

    const passwordHash = await hashPassword(input.password);

    return User.create({
      name: input.name,
      email: input.email.toLowerCase(),
      passwordHash,
      role: 'member',
      gymId: new mongoose.Types.ObjectId(gymId),
      isActive: true
    });
  },

  assignMemberToCoach: async (
    _: unknown,
    { memberId, coachId }: { memberId: string; coachId: string },
    context: AuthContext
  ) => {
    const { gymId } = requireRole(context, 'owner');

    const member = await User.findOne({
      _id: memberId,
      gymId,
      role: 'member'
    });
    if (!member) {
      throw new Error('Member not found in your gym');
    }

    const coach = await User.findOne({
      _id: coachId,
      gymId,
      role: 'coach',
      isActive: true
    });
    if (!coach) {
      throw new Error('Coach not found or is inactive');
    }

    member.assignedCoachId = new mongoose.Types.ObjectId(coachId);
    await member.save();

    return member;
  },

  deactivateUser: async (
    _: unknown,
    { userId }: { userId: string },
    context: AuthContext
  ) => {
    const { gymId, userId: ownerId } = requireRole(context, 'owner');

    if (userId === ownerId) {
      throw new Error('You cannot deactivate your own account');
    }

    const user = await User.findOne({ _id: userId, gymId });
    if (!user) {
      throw new Error('User not found in your gym');
    }

    user.isActive = false;
    await user.save();

    return user;
  },
};