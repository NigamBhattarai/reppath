import { AuthContext } from '../../middleware/auth';
import { requireAuth, requireRole } from '../../middleware/rbac';
import User from '../../models/User';
import ProgramAssignment from '../../models/ProgramAssignment';
import WorkoutLog from '../../models/WorkoutLog';
import mongoose from 'mongoose';
import Program from '../../models/Program';

export const Query = {
  me: async (_: unknown, __: unknown, context: AuthContext) => {
    const { userId } = requireAuth(context);
    return User.findById(userId);
  },

  gymMembers: async (_: unknown, __: unknown, context: AuthContext) => {
    const { gymId } = requireRole(context, 'owner');
    return User.find({ gymId, role: 'member' });
  },

  gymCoaches: async (_: unknown, __: unknown, context: AuthContext) => {
    const { gymId } = requireRole(context, 'owner');
    return User.find({ gymId, role: 'coach' });
  },

  coachMembers: async (
    _: unknown,
    { coachId }: { coachId: string },
    context: AuthContext
  ) => {
    const { gymId } = requireRole(context, 'owner');
    return User.find({ gymId, role: 'member', assignedCoachId: coachId });
  },

  ownerDashboard: async (_: unknown, __: unknown, context: AuthContext) => {
    const { gymId } = requireRole(context, 'owner');
    const gymObjectId = new mongoose.Types.ObjectId(gymId);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [
      totalMembers,
      totalCoaches,
      activeProgramAssignments,
      workoutLogsLast7Days
    ] = await Promise.all([
      User.countDocuments({ gymId: gymObjectId, role: 'member', isActive: true }),
      User.countDocuments({ gymId: gymObjectId, role: 'coach', isActive: true }),
      ProgramAssignment.countDocuments({ gymId: gymObjectId, isActive: true }),
      WorkoutLog.countDocuments({
        gymId: gymObjectId,
        date: { $gte: sevenDaysAgo }
      })
    ]);

    return {
      totalMembers,
      totalCoaches,
      activeProgramAssignments,
      workoutLogsLast7Days
    };
  },
  myPrograms: async (_: unknown, __: unknown, context: AuthContext) => {
    const { userId } = requireRole(context, 'coach');
    return Program.find({ coachId: userId, isDeleted: false });
  },

  program: async (_: unknown, { id }: { id: string }, context: AuthContext) => {
    const { userId, role } = requireRole(context, 'coach', 'member');

    const program = await Program.findOne({ _id: id, isDeleted: false });
    if (!program) {
      throw new Error('Program not found');
    }

    if (role === 'coach') {
      if (program.coachId.toString() !== userId) {
        throw new Error('You do not have permission to view this program');
      }
    }

    if (role === 'member') {
      const assignment = await ProgramAssignment.findOne({
        memberId: userId,
        programId: id,
        isActive: true
      });
      if (!assignment) {
        throw new Error('You are not assigned to this program');
      }
    }

    return program;
  },

  myMembers: async (_: unknown, __: unknown, context: AuthContext) => {
    const { userId } = requireRole(context, 'coach');
    return User.find({ assignedCoachId: userId, role: 'member' });
  },

  memberWorkoutLogs: async (
    _: unknown,
    { memberId, limit = 10, offset = 0 }: { memberId: string; limit?: number; offset?: number },
    context: AuthContext
  ) => {
    const { userId } = requireRole(context, 'coach');

    const member = await User.findOne({
      _id: memberId,
      assignedCoachId: userId
    });
    if (!member) {
      throw new Error('Member not found or not assigned to you');
    }

    return WorkoutLog.find({ memberId })
      .sort({ date: -1 })
      .skip(offset)
      .limit(limit);
  },

  coachDashboard: async (_: unknown, __: unknown, context: AuthContext) => {
    const { userId } = requireRole(context, 'coach');
    const coachObjectId = new mongoose.Types.ObjectId(userId);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const memberSummaries = await User.aggregate([
      {
        $match: {
          assignedCoachId: coachObjectId,
          role: 'member',
          isActive: true
        }
      },
      {
        $lookup: {
          from: 'workoutlogs',
          localField: '_id',
          foreignField: 'memberId',
          as: 'logs'
        }
      },
      {
        $addFields: {
          lastWorkoutDate: { $max: '$logs.date' },
          hasLoggedThisWeek: {
            $gt: [
              {
                $size: {
                  $filter: {
                    input: '$logs',
                    as: 'log',
                    cond: { $gte: ['$$log.date', sevenDaysAgo] }
                  }
                }
              },
              0
            ]
          }
        }
      },
      {
        $project: {
          logs: 0
        }
      }
    ]);

    const totalAssigned = memberSummaries.length;
    const activeThisWeek = memberSummaries.filter(m => m.hasLoggedThisWeek).length;

    return {
      memberSummaries: memberSummaries.map(m => ({
        member: m,
        lastWorkoutDate: m.lastWorkoutDate ?? null,
        hasLoggedThisWeek: m.hasLoggedThisWeek
      })),
      totalAssigned,
      activeThisWeek
    };
  },
  // placeholders for later features
  memberProgress: () => null,
  myAssignment: () => null,
  myWorkoutLogs: () => [],
  myProgress: () => null,
  myLoggedExercises: () => [],
  memberLoggedExercises: () => []
};