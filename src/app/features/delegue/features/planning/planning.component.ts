import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalComponent } from '../../shared/modal/modal.component';
import { RendezVousService } from '../../services/rendezvous.service';
import { RendezVousEnrichmentService } from '../../services/rendezvous-enrichment.service';
import { RendezVousEnrichi } from '../../models/rendezvous-enrichi.model';
import { AuthService } from '../../../../core/services/auth.service';
import { toISODate, lundiDeLaSemaine, dimancheDeLaSemaine } from '../../shared/semaine.util';

const DAYS_LABELS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven'];
const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

interface PlanningCell {
  date: Date;
  dateISO: string;
  label: string;
  isToday: boolean;
  rendezvous: RendezVousEnrichi[];
}

@Component({
  selector: 'app-planning',
  standalone: true,
  imports: [CommonModule, ModalComponent],
  templateUrl: './planning.component.html',
  styleUrls: ['./planning.component.css'],
})
export class PlanningComponent implements OnInit {
  currentDate = new Date();

  rendezvous: RendezVousEnrichi[] = [];
  isLoading = false;
  error = '';

  processingId: string | null = null;
  actionError = '';

  showAnnulerModal = false;
  rdvAAnnuler: RendezVousEnrichi | null = null;

  readonly dayLabels = DAYS_LABELS;

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
    const vendredi = new Date(lundi);
    vendredi.setDate(vendredi.getDate() + 4);
    const moisLundi = MONTHS[lundi.getMonth()];
    const moisVendredi = MONTHS[vendredi.getMonth()];
    if (lundi.getMonth() === vendredi.getMonth()) {
      return `${lundi.getDate()} - ${vendredi.getDate()} ${moisVendredi} ${vendredi.getFullYear()}`;
    }
    return `${lundi.getDate()} ${moisLundi} - ${vendredi.getDate()} ${moisVendredi} ${vendredi.getFullYear()}`;
  }

  get cells(): PlanningCell[] {
    const lundi = lundiDeLaSemaine(this.currentDate);
    const today = toISODate(new Date());
    const cells: PlanningCell[] = [];
    for (let i = 0; i < 5; i++) {
      const date = new Date(lundi);
      date.setDate(date.getDate() + i);
      const dateISO = toISODate(date);
      cells.push({
        date,
        dateISO,
        label: `${this.dayLabels[i]} ${date.getDate()}`,
        isToday: dateISO === today,
        rendezvous: this.rendezvous
          .filter((r) => r.date === dateISO)
          .sort((a, b) => a.heureDebut.localeCompare(b.heureDebut)),
      });
    }
    return cells;
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
        this.error = err?.error?.message ?? 'Erreur lors du chargement du planning.';
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

  marquerRealise(rdv: RendezVousEnrichi): void {
    this.actionError = '';
    this.processingId = rdv.id;
    this.rendezVousService.marquerRealise(rdv.id).subscribe({
      next: (response) => {
        this.processingId = null;
        if (response.success) {
          this.chargerSemaine();
        } else {
          this.actionError = response.message;
        }
      },
      error: (err) => {
        this.processingId = null;
        this.actionError = err?.error?.message ?? 'Erreur lors de la mise à jour du rendez-vous.';
      },
    });
  }

  marquerAbsent(rdv: RendezVousEnrichi): void {
    this.actionError = '';
    this.processingId = rdv.id;
    this.rendezVousService.marquerAbsent(rdv.id).subscribe({
      next: (response) => {
        this.processingId = null;
        if (response.success) {
          this.chargerSemaine();
        } else {
          this.actionError = response.message;
        }
      },
      error: (err) => {
        this.processingId = null;
        this.actionError = err?.error?.message ?? 'Erreur lors de la mise à jour du rendez-vous.';
      },
    });
  }

  demanderAnnulation(rdv: RendezVousEnrichi): void {
    this.rdvAAnnuler = rdv;
    this.showAnnulerModal = true;
  }

  annulerAnnulation(): void {
    this.showAnnulerModal = false;
    this.rdvAAnnuler = null;
  }

  confirmerAnnulation(): void {
    const rdv = this.rdvAAnnuler;
    if (!rdv) {
      return;
    }
    this.showAnnulerModal = false;
    this.actionError = '';
    this.processingId = rdv.id;
    this.rendezVousService.annulerDelegue(rdv.id).subscribe({
      next: (response) => {
        this.processingId = null;
        this.rdvAAnnuler = null;
        if (response.success) {
          this.chargerSemaine();
        } else {
          this.actionError = response.message;
        }
      },
      error: (err) => {
        this.processingId = null;
        this.rdvAAnnuler = null;
        this.actionError = err?.error?.message ?? "Erreur lors de l'annulation du rendez-vous.";
      },
    });
  }
}
