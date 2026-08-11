import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RendezVousService } from '../../services/rendezvous.service';
import { RendezVousEnrichmentService } from '../../services/rendezvous-enrichment.service';
import { RendezVousEnrichi } from '../../models/rendezvous-enrichi.model';
import { AuthService } from '../../../../core/services/auth.service';
import { toISODate, lundiDeLaSemaine, dimancheDeLaSemaine } from '../../shared/semaine.util';
import { MONTHS } from '../../../medecin/shared/date-labels.constants';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css'],
})
export class HistoryComponent implements OnInit {
  currentDate = new Date();

  rendezvous: RendezVousEnrichi[] = [];
  isLoading = false;
  error = '';

  constructor(
    private rendezVousService: RendezVousService,
    private enrichmentService: RendezVousEnrichmentService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.chargerSemaine();
  }

  get weekLabel(): string {
    const lundi = lundiDeLaSemaine(this.currentDate);
    const dimanche = dimancheDeLaSemaine(this.currentDate);
    const moisLundi = MONTHS[lundi.getMonth()].toLowerCase();
    const moisDimanche = MONTHS[dimanche.getMonth()].toLowerCase();
    if (lundi.getMonth() === dimanche.getMonth()) {
      return `${lundi.getDate()} - ${dimanche.getDate()} ${moisDimanche} ${dimanche.getFullYear()}`;
    }
    return `${lundi.getDate()} ${moisLundi} - ${dimanche.getDate()} ${moisDimanche} ${dimanche.getFullYear()}`;
  }

  get completedVisits(): RendezVousEnrichi[] {
    return this.rendezvous
      .filter((r) => r.statut === 'REALISE')
      .sort((a, b) => (a.date + a.heureDebut).localeCompare(b.date + b.heureDebut));
  }

  get absences(): RendezVousEnrichi[] {
    return this.rendezvous
      .filter((r) => r.statut === 'ABSENT_MEDECIN' || r.statut === 'ABSENT_DELEGUE')
      .sort((a, b) => (a.date + a.heureDebut).localeCompare(b.date + b.heureDebut));
  }

  get cancellations(): RendezVousEnrichi[] {
    return this.rendezvous
      .filter((r) => r.statut === 'ANNULE')
      .sort((a, b) => (a.date + a.heureDebut).localeCompare(b.date + b.heureDebut));
  }

  getTotalVisits(): number {
    return this.completedVisits.length;
  }

  getTotalAbsences(): number {
    return this.absences.length;
  }

  getTotalCancellations(): number {
    return this.cancellations.length;
  }

  getCancellationRate(): number {
    const total = this.rendezvous.length;
    return total ? Math.round((this.cancellations.length / total) * 100) : 0;
  }

  chargerSemaine(): void {
    const delegueId = this.authService.getDelegueId();
    if (!delegueId) {
      this.error = 'Profil délégué introuvable.';
      return;
    }

    this.isLoading = true;
    this.error = '';
    const semaine = toISODate(this.currentDate);

    this.rendezVousService.listeSemaine(delegueId, semaine).subscribe({
      next: (response) => {
        if (!response.success) {
          this.isLoading = false;
          this.error = response.message;
          return;
        }
        const dateDebut = toISODate(lundiDeLaSemaine(this.currentDate));
        const dateFin = toISODate(dimancheDeLaSemaine(this.currentDate));
        this.enrichmentService.enrichir(response.data, dateDebut, dateFin).subscribe({
          next: (enrichis) => {
            this.isLoading = false;
            this.rendezvous = enrichis;
          },
          error: () => {
            this.isLoading = false;
            this.rendezvous = [];
            this.error = 'Erreur lors du chargement des détails des rendez-vous.';
          },
        });
      },
      error: (err) => {
        this.isLoading = false;
        this.error = err?.error?.message ?? "Erreur lors du chargement de l'historique.";
      },
    });
  }

  changeWeek(direction: number): void {
    const d = this.currentDate;
    this.currentDate = new Date(d.getFullYear(), d.getMonth(), d.getDate() + direction * 7);
    this.chargerSemaine();
  }

  goToday(): void {
    this.currentDate = new Date();
    this.chargerSemaine();
  }

  formatHeure(heure: string): string {
    return heure ? heure.slice(0, 5) : '';
  }

  formatDate(dateStr: string): string {
    if (!dateStr) {
      return '';
    }
    const date = new Date(dateStr + 'T00:00:00');
    const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    const day = days[date.getDay()];
    const num = date.getDate();
    const month = MONTHS[date.getMonth()].toLowerCase();
    return `${day} ${num} ${month}`;
  }
}
