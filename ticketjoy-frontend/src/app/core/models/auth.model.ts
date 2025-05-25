import { User } from './user.model';

export interface AuthResponse {
  user: User;
  access_token: string;
  token_type: string;
  roles: string[];
  permissions: string[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  institutional_id: string;
  phone?: string;
}
