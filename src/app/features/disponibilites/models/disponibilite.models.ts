export type JourSemaine = 'L' | 'M' | 'Me' | 'J' | 'V' | 'S';
export type StatutCreneau = 'disponible' | 'reserve' | 'annule';
export type StatutAbonnement = 'actif' | 'essai' | 'suspendu';

export interface SlotDay {
  avail: number;
  taken: number;
}

export interface RegleRecurrence {
  id: string;
  nom: string;
  heureDebut: string;
  heureFin: string;
  isActive: boolean;
  dateDebut: string;
  creneauxParSemaine: number;
}

export interface CreneauSemaine {
  heure: string;
  statut: 'reserve' | 'libre';
}

export interface JourSemaineView {
  label: string;
  creneaux: CreneauSemaine[];
}

export interface StatMois {
  total: number;
  reserves: number;
  taux: number;
  annulations: number;
}

export interface StatJour {
  label: string;
  taux: number;
}

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
