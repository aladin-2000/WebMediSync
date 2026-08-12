export type StatutAbonnement = 'ACTIF' | 'ESSAI' | 'SUSPENDU';

export interface LaboratoireResponse {
  id: string;
  userId: string;
  nom: string;
  adresse: string | null;
  telephone: string | null;
  statutAbonnement: StatutAbonnement;
  dateDebutAbonnement: string | null;
  dateFinAbonnement: string | null;
  dernierPaiementId: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface CreateLaboratoireCompletRequest {
  email: string;
  password: string;
  nom: string;
  adresse: string;
  telephone?: string;
  statutAbonnement: StatutAbonnement;
  dateDebutAbonnement: string;
  dateFinAbonnement: string;
}

export interface InscriptionLaboratoireRequest {
  email: string;
  password: string;
  nom: string;
  adresse: string;
  telephone?: string;
}
