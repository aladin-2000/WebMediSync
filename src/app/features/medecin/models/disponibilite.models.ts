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

/** Statistiques des créneaux publiés par un médecin (admin — agenda des médecins). */
export interface CreneauStatsMedecin {
  medecinId: string;
  total: number;
  libres: number;
  reserves: number;
  annules: number;
  aVenirLibres: number;
  premierCreneau: string | null;
  dernierCreneau: string | null;
  prochainCreneau: string | null;
}
