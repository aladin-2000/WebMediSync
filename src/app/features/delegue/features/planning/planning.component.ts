import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalComponent } from '../../shared/modal/modal.component';
import { RendezVousService } from '../../services/rendezvous.service';
import { RendezVousEnrichmentService } from '../../services/rendezvous-enrichment.service';
import { RendezVousEnrichi } from '../../models/rendezvous-enrichi.model';
import { AuthService } from '../../../../core/services/auth.service';
import { toISODate, lundiDeLaSemaine, dimancheDeLaSemaine } from '../../shared/semaine.util';
import { MONTHS } from '../../../medecin/shared/date-labels.constants';

const DAYS_LABELS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven'];

type ActionType = 'realise' | 'absent' | 'annuler';

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

  showConfirmModal = false;
  confirmType: ActionType | null = null;
  rdvSelectionne: RendezVousEnrichi | null = null;

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

  get confirmModalTitle(): string {
    switch (this.confirmType) {
      case 'realise': return 'Marquer réalisé';
      case 'absent': return 'Médecin absent';
      case 'annuler': return 'Annuler le rendez-vous';
      default: return '';
    }
  }

  get confirmModalMessage(): string {
    const rdv = this.rdvSelectionne;
    if (!rdv) {
      return '';
    }
    const medecin = `Dr. ${rdv.medecinPrenom} ${rdv.medecinNom}`;
    const heure = this.formatHeure(rdv.heureDebut);
    switch (this.confirmType) {
      case 'realise':
        return `Confirmez-vous que le rendez-vous avec ${medecin} du ${heure} a bien eu lieu ?`;
      case 'absent':
        return `Confirmez-vous que ${medecin} ne s'est pas présenté au rendez-vous du ${heure} ?`;
      case 'annuler':
        return `Voulez-vous annuler le rendez-vous avec ${medecin} du ${heure} ?`;
      default:
        return '';
    }
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

  /** Le délégué ne peut annuler que tant que l'heure de début du rendez-vous n'est pas passée. */
  peutEncoreAnnuler(rdv: RendezVousEnrichi): boolean {
    if (!rdv.date || !rdv.heureDebut) {
      return true;
    }
    const debut = new Date(`${rdv.date}T${rdv.heureDebut}`);
    return debut.getTime() > Date.now();
  }

  demanderConfirmation(type: ActionType, rdv: RendezVousEnrichi): void {
    this.confirmType = type;
    this.rdvSelectionne = rdv;
    this.showConfirmModal = true;
    this.actionError = '';
  }

  annulerConfirmation(): void {
    this.showConfirmModal = false;
    this.confirmType = null;
    this.rdvSelectionne = null;
  }

  confirmerAction(): void {
    const rdv = this.rdvSelectionne;
    const type = this.confirmType;
    if (!rdv || !type) {
      return;
    }
    this.showConfirmModal = false;
    this.actionError = '';
    this.processingId = rdv.id;

    const appel =
      type === 'realise' ? this.rendezVousService.marquerRealiseDelegue(rdv.id)
      : type === 'absent' ? this.rendezVousService.marquerAbsentMedecin(rdv.id)
      : this.rendezVousService.annulerDelegue(rdv.id);

    appel.subscribe({
      next: (response) => {
        this.processingId = null;
        this.confirmType = null;
        this.rdvSelectionne = null;
        if (response.success) {
          this.chargerSemaine();
        } else {
          this.actionError = response.message;
        }
      },
      error: (err) => {
        this.processingId = null;
        this.confirmType = null;
        this.rdvSelectionne = null;
        this.actionError = err?.error?.message ?? 'Erreur lors de la mise à jour du rendez-vous.';
      },
    });
  }
}
