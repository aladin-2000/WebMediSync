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

/**
 * Le backend réutilise le DTO de création pour la mise à jour (PUT /api/laboratoires/{id}) —
 * `userId` y est marqué obligatoire côté validation même si l'update ne s'en sert pas, donc on
 * doit le renvoyer (celui du laboratoire édité) pour passer la validation.
 */
export interface UpdateLaboratoireRequest {
  userId: string;
  nom: string;
  adresse: string;
  telephone?: string;
  statutAbonnement: StatutAbonnement;
  dateDebutAbonnement: string;
  dateFinAbonnement: string;
}
