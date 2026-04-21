import { AuthContext } from '../../middleware/auth';
import { requireAuth, requireRole } from '../../middleware/rbac';
import User from '../../models/User';
import ProgramAssignment from '../../models/ProgramAssignment';
import WorkoutLog from '../../models/WorkoutLog';
import mongoose from 'mongoose';

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

  // placeholders for later features
  myMembers: () => [],
  coachDashboard: () => null,
  memberWorkoutLogs: () => [],
  memberProgress: () => null,
  programs: () => [],
  program: () => null,
  myAssignment: () => null,
  myWorkoutLogs: () => [],
  myProgress: () => null,
  myLoggedExercises: () => [],
  memberLoggedExercises: () => []
};