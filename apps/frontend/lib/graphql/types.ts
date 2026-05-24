export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'coach' | 'member';
}

export interface AuthPayload {
  token: string;
  user: AuthUser;
}

export interface LoginResponse {
  login: AuthPayload;
}

export interface RegisterOwnerResponse {
  registerOwner: AuthPayload;
}