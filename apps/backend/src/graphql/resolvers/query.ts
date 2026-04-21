import { AuthContext } from '../../middleware/auth';
import { requireAuth } from '../../middleware/rbac';
import User from '../../models/User';

export const Query = {
  me: async (_: unknown, __: unknown, context: AuthContext) => {
    const { userId } = requireAuth(context);
    return User.findById(userId);
  },

  coachMembers: () => []
};