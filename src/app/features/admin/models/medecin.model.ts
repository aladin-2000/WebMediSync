export interface MedecinResponse {
  id: string;
  userId: string;
  nom: string;
  prenom: string;
  specialite: string;
  adresseCabinet: string | null;
  telephone: string | null;
  telephone2: string | null;
  fonction: string | null;
  fonctionLibelle: string | null;
  etablissementId: string | null;
  etablissementNom: string | null;
  latitude: number | null;
  longitude: number | null;
  photoUrl: string | null;
  scoreFiabiliteMin: number;
  valide: boolean;
  regionId: string | null;
  regionNom: string | null;
  /** Liste admin uniquement : email et statut actif du compte. */
  email?: string | null;
  actif?: boolean | null;
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
  telephone : string;
  telephone2?: string;
  fonction: string;
  etablissementId?: string;
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
  telephone2?: string;
  fonction: string;
  etablissementId?: string;
  latitude?: number;
  longitude?: number;
}

export interface SpecialiteOption {
  valeur: string;
  libelle: string;
}

export interface FonctionOption {
  valeur: string;
  libelle: string;
}

export interface RegionOption {
  valeur: string;
  libelle: string;
}

export interface ModifierMedecinRequest {
  /** Admin uniquement — undefined = inchangé */
  email?: string;
  nom: string;
  prenom: string;
  specialite: string;
  adresseCabinet?: string;
  telephone: string | undefined ;
  /** undefined = inchangé, '' = effacer */
  telephone2?: string;
  fonction?: string;
  /** undefined = inchangé, '' = retirer l'établissement */
  etablissementId?: string;
  latitude?: number;
  longitude?: number;
  scoreFiabiliteMin?: number;
  regionId?: string;
}
