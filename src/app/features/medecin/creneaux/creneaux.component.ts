import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../shared/modal/modal.component';
import { RendezVousService } from '../../delegue/services/rendezvous.service';
import { RendezVousMedecinEnrichmentService } from '../services/rendezvous-medecin-enrichment.service';
import { RendezVousMedecinEnrichi } from '../models/rendezvous-medecin-enrichi.model';
import { AuthService } from '../../../core/services/auth.service';
import { MedecinService } from '../../admin/services/medecin.service';
import { toISODate, lundiDeLaSemaine, dimancheDeLaSemaine } from '../../delegue/shared/semaine.util';
import { MONTHS } from '../shared/date-labels.constants';

const DAYS_LABELS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven'];

type ActionType = 'realise' | 'absent' | 'annuler';

interface RendezVousCell {
  date: Date;
  dateISO: string;
  label: string;
  isToday: boolean;
  rendezvous: RendezVousMedecinEnrichi[];
}

@Component({
  selector: 'app-creneaux',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent],
  templateUrl: './creneaux.component.html',
  styleUrls: ['./creneaux.component.css'],
})
export class CreneauxComponent implements OnInit {
  currentDate = new Date();

  rendezvous: RendezVousMedecinEnrichi[] = [];
  isLoading = false;
  error = '';

  readonly dayLabels = DAYS_LABELS;

  selectedRdv: RendezVousMedecinEnrichi | null = null;
  showDetailModal = false;
  actionMode: ActionType | null = null;
  motifAnnulation = '';
  processingId: string | null = null;
  actionError = '';

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
    const vendredi = new Date(lundi);
    vendredi.setDate(vendredi.getDate() + 4);
    const moisLundi = MONTHS[lundi.getMonth()];
    const moisVendredi = MONTHS[vendredi.getMonth()];
    if (lundi.getMonth() === vendredi.getMonth()) {
      return `${lundi.getDate()} - ${vendredi.getDate()} ${moisVendredi} ${vendredi.getFullYear()}`;
    }
    return `${lundi.getDate()} ${moisLundi} - ${vendredi.getDate()} ${moisVendredi} ${vendredi.getFullYear()}`;
  }

  get cells(): RendezVousCell[] {
    const lundi = lundiDeLaSemaine(this.currentDate);
    const today = toISODate(new Date());
    const cells: RendezVousCell[] = [];
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

  get actionModalTitle(): string {
    switch (this.actionMode) {
      case 'realise': return 'Marquer réalisé';
      case 'absent': return 'Délégué absent';
      case 'annuler': return 'Annuler le rendez-vous';
      default: return '';
    }
  }

  get actionModalMessage(): string {
    const rdv = this.selectedRdv;
    if (!rdv) {
      return '';
    }
    const delegue = this.delegueLabel(rdv);
    const heure = this.formatHeure(rdv.heureDebut);
    switch (this.actionMode) {
      case 'realise':
        return `Confirmez-vous que le rendez-vous avec ${delegue} du ${heure} a bien eu lieu ?`;
      case 'absent':
        return `Confirmez-vous que ${delegue} ne s'est pas présenté au rendez-vous du ${heure} ?`;
      case 'annuler':
        return `Voulez-vous annuler le rendez-vous avec ${delegue} du ${heure} ?`;
      default:
        return '';
    }
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
        this.error = err?.error?.message ?? 'Erreur lors du chargement des rendez-vous.';
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

  formatDateLongue(dateStr: string): string {
    if (!dateStr) {
      return '';
    }
    const date = new Date(dateStr + 'T00:00:00');
    const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    const day = days[date.getDay()];
    const num = date.getDate();
    const month = MONTHS[date.getMonth()].toLowerCase();
    return `${day} ${num} ${month} ${date.getFullYear()}`;
  }

  delegueLabel(rdv: RendezVousMedecinEnrichi): string {
    if (rdv.delegueNom || rdv.deleguePrenom) {
      return `${rdv.deleguePrenom} ${rdv.delegueNom}`.trim();
    }
    return `Délégué #${rdv.delegueId.slice(0, 8)}`;
  }

  ouvrirDetail(rdv: RendezVousMedecinEnrichi): void {
    this.selectedRdv = rdv;
    this.showDetailModal = true;
    this.actionMode = null;
    this.motifAnnulation = '';
    this.actionError = '';
  }

  fermerDetail(): void {
    this.showDetailModal = false;
    this.selectedRdv = null;
    this.actionMode = null;
    this.motifAnnulation = '';
  }

  demanderAction(type: ActionType, rdv: RendezVousMedecinEnrichi, event?: MouseEvent): void {
    event?.stopPropagation();
    this.selectedRdv = rdv;
    this.showDetailModal = true;
    this.actionMode = type;
    this.motifAnnulation = '';
    this.actionError = '';
  }

  annulerAction(): void {
    this.actionMode = null;
    this.motifAnnulation = '';
    this.actionError = '';
  }

  confirmerAction(): void {
    const rdv = this.selectedRdv;
    const type = this.actionMode;
    if (!rdv || !type) {
      return;
    }
    if (type === 'annuler' && !this.motifAnnulation.trim()) {
      this.actionError = "Le motif d'annulation est obligatoire.";
      return;
    }

    this.processingId = rdv.id;
    this.actionError = '';

    const appel =
      type === 'realise' ? this.rendezVousService.marquerRealiseMedecin(rdv.id)
      : type === 'absent' ? this.rendezVousService.marquerAbsentDelegue(rdv.id)
      : this.rendezVousService.annulerMedecin(rdv.id, this.motifAnnulation.trim());

    appel.subscribe({
      next: (response) => {
        this.processingId = null;
        if (response.success) {
          this.fermerDetail();
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
}
