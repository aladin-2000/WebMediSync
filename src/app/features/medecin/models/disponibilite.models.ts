export interface PlageCreneauxRequest {
  dateDebut: string;
  dateFin: string;
  heureDebut: string;
  heureFin: string;
}

export interface CreneauResponse {
  id: string;
  medecinId: string;
  date: string;
  heureDebut: string;
  heureFin: string;
  statut: 'DISPONIBLE' | 'RESERVE' | 'ANNULE';
}
