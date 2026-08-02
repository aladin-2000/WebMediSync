import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CreneauResponse } from '../models/disponibilite.models';
import { CreneauService } from '../services/creneau.service';
import { AuthService } from '../../../core/services/auth.service';
import { MedecinService } from '../../admin/services/medecin.service';

interface StatMois {
  total: number;
  reserves: number;
  taux: number;
  annulations: number;
}

interface StatJour {
  label: string;
  taux: number;
}

const JOURS_LABELS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.css'],
})
export class StatsComponent implements OnInit {
  stats: StatMois = { total: 0, reserves: 0, taux: 0, annulations: 0 };
  statsJours: StatJour[] = [];
  isLoading = false;
  error = '';

  constructor(
    private creneauService: CreneauService,
    private authService: AuthService,
    private medecinService: MedecinService
  ) {}

  ngOnInit(): void {
    this.chargerStats();
  }

  getBarHeight(taux: number): number {
    return (taux / 100) * 100;
  }

  private chargerStats(): void {
    const medecinId = this.authService.getMedecinId();
    if (!medecinId) {
      this.resoudreMedecinId();
      return;
    }
    this.chargerAvecMedecinId(medecinId);
  }

  private resoudreMedecinId(): void {
    const user = this.authService.getCurrentUser();
    if (!user) {
      return;
    }
    this.isLoading = true;
    this.medecinService.getByUserId(user.id).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.authService.setMedecinId(response.data.id);
          this.chargerStats();
        } else {
          this.error = response.message;
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.error = err?.error?.message ?? 'Impossible de récupérer votre profil médecin.';
      },
    });
  }

  private chargerAvecMedecinId(medecinId: string): void {
    const now = new Date();
    const dateDebut = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    const dernierJour = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const dateFin = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(dernierJour).padStart(2, '0')}`;

    this.isLoading = true;
    this.error = '';
    this.creneauService.getPeriode(medecinId, dateDebut, dateFin).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.calculerStats(response.data);
        } else {
          this.error = response.message;
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.error = err?.error?.message ?? 'Erreur lors du chargement des statistiques.';
      },
    });
  }

  private calculerStats(creneaux: CreneauResponse[]): void {
    const actifs = creneaux.filter((c) => c.statut !== 'ANNULE');
    const reserves = actifs.filter((c) => c.statut === 'RESERVE').length;
    const annulations = creneaux.filter((c) => c.statut === 'ANNULE').length;
    this.stats = {
      total: actifs.length,
      reserves,
      taux: actifs.length ? Math.round((reserves / actifs.length) * 100) : 0,
      annulations,
    };

    const parJour = new Map<number, { total: number; reserves: number }>();
    actifs.forEach((c) => {
      const [y, m, d] = c.date.split('-').map(Number);
      const jourSemaine = new Date(y, m - 1, d).getDay();
      const entry = parJour.get(jourSemaine) ?? { total: 0, reserves: 0 };
      entry.total++;
      if (c.statut === 'RESERVE') {
        entry.reserves++;
      }
      parJour.set(jourSemaine, entry);
    });

    this.statsJours = [1, 2, 3, 4, 5, 6].map((jourSemaine) => {
      const entry = parJour.get(jourSemaine);
      const taux = entry && entry.total ? Math.round((entry.reserves / entry.total) * 100) : 0;
      return { label: JOURS_LABELS[jourSemaine], taux };
    });
  }
}
