import { AuthContext } from '../../middleware/auth';
import { requireAuth, requireRole } from '../../middleware/rbac';
import User from '../../models/User';
import ProgramAssignment from '../../models/ProgramAssignment';
import WorkoutLog from '../../models/WorkoutLog';
import mongoose from 'mongoose';
import Program from '../../models/Program';

export const Query = {
  me: async (_: unknown, __: unknown, context: AuthContext) => {
    const { userId } = await requireAuth(context);
    return User.findById(userId);
  },

  gymMembers: async (_: unknown, __: unknown, context: AuthContext) => {
    const { gymId } = await requireRole(context, 'owner');
    return User.find({ gymId, role: 'member' });
  },

  gymCoaches: async (_: unknown, __: unknown, context: AuthContext) => {
    const { gymId } = await requireRole(context, 'owner');
    return User.find({ gymId, role: 'coach' });
  },

  coachMembers: async (
    _: unknown,
    { coachId }: { coachId: string },
    context: AuthContext
  ) => {
    const { gymId } = await requireRole(context, 'owner');
    return User.find({ gymId, role: 'member', assignedCoachId: coachId });
  },

  ownerDashboard: async (_: unknown, __: unknown, context: AuthContext) => {
    const { gymId } = await requireRole(context, 'owner');
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
    const { userId } = await requireRole(context, 'coach');
    return Program.find({ coachId: userId, isDeleted: false });
  },

  program: async (_: unknown, { id }: { id: string }, context: AuthContext) => {
    const { userId, role } = await requireRole(context, 'coach', 'member');

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
    const { userId } = await requireRole(context, 'coach');
    return User.find({ assignedCoachId: userId, role: 'member' });
  },

  memberWorkoutLogs: async (
    _: unknown,
    { memberId, limit = 10, offset = 0 }: { memberId: string; limit?: number; offset?: number },
    context: AuthContext
  ) => {
    const { userId } = await requireRole(context, 'coach');

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
    const { userId } = await requireRole(context, 'coach');
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
  myAssignment: async (_: unknown, __: unknown, context: AuthContext) => {
    const { userId } = await requireRole(context, 'member');

    return ProgramAssignment.findOne({
      memberId: new mongoose.Types.ObjectId(userId),
      isActive: true
    });
  },

  myWorkoutLogs: async (_: unknown, __: unknown, context: AuthContext) => {
    const { userId } = await requireRole(context, 'member');

    return WorkoutLog.find({ memberId: new mongoose.Types.ObjectId(userId) })
      .sort({ date: -1 })
      .limit(20);
  },

  myLoggedExercises: async (_: unknown, __: unknown, context: AuthContext) => {
    const { userId } = await requireRole(context, 'member');

    const result = await WorkoutLog.aggregate([
      {
        $match: {
          memberId: new mongoose.Types.ObjectId(userId)
        }
      },
      { $unwind: '$exercises' },
      {
        $group: {
          _id: '$exercises.name',
          count: { $sum: 1 }
        }
      },
      {
        $match: { count: { $gte: 2 } }
      },
      { $sort: { _id: 1 } }
    ]);

    return result.map(r => r._id);
  },

  myProgress: async (
    _: unknown,
    { exerciseName }: { exerciseName: string },
    context: AuthContext
  ) => {
    const { userId } = await requireRole(context, 'member');
    return buildProgressPipeline(userId, exerciseName);
  },

  memberProgress: async (
    _: unknown,
    { memberId, exerciseName }: { memberId: string; exerciseName: string },
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

    return buildProgressPipeline(memberId, exerciseName);
  },

  memberLoggedExercises: async (
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

    const result = await WorkoutLog.aggregate([
      {
        $match: {
          memberId: new mongoose.Types.ObjectId(memberId)
        }
      },
      { $unwind: '$exercises' },
      {
        $group: {
          _id: '$exercises.name',
          count: { $sum: 1 }
        }
      },
      {
        $match: { count: { $gte: 2 } }
      },
      { $sort: { _id: 1 } }
    ]);

    return result.map(r => r._id);
  },
};

const buildProgressPipeline = async (
  memberId: string,
  exerciseName: string
) => {
  const points = await WorkoutLog.aggregate([
    {
      $match: {
        memberId: new mongoose.Types.ObjectId(memberId)
      }
    },
    { $unwind: '$exercises' },
    {
      $match: {
        'exercises.name': exerciseName
      }
    },
    { $unwind: '$exercises.sets' },
    {
      $match: {
        'exercises.sets.completed': true
      }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$date' }
        },
        averageWeight: { $avg: '$exercises.sets.weight' }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  return {
    exerciseName,
    points: points.map(p => ({
      date: new Date(p._id),
      averageWeight: p.averageWeight
    }))
  };
};
