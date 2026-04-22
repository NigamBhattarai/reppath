import ProgramAssignment from '../../models/ProgramAssignment';
import WorkoutLog from '../../models/WorkoutLog';
import User from '../../models/User';
import { IUser } from '../../models/User';
import { IProgram, IDay, IWeek } from '../../models/Program';
import { AuthContext } from '../../middleware/auth';
import mongoose from 'mongoose';

export const UserFieldResolvers = {
  id: (parent: IUser) => parent._id.toString(),

  assignedCoach: async (parent: IUser) => {
    if (!parent.assignedCoachId) return null;
    return User.findById(parent.assignedCoachId);
  },

  assignedMemberCount: async (parent: IUser) => {
    if (parent.role !== 'coach') return null;
    return User.countDocuments({
      assignedCoachId: parent._id,
      isActive: true
    });
  },

  activeProgram: async (parent: IUser) => {
    if (parent.role !== 'member') return null;
    const assignment = await ProgramAssignment.findOne({
      memberId: parent._id,
      isActive: true
    }).populate('programId');

    if (!assignment) return null;
    return assignment.programId;
  }
};

export const ProgramFieldResolvers = {
  id: (parent: IProgram) => parent._id.toString(),

  hasActiveAssignment: async (parent: IProgram) => {
    const count = await ProgramAssignment.countDocuments({
      programId: parent._id,
      isActive: true
    });
    return count > 0;
  }
};

// Week resolver enriches each day with its parent weekNumber
// so the Day resolver has access to it
export const WeekFieldResolvers = {
  days: (parent: IWeek) => {
    return parent.days.map(day => ({
      ...((day as any).toObject ? (day as any).toObject() : { ...day }),
      _weekNumber: parent.weekNumber
    }));
  }
};

export const DayFieldResolvers = {
  isLogged: async (
    parent: IDay & { _weekNumber?: number },
    _: unknown,
    context: AuthContext
  ) => {
    // only meaningful for members viewing their own program
    if (!context.user || context.user.role !== 'member') return null;

    const memberId = context.user.userId;
    const weekNumber = parent._weekNumber;

    if (!weekNumber) return null;

    const assignment = await ProgramAssignment.findOne({
      memberId: new mongoose.Types.ObjectId(memberId),
      isActive: true
    });

    if (!assignment) return null;

    const log = await WorkoutLog.findOne({
      memberId: new mongoose.Types.ObjectId(memberId),
      assignmentId: assignment._id,
      weekNumber,
      dayNumber: parent.dayNumber
    });

    return log !== null;
  }
};