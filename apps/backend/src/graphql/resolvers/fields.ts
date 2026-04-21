import ProgramAssignment from '../../models/ProgramAssignment';
import User from '../../models/User';
import { IUser } from '../../models/User';
import { IProgram } from '../../models/Program';

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