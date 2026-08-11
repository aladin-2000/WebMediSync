export interface DelegueResponse {
  id: string;
  userId: string;
  laboratoireId: string;
  nom: string;
  prenom: string;
  telephone: string | null;
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
}

export interface ModifierDelegueRequest {
  nom: string;
  prenom: string;
  telephone?: string;
}

export interface InscriptionDelegueRequest {
  email: string;
  password: string;
  nom: string;
  prenom: string;
  laboratoireId: string;
  telephone?: string;
}
