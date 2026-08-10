export type StatutRendezVous = 'RESERVE' | 'ANNULE' | 'REALISE' | 'ABSENT_MEDECIN' | 'ABSENT_DELEGUE' | 'CONFLIT';
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
  /** Le rendez-vous ne passe a REALISE que lorsque delegue ET medecin ont confirme. */
  realiseParDelegue: boolean;
  realiseParMedecin: boolean;
  createdAt: string;
}

export interface ReserverRendezVousRequest {
  creneauId: string;
  delegueId: string;
  medecinId: string;
}
