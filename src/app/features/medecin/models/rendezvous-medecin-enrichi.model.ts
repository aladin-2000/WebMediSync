import { RendezVousResponse } from '../../delegue/models/rendezvous.model';

export interface RendezVousMedecinEnrichi extends RendezVousResponse {
  date: string;
  heureDebut: string;
  heureFin: string;
  delegueNom: string;
  deleguePrenom: string;
  laboratoireNom: string;
}
