import { AuthContext } from '../../middleware/auth';
import { requireRole } from '../../middleware/rbac';
import { hashPassword, comparePassword } from '../../utils/password';
import { signToken } from '../../utils/jwt';
import User from '../../models/User';
import Gym from '../../models/Gym';
import ProgramAssignment from '../../models/ProgramAssignment';
import mongoose from 'mongoose';
import Program from '../../models/Program';
import WorkoutLog from '../../models/WorkoutLog';
import { loginSchema, registerOwnerSchema } from '../../validation/auth.schemas';
import { createUserSchema } from '../../validation/user.schemas';
import { createProgramSchema, updateProgramSchema } from '../../validation/program.schemas';
import { logWorkoutSchema } from '../../validation/workout.schemas';

export const Mutation = {
  registerOwner: async (
    _: unknown,
    { input }: { input: unknown },
    _context: AuthContext
  ) => {

    const validated = registerOwnerSchema.parse(input);

    const existingUser = await User.findOne({ email: validated.email.toLowerCase() });
    if (existingUser) {
      throw new Error('An account with this email already exists');
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const passwordHash = await hashPassword(validated.password);

      const gym = await Gym.create(
        [{ name: validated.gymName, ownerId: new mongoose.Types.ObjectId() }],
        { session }
      );

      const user = await User.create(
        [{
          name: validated.name,
          email: validated.email.toLowerCase(),
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
    { input }: { input: unknown },
    _context: AuthContext
  ) => {

    const validated = loginSchema.parse(input);

    const user = await User.findOne({ email: validated.email.toLowerCase() });

    if (!user) {
      throw new Error('Invalid email or password');
    }

    if (!user.isActive) {
      throw new Error('This account has been deactivated');
    }

    const valid = await comparePassword(validated.password, user.passwordHash);
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
    { input }: { input: unknown },
    context: AuthContext
  ) => {
    const { gymId } = await requireRole(context, 'owner');

    const validated = createUserSchema.parse(input);

    const existing = await User.findOne({ email: validated.email.toLowerCase() });
    if (existing) {
      throw new Error('An account with this email already exists');
    }

    const passwordHash = await hashPassword(validated.password);

    return User.create({
      name: validated.name,
      email: validated.email.toLowerCase(),
      passwordHash,
      role: 'coach',
      gymId: new mongoose.Types.ObjectId(gymId),
      isActive: true
    });
  },

  createMember: async (
    _: unknown,
    { input }: { input: unknown },
    context: AuthContext
  ) => {
    const { gymId } = await requireRole(context, 'owner');

    const validated = createUserSchema.parse(input);

    const existing = await User.findOne({ email: validated.email.toLowerCase() });
    if (existing) {
      throw new Error('An account with this email already exists');
    }

    const passwordHash = await hashPassword(validated.password);

    return User.create({
      name: validated.name,
      email: validated.email.toLowerCase(),
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
    const { gymId } = await requireRole(context, 'owner');

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
    const { gymId, userId: ownerId } = await requireRole(context, 'owner');

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

  // Program

  createProgram: async (
    _: unknown,
    { input }: {
      input: unknown
    },
    context: AuthContext
  ) => {
    const { userId, gymId } = await requireRole(context, 'coach');

    const validated = createProgramSchema.parse(input)
    
    return Program.create({
      name: validated.name,
      description: validated.description,
      coachId: new mongoose.Types.ObjectId(userId),
      gymId: new mongoose.Types.ObjectId(gymId),
      weeks: validated.weeks
    });
  },

  updateProgram: async (
    _: unknown,
    { id, input }: { id: string; input: unknown },
    context: AuthContext
  ) => {
    const { userId } = await requireRole(context, 'coach');
    const validated = updateProgramSchema.parse(input);
    const program = await Program.findOne({ _id: id, coachId: userId });
    if (!program) {
      throw new Error('Program not found or you do not have permission to edit it');
    }

    if (validated.name !== undefined) program.name = validated.name;
    if (validated.description !== undefined) program.description = validated.description;
    if (validated.weeks !== undefined) program.weeks = validated.weeks as typeof program.weeks;

    return program.save();
  },

  deleteProgram: async (
    _: unknown,
    { id }: { id: string },
    context: AuthContext
  ) => {
    const { userId } = await requireRole(context, 'coach');

    const program = await Program.findOne({ _id: id, coachId: userId });
    if (!program) {
      throw new Error('Program not found or you do not have permission to delete it');
    }

    const activeAssignment = await ProgramAssignment.findOne({
      programId: id,
      isActive: true
    });
    if (activeAssignment) {
      throw new Error('Cannot delete a program with active assignments');
    }

    program.isDeleted = true;
    await program.save();

    return true;
  },

  assignProgram: async (
    _: unknown,
    { memberId, programId }: { memberId: string; programId: string },
    context: AuthContext
  ) => {
    const { userId, gymId } = await requireRole(context, 'coach');

    const member = await User.findOne({
      _id: memberId,
      assignedCoachId: userId,
      role: 'member',
      isActive: true
    });
    if (!member) {
      throw new Error('Member not found or not assigned to you');
    }

    const program = await Program.findOne({
      _id: programId,
      coachId: userId,
      isDeleted: false
    });
    if (!program) {
      throw new Error('Program not found or has been deleted');
    }

    await ProgramAssignment.updateMany(
      { memberId, isActive: true },
      { isActive: false }
    );

    return ProgramAssignment.create({
      programId: new mongoose.Types.ObjectId(programId),
      memberId: new mongoose.Types.ObjectId(memberId),
      coachId: new mongoose.Types.ObjectId(userId),
      gymId: new mongoose.Types.ObjectId(gymId),
      startDate: new Date(),
      isActive: true
    });
  },

  unassignProgram: async (
    _: unknown,
    { memberId }: { memberId: string },
    context: AuthContext
  ) => {
    const { userId } = await requireRole(context, 'coach');

    const member = await User.findOne({
      _id: memberId,
      assignedCoachId: userId,
      role: 'member'
    });
    if (!member) {
      throw new Error('Member not found or not assigned to you');
    }

    const result = await ProgramAssignment.updateMany(
      { memberId, isActive: true },
      { isActive: false }
    );

    if (result.modifiedCount === 0) {
      throw new Error('This member has no active program assignment');
    }

    return true;
  },
  
  //Workout Log
  logWorkout: async (
    _: unknown,
    { input }: {
      input: unknown
    },
    context: AuthContext
  ) => {
    const { userId } = await requireRole(context, 'member');

    const validated = logWorkoutSchema.parse(input);

    const assignment = await ProgramAssignment.findOne({
      _id: validated.assignmentId,
      memberId: userId,
      isActive: true
    });
    if (!assignment) {
      throw new Error('Active program assignment not found');
    }

    const existingLog = await WorkoutLog.findOne({
      memberId: userId,
      assignmentId: validated.assignmentId,
      weekNumber: validated.weekNumber,
      dayNumber: validated.dayNumber
    });
    if (existingLog) {
      throw new Error('You have already logged this day');
    }

    return WorkoutLog.create({
      memberId: new mongoose.Types.ObjectId(userId),
      programId: assignment.programId,
      assignmentId: new mongoose.Types.ObjectId(validated.assignmentId),
      gymId: assignment.gymId,
      weekNumber: validated.weekNumber,
      dayNumber: validated.dayNumber,
      date: validated.date,
      exercises: validated.exercises,
      notes: validated.notes ?? null
    });
  },
};