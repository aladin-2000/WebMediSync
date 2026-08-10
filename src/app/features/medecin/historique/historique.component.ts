import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RendezVousService } from '../../delegue/services/rendezvous.service';
import { RendezVousMedecinEnrichmentService } from '../services/rendezvous-medecin-enrichment.service';
import { RendezVousMedecinEnrichi } from '../models/rendezvous-medecin-enrichi.model';
import { AuthService } from '../../../core/services/auth.service';
import { MedecinService } from '../../admin/services/medecin.service';
import { toISODate, lundiDeLaSemaine, dimancheDeLaSemaine } from '../../delegue/shared/semaine.util';
import { MONTHS } from '../shared/date-labels.constants';

@Component({
  selector: 'app-historique',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './historique.component.html',
  styleUrls: ['./historique.component.css'],
})
export class HistoriqueComponent implements OnInit {
  currentDate = new Date();

  rendezvous: RendezVousMedecinEnrichi[] = [];
  isLoading = false;
  error = '';

  constructor(
    private rendezVousService: RendezVousService,
    private enrichmentService: RendezVousMedecinEnrichmentService,
    private authService: AuthService,
    private medecinService: MedecinService
  ) {}

  ngOnInit(): void {
    this.chargerSemaine();
  }

  get weekLabel(): string {
    const lundi = lundiDeLaSemaine(this.currentDate);
    const dimanche = dimancheDeLaSemaine(this.currentDate);
    const moisLundi = MONTHS[lundi.getMonth()];
    const moisDimanche = MONTHS[dimanche.getMonth()];
    if (lundi.getMonth() === dimanche.getMonth()) {
      return `${lundi.getDate()} - ${dimanche.getDate()} ${moisDimanche} ${dimanche.getFullYear()}`;
    }
    return `${lundi.getDate()} ${moisLundi} - ${dimanche.getDate()} ${moisDimanche} ${dimanche.getFullYear()}`;
  }

  get completedVisits(): RendezVousMedecinEnrichi[] {
    return this.rendezvous
      .filter((r) => r.statut === 'REALISE')
      .sort((a, b) => (a.date + a.heureDebut).localeCompare(b.date + b.heureDebut));
  }

  get absences(): RendezVousMedecinEnrichi[] {
    return this.rendezvous
      .filter((r) => r.statut === 'ABSENT_MEDECIN' || r.statut === 'ABSENT_DELEGUE')
      .sort((a, b) => (a.date + a.heureDebut).localeCompare(b.date + b.heureDebut));
  }

  get cancellations(): RendezVousMedecinEnrichi[] {
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
    const medecinId = this.authService.getMedecinId();
    if (!medecinId) {
      this.resoudreMedecinId();
      return;
    }

    this.isLoading = true;
    this.error = '';
    const semaine = toISODate(this.currentDate);
    const dateDebut = toISODate(lundiDeLaSemaine(this.currentDate));
    const dateFin = toISODate(dimancheDeLaSemaine(this.currentDate));

    this.rendezVousService.listeMedecinSemaine(medecinId, semaine).subscribe({
      next: (response) => {
        if (!response.success) {
          this.isLoading = false;
          this.error = response.message;
          return;
        }
        this.enrichmentService.enrichir(response.data, medecinId, dateDebut, dateFin).subscribe({
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
          this.chargerSemaine();
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

  delegueLabel(rdv: RendezVousMedecinEnrichi): string {
    if (rdv.delegueNom || rdv.deleguePrenom) {
      return `${rdv.deleguePrenom} ${rdv.delegueNom}`.trim();
    }
    return `Délégué #${rdv.delegueId.slice(0, 8)}`;
  }
}
