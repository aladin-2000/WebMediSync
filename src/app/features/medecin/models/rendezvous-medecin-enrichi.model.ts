import { RendezVousResponse } from '../../delegue/models/rendezvous.model';

export interface RendezVousMedecinEnrichi extends RendezVousResponse {
  date: string;
  heureDebut: string;
  heureFin: string;
  /** Nom/prénom du délégué : vide tant que le backend n'expose pas de résolution delegueId -> nom. */
  delegueNom: string;
  deleguePrenom: string;
}
