import { Request } from 'express';
import { verifyToken } from '../utils/jwt';
import { JwtPayload } from '@reppath/shared';

export interface AuthContext {
  user: JwtPayload | null;
  memberId?: string;
}

export const buildContext = (req: Request): AuthContext => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { user: null };
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = verifyToken(token);
    return { user: payload };
  } catch {
    return { user: null };
  }
};

