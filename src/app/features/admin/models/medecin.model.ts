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
  valide: boolean;
  regionId: string | null;
  regionNom: string | null;
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
  regionId?: string;
}

export interface InscriptionMedecinRequest {
  email: string;
  password: string;
  nom: string;
  prenom: string;
  specialite: string;
  adresseCabinet: string;
  regionId: string;
  telephone?: string;
  latitude?: number;
  longitude?: number;
}

export interface SpecialiteOption {
  valeur: string;
  libelle: string;
}

export interface RegionOption {
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
  regionId?: string;
}
