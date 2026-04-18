export type Role = 'owner' | 'coach' | 'member';

export interface JwtPayload {
  userId: string;
  role: Role;
  gymId: string;
}