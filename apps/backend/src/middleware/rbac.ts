import { AuthContext } from './auth';
import User from '../models/User';
import { Role } from '../types/shared';

export const requireAuth = async (
  context: AuthContext
): Promise<NonNullable<AuthContext['user']>> => {
  if (!context.user) {
    throw new Error('UNAUTHENTICATED: You must be logged in');
  }

  const user = await User.findById(context.user.userId).select('isActive');
  if (!user || !user.isActive) {
    throw new Error('UNAUTHENTICATED: This account has been deactivated');
  }

  return context.user;
};

export const requireRole = async (
  context: AuthContext,
  ...roles: Role[]
): Promise<NonNullable<AuthContext['user']>> => {
  const user = await requireAuth(context);
  if (!roles.includes(user.role)) {
    throw new Error(`UNAUTHORIZED: Requires role ${roles.join(' or ')}`);
  }
  return user;
};