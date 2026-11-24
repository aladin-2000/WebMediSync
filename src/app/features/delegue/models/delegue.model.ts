export interface DelegueResponse {
  id: string;
  userId: string;
  laboratoireId: string | null;
  laboName: string | null;
  nom: string;
  prenom: string;
  telephone: string | null;
  telephone2: string | null;
  photoUrl: string | null;
  scoreFiabilite: number;
  isActive: boolean;
  createdAt: string;
}

export interface CreerDelegueLaboRequest {
  email: string;
  password: string;
  nom: string;
  prenom: string;
  telephone?: string;
  telephone2?: string;
}

export interface ModifierDelegueRequest {
  nom: string;
  prenom: string;
  telephone?: string;
  telephone2?: string;
}

export interface AdminUpdateDelegueRequest {
  userId: string;
  nom: string;
  prenom: string;
  telephone?: string;
  telephone2?: string;
  laboratoireId?: string;
}

export interface AdminCreerDelegueRequest {
  email: string;
  password: string;
  nom: string;
  prenom: string;
  telephone?: string;
  telephone2?: string;
  laboratoireId: string;
}

export interface InscriptionDelegueRequest {
  email: string;
  password: string;
  nom: string;
  prenom: string;
  laboName?: string;
  telephone?: string;
  telephone2?: string;
}
