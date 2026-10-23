export type Role = 'CITIZEN' | 'OFFICER' | 'ADMIN';

export interface User {
  id: number;
  email: string;
  fullName: string;
  role: Role;
  phoneNumber?: string;
  departmentCode?: string;
  departmentName?: string;
}

export interface AuthResponse {
  token?: string;
  accessToken?: string;
  tokenType: string;
  expiresIn?: number;
  userId?: number;
  email?: string;
  fullName?: string;
  role?: Role;
  user?: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  phoneNumber?: string;
  role?: string;
}
