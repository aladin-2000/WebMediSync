export interface DashboardCounts {
  totalMedecins: number;
  totalDelegues: number;
  totalLaboratoires: number;
}

export interface StatsVisitesLabo {
  laboratoireId: string;
  laboratoireNom: string;
  nombreVisites: number;
}

export interface StatsVisitesDelegue {
  delegueId: string;
  delegueNom: string;
  deleguePrenom: string;
  laboratoireId: string | null;
  laboratoireNom: string | null;
  nombreVisites: number;
}
