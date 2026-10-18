export interface UserDetailResponse {
  id: string;
  email: string;
  role: 'MEDECIN' | 'DELEGUE';
  isActive: boolean;
  emailVerified: boolean;
  nom: string;
  prenom: string;
  createdAt: string;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
