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
  createdAt: string;
}
