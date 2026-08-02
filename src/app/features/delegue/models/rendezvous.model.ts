export type StatutRendezVous = 'CONFIRME' | 'ANNULE' | 'REALISE' | 'ABSENT';
export type AnnulePar = 'DELEGUE' | 'MEDECIN' | null;

export interface RendezVousResponse {
  id: string;
  creneauId: string;
  delegueId: string;
  medecinId: string;
  laboratoireId: string | null;
  statut: StatutRendezVous;
  annulePar: AnnulePar;
  motifAnnulation: string | null;
  createdAt: string;
}

export interface ReserverRendezVousRequest {
  creneauId: string;
  delegueId: string;
  medecinId: string;
}
