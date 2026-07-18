export type Role = 'MEDECIN' | 'DELEGUE' | 'LABO' | 'ADMIN';

export interface UserResponse {
  id: string;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
