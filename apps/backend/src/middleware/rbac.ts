import { AuthContext } from './auth';
import { Role } from '@reppath/shared';

export const requireAuth = (context: AuthContext): NonNullable<AuthContext['user']> => {
  if (!context.user) {
    throw new Error('UNAUTHENTICATED: You must be logged in');
  }
  return context.user;
};

export const requireRole = (
  context: AuthContext,
  ...roles: Role[]
): NonNullable<AuthContext['user']> => {
  const user = requireAuth(context);
  if (!roles.includes(user.role)) {
    throw new Error(`UNAUTHORIZED: Requires role ${roles.join(' or ')}`);
  }
  return user;
};