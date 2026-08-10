export interface MedecinResponse {
  id: string;
  userId: string;
  nom: string;
  prenom: string;
  specialite: string;
  adresseCabinet: string | null;
  telephone: string | null;
  latitude: number | null;
  longitude: number | null;
  photoUrl: string | null;
  scoreFiabiliteMin: number;
  createdAt: string;
}

export interface CreerMedecinRequest {
  email: string;
  password: string;
  nom: string;
  prenom: string;
  specialite: string;
  adresseCabinet?: string;
  latitude?: number;
  longitude?: number;
  scoreFiabiliteMin?: number;
}

export interface SpecialiteOption {
  valeur: string;
  libelle: string;
}

export interface ModifierMedecinRequest {
  nom: string;
  prenom: string;
  specialite: string;
  adresseCabinet?: string;
  telephone?: string;
  latitude?: number;
  longitude?: number;
  scoreFiabiliteMin?: number;
}
