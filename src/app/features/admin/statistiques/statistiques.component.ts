import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminStatsService } from '../services/admin-stats.service';
import { DashboardCounts, StatsVisitesDelegue, StatsVisitesLabo } from '../models/stats.model';

const MOIS_LABELS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

@Component({
  selector: 'app-admin-statistiques',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './statistiques.component.html',
  styleUrls: ['./statistiques.component.css'],
})
export class StatistiquesComponent implements OnInit {
  dashboardCounts: DashboardCounts | null = null;
  statsLabos: StatsVisitesLabo[] = [];
  statsDelegues: StatsVisitesDelegue[] = [];

  activeTab: 'laboratoires' | 'delegues' = 'laboratoires';
  selectedLaboId: string | null = null;
  selectedLaboNom = '';

  selectedMois: number;
  selectedAnnee: number;
  moisOptions = MOIS_LABELS.map((label, i) => ({ value: i + 1, label }));
  anneeOptions: number[] = [];

  isLoading = false;
  errorMessage = '';

  constructor(private statsService: AdminStatsService) {
    const now = new Date();
    this.selectedMois = now.getMonth() + 1;
    this.selectedAnnee = now.getFullYear();
    for (let y = 2024; y <= now.getFullYear(); y++) {
      this.anneeOptions.push(y);
    }
  }

  ngOnInit(): void {
    this.loadDashboard();
    this.loadStatsLabos();
  }

  onPeriodChange(): void {
    if (this.activeTab === 'laboratoires') {
      this.loadStatsLabos();
    } else if (this.selectedLaboId) {
      this.loadDeleguesForLabo(this.selectedLaboId);
    } else {
      this.loadAllDelegues();
    }
  }

  private loadDashboard(): void {
    this.statsService.getDashboardCounts().subscribe({
      next: (res) => {
        if (res.success) this.dashboardCounts = res.data;
      },
    });
  }

  private loadStatsLabos(): void {
    this.isLoading = true;
    this.statsService.getVisitesParLaboratoire(this.selectedMois, this.selectedAnnee).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success) this.statsLabos = res.data;
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Impossible de charger les statistiques.';
      },
    });
  }

  switchTab(tab: 'laboratoires' | 'delegues'): void {
    this.activeTab = tab;
    if (tab === 'laboratoires') {
      this.loadStatsLabos();
    } else if (!this.selectedLaboId) {
      this.loadAllDelegues();
    } else {
      this.loadDeleguesForLabo(this.selectedLaboId);
    }
  }

  voirDelegues(labo: StatsVisitesLabo): void {
    this.selectedLaboId = labo.laboratoireId;
    this.selectedLaboNom = labo.laboratoireNom;
    this.activeTab = 'delegues';
    this.loadDeleguesForLabo(labo.laboratoireId);
  }

  clearLaboFilter(): void {
    this.selectedLaboId = null;
    this.selectedLaboNom = '';
    this.loadAllDelegues();
  }

  private loadAllDelegues(): void {
    this.isLoading = true;
    this.statsService.getVisitesParDelegue(this.selectedMois, this.selectedAnnee).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success) this.statsDelegues = res.data;
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Impossible de charger les statistiques des délégués.';
      },
    });
  }

  private loadDeleguesForLabo(laboId: string): void {
    this.isLoading = true;
    this.statsService.getVisitesParDelegueForLabo(laboId, this.selectedMois, this.selectedAnnee).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success) this.statsDelegues = res.data;
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Impossible de charger les statistiques des délégués.';
      },
    });
  }
}
