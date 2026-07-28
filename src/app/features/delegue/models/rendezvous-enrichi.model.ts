import { RendezVousResponse } from './rendezvous.model';

export interface RendezVousEnrichi extends RendezVousResponse {
  date: string;
  heureDebut: string;
  heureFin: string;
  medecinNom: string;
  medecinPrenom: string;
  medecinSpecialite: string;
}
