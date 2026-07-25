import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../shared/modal/modal.component';
import { MONTHS, DAYS_LABELS } from '../data/mock-data';
import { CreneauResponse, PlageCreneauxRequest } from '../models/disponibilite.models';
import { CreneauService } from '../services/creneau.service';
import { AuthService } from '../../../core/services/auth.service';
import { MedecinService } from '../../admin/services/medecin.service';

export interface CalendarCell {
  day: number;
  otherMonth: boolean;
  isToday: boolean;
  hasFull: boolean;
  hasSlots: boolean;
  available: number;
  taken: number;
  key: string;
  isPast: boolean;
}

export type ModalType = 'addDispo' | 'copyWeek' | 'template' | null;

export interface DaySlot {
  heure: string;
  statut: 'reserve' | 'libre';
}

const JOURS_LONGS = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css'],
})
export class CalendarComponent implements OnInit {
  @Output() navigateTo = new EventEmitter<string>();

  currentDate = new Date();
  activeModal: ModalType = null;
  selectedKey: string | null = null;

  creneaux: CreneauResponse[] = [];
  isLoadingCreneaux = false;
  creneauxError = '';

  constructor(
    private creneauService: CreneauService,
    private authService: AuthService,
    private medecinService: MedecinService
  ) {
    const today = new Date();
    this.selectedKey = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
  }

  ngOnInit(): void {
    this.chargerCreneauxDuMois();
  }

  dispoDebut = '09:00';
  dispoFin = '12:00';
  dateDebut = new Date().toISOString().split('T')[0]; // Default to today's date in YYYY-MM-DD format
  dateFin = new Date().toISOString().split('T')[0]; // Default to today's date in YYYY-MM-DD format
  selectedDays: string[] = [];


  get monthLabel(): string {
    const d = this.currentDate;
    return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  }

  chargerCreneauxDuMois(): void {
    const medecinId = this.authService.getMedecinId();
    if (!medecinId) {
      this.resoudreMedecinId();
      return;
    }
    this.chargerCreneauxAvecMedecinId(medecinId);
  }

  private resoudreMedecinId(): void {
    const user = this.authService.getCurrentUser();
    if (!user) {
      return;
    }
    this.isLoadingCreneaux = true;
    this.medecinService.getByUserId(user.id).subscribe({
      next: (response) => {
        this.isLoadingCreneaux = false;
        if (response.success) {
          this.authService.setMedecinId(response.data.id);
          this.chargerCreneauxDuMois();
        } else {
          this.creneauxError = response.message;
        }
      },
      error: (err) => {
        this.isLoadingCreneaux = false;
        this.creneauxError = err?.error?.message ?? 'Impossible de récupérer votre profil médecin.';
      },
    });
  }

  private chargerCreneauxAvecMedecinId(medecinId: string): void {
    const y = this.currentDate.getFullYear();
    const m = this.currentDate.getMonth();
    const dateDebut = `${y}-${String(m + 1).padStart(2, '0')}-01`;
    const dernierJour = new Date(y, m + 1, 0).getDate();
    const dateFin = `${y}-${String(m + 1).padStart(2, '0')}-${String(dernierJour).padStart(2, '0')}`;

    this.isLoadingCreneaux = true;
    this.creneauxError = '';
    this.creneauService.getPeriode(medecinId, dateDebut, dateFin).subscribe({
      next: (response) => {
        this.isLoadingCreneaux = false;
        if (response.success) {
          this.creneaux = response.data;
          this.recalculerCalendrier();
          this.recalculerJourSelectionne();
        } else {
          this.creneauxError = response.message;
        }
      },
      error: (err) => {
        this.isLoadingCreneaux = false;
        this.creneauxError = err?.error?.message ?? 'Erreur lors du chargement des créneaux.';
      },
    });
  }

  private toSlotKey(dateStr: string): string {
    const [y, m, d] = dateStr.split('-').map(Number);
    return `${y}-${m}-${d}`;
  }

  private creneauxPourJour(key: string): CreneauResponse[] {
    return this.creneaux.filter((c) => this.toSlotKey(c.date) === key);
  }

  stats = { total: 0, reserves: 0, libres: 0, taux: 0, effectues: 0 };
  cells: CalendarCell[] = [];

  private recalculerCalendrier(): void {
    let total = 0, reserves = 0, effectues = 0;
    const maintenant = new Date();
    this.creneaux.forEach((c) => {
      if (c.statut === 'ANNULE') {
        return;
      }
      total++;
      if (c.statut === 'RESERVE') {
        reserves++;
        const [y, m, d] = c.date.split('-').map(Number);
        const [h, min] = c.heureDebut.split(':').map(Number);
        const dateHeure = new Date(y, m - 1, d, h, min);
        if (dateHeure < maintenant) {
          effectues++;
        }
      }
    });
    this.stats = {
      total,
      reserves,
      libres: total - reserves,
      taux: total ? Math.round((reserves / total) * 100) : 0,
      effectues,
    };

    const d = this.currentDate;
    const y = d.getFullYear(), m = d.getMonth();
    const numberfirstDayInMounth = new Date(y, m, 1).getDay();
    const numberdaysInMonth = new Date(y, m + 1, 0).getDate();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const cells: CalendarCell[] = [];

    for (let i = 0; i < numberfirstDayInMounth; i++) {
      cells.push({ day: 0, otherMonth: true, isToday: false, isPast: false, hasFull: false, hasSlots: false, available: 0, taken: 0, key: '' });
    }

    for (let day = 1; day <= numberdaysInMonth; day++) {
      const key = `${y}-${m + 1}-${day}`;
      const dayCreneaux = this.creneauxPourJour(key);
      const taken = dayCreneaux.filter((c) => c.statut === 'RESERVE').length;
      const available = dayCreneaux.filter((c) => c.statut === 'DISPONIBLE').length;
      const isToday = y === today.getFullYear() && m === today.getMonth() && day === today.getDate();
      const cellDate = new Date(y, m, day);
      const isPast = cellDate < today;
      cells.push({
        day,
        otherMonth: false,
        isToday,
        isPast,
        hasFull: dayCreneaux.length > 0 && available === 0,
        hasSlots: available > 0,
        available,
        taken,
        key,
      });
    }
    this.cells = cells;
  }

  get weeksCount(): number {
    return Math.ceil(this.cells.length / 7);
  }

  readonly daysLabels = DAYS_LABELS;

  get slotsCount(): number {
    const [dh, dm] = this.dispoDebut.split(':').map(Number);
    const [fh, fm] = this.dispoFin.split(':').map(Number);
    const mins = (fh * 60 + fm) - (dh * 60 + dm);
    return Math.max(0, Math.floor(mins / 15));
  }

changeMonth(dir: number): void {
  const current = this.currentDate;
  const today = new Date();

  const newDate = new Date(
    current.getFullYear(),
    current.getMonth() + dir,
    1
  );

  // Bloquer les mois avant le mois actuel
  if (
    newDate.getFullYear() < today.getFullYear() ||
    (newDate.getFullYear() === today.getFullYear() &&
      newDate.getMonth() < today.getMonth())
  ) {
    return;
  }

  // Si on revient au mois actuel, remettre la vraie date du jour
  if (
    newDate.getFullYear() === today.getFullYear() &&
    newDate.getMonth() === today.getMonth()
  ) {
    this.currentDate = today;
  } else {
    this.currentDate = newDate;
  }
  this.chargerCreneauxDuMois();
}

  goToday(): void {
    this.currentDate = new Date();
    this.chargerCreneauxDuMois();
  }


  showModalAddDisponibilite : boolean = false;

  selectDay(cell: CalendarCell): void {
    this.selectedKey = cell.key;
    this.recalculerJourSelectionne();
  }

  get selectedDayLabel(): string {
    if (!this.selectedKey) {
      return '';
    }
    const [year, month, day] = this.selectedKey.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return `${JOURS_LONGS[date.getDay()]} ${day} ${MONTHS[month - 1].toLowerCase()}`;
  }

  selectedDaySlots: DaySlot[] = [];

  private recalculerJourSelectionne(): void {
    if (!this.selectedKey) {
      this.selectedDaySlots = [];
      return;
    }
    this.selectedDaySlots = this.creneauxPourJour(this.selectedKey)
      .filter((c) => c.statut !== 'ANNULE')
      .sort((a, b) => a.heureDebut.localeCompare(b.heureDebut))
      .map((c) => ({
        heure: this.formatHeureFromString(c.heureDebut),
        statut: c.statut === 'RESERVE' ? 'reserve' : 'libre',
      }));
  }

  get nbLibres(): number {
    return this.selectedDaySlots.filter((s) => s.statut === 'libre').length;
  }

  get nbReserves(): number {
    return this.selectedDaySlots.filter((s) => s.statut === 'reserve').length;
  }

  showDetailJour = false;
  detailFiltre: 'libre' | 'reserve' | null = null;

  get slotsAffiches(): DaySlot[] {
    if (!this.detailFiltre) {
      return this.selectedDaySlots;
    }
    return this.selectedDaySlots.filter((s) => s.statut === this.detailFiltre);
  }

  get detailTitre(): string {
    if (this.detailFiltre === 'libre') {
      return 'Créneaux libres';
    }
    if (this.detailFiltre === 'reserve') {
      return 'Créneaux réservés';
    }
    return 'Créneaux';
  }

  get detailMessageVide(): string {
    if (this.detailFiltre === 'libre') {
      return 'Aucun créneau libre pour ce jour.';
    }
    if (this.detailFiltre === 'reserve') {
      return 'Aucun créneau réservé pour ce jour.';
    }
    return 'Aucun créneau pour ce jour.';
  }

  ouvrirDetailJour(filtre: 'libre' | 'reserve' | null = null): void {
    this.detailFiltre = filtre;
    this.showDetailJour = true;
  }

  fermerDetailJour(): void {
    this.showDetailJour = false;
  }

  private formatHeureFromString(heure: string): string {
    const [h, m] = heure.split(':');
    return `${h}h${m}`;
  }

  private formatDatePlage(dateDebut: string, dateFin: string): string {
    const [y1, m1, d1] = dateDebut.split('-').map(Number);
    const [y2, m2, d2] = dateFin.split('-').map(Number);
    const mois1 = MONTHS[m1 - 1].toLowerCase();
    const mois2 = MONTHS[m2 - 1].toLowerCase();

    if (dateDebut === dateFin) {
      return `le ${d1} ${mois1} ${y1}`;
    }
    if (y1 === y2 && m1 === m2) {
      return `du ${d1} au ${d2} ${mois2} ${y2}`;
    }
    if (y1 === y2) {
      return `du ${d1} ${mois1} au ${d2} ${mois2} ${y1}`;
    }
    return `du ${d1} ${mois1} ${y1} au ${d2} ${mois2} ${y2}`;
  }

  get resumePlageAjout(): string {
    return `${this.formatDatePlage(this.dateDebut, this.dateFin)}, de ${this.dispoDebut} à ${this.dispoFin}.`;
  }

  get resumePlageSuppression(): string {
    return `${this.formatDatePlage(this.suppDateDebut, this.suppDateFin)}, de ${this.suppHeureDebut} à ${this.suppHeureFin}.`;
  }

  planifierCreneaux(): void {
    this.resetFormAjout();
    if (this.selectedKey) {
      const [year, month, day] = this.selectedKey.split('-').map(Number);
      const cellDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      this.dateDebut = cellDate;
      this.dateFin = cellDate;
    }
    this.showModalAddDisponibilite = true;
  }

  supprimerJourError = '';
  showErreurSuppressionJour = false;
  showSuccesSuppressionJour = false;
  showConfirmSuppressionJour = false;

  fermerSuccesSuppressionJour(): void {
    this.showSuccesSuppressionJour = false;
  }

  fermerErreurSuppressionJour(): void {
    this.showErreurSuppressionJour = false;
  }

  demanderConfirmationSuppressionJour(): void {
    if (!this.selectedKey) {
      return;
    }
    const [year, month, day] = this.selectedKey.split('-').map(Number);
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    if (dateStr < this.todayISO) {
      this.supprimerJourError = "Cette journée est déjà passée, ses créneaux ne peuvent plus être supprimés.";
      this.showErreurSuppressionJour = true;
      return;
    }
    this.showConfirmSuppressionJour = true;
  }

  annulerConfirmationSuppressionJour(): void {
    this.showConfirmSuppressionJour = false;
  }

  confirmerSuppressionJour(): void {
    if (!this.selectedKey) {
      return;
    }
    this.showConfirmSuppressionJour = false;
    const medecinId = this.authService.getMedecinId();
    if (!medecinId) {
      return;
    }
    const [year, month, day] = this.selectedKey.split('-').map(Number);
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const body: PlageCreneauxRequest = {
      dateDebut: dateStr,
      dateFin: dateStr,
      heureDebut: '00:00:00',
      heureFin: '23:59:59',
    };
    this.creneauService.supprimerPlage(medecinId, body).subscribe({
      next: (response) => {
        if (response.success) {
          this.chargerCreneauxDuMois();
          this.showSuccesSuppressionJour = true;
        } else {
          this.supprimerJourError = response.message;
          this.showErreurSuppressionJour = true;
        }
      },
      error: (err) => {
        this.supprimerJourError = err?.error?.message ?? 'Erreur lors de la suppression des créneaux du jour.';
        this.showErreurSuppressionJour = true;
      },
    });
  }

  showModalSupprimerPlage: boolean = false;
  suppDateDebut = new Date().toISOString().split('T')[0];
  suppDateFin = new Date().toISOString().split('T')[0];
  suppHeureDebut = '09:00';
  suppHeureFin = '12:00';
  suppPlageError = '';
  isDeletingPlage = false;

  openModalSupprimerPlage(): void {
    this.suppDateDebut = this.todayISO;
    this.suppDateFin = this.todayISO;
    this.suppHeureDebut = '09:00';
    this.suppHeureFin = '12:00';
    this.suppPlageError = '';
    this.isDeletingPlage = false;
    this.showModalSupprimerPlage = true;
  }

  closeModalSupprimerPlage(): void {
    this.showModalSupprimerPlage = false;
  }

  showConfirmSuppressionPlage = false;

  private validerPlageSuppression(): string {
    const maintenant = new Date();
    const aujourdHui = this.todayISO;

    if (this.suppDateDebut < aujourdHui) {
      return "Cette date est déjà passée, ses créneaux ne peuvent plus être supprimés.";
    }

    if (this.suppDateDebut === aujourdHui) {
      const [h, m] = this.suppHeureDebut.split(':').map(Number);
      const heureDebutMinutes = h * 60 + m;
      const heureActuelleMinutes = maintenant.getHours() * 60 + maintenant.getMinutes();
      if (heureDebutMinutes < heureActuelleMinutes) {
        const heureActuelle = `${String(maintenant.getHours()).padStart(2, '0')}:${String(maintenant.getMinutes()).padStart(2, '0')}`;
        return `Pour aujourd'hui, l'heure de début doit être ${heureActuelle} ou plus tard.`;
      }
    }

    return '';
  }

  demanderConfirmationSuppression(): void {
    const erreur = this.validerPlageSuppression();
    if (erreur) {
      this.suppPlageError = erreur;
      return;
    }
    this.suppPlageError = '';
    this.showConfirmSuppressionPlage = true;
  }

  annulerConfirmationSuppression(): void {
    this.showConfirmSuppressionPlage = false;
  }

  confirmerSuppressionPlage(): void {
    const medecinId = this.authService.getMedecinId();
    if (!medecinId) {
      this.suppPlageError = 'Profil médecin introuvable.';
      this.showConfirmSuppressionPlage = false;
      return;
    }

    this.showConfirmSuppressionPlage = false;
    this.suppPlageError = '';
    this.isDeletingPlage = true;
    const body: PlageCreneauxRequest = {
      dateDebut: this.suppDateDebut,
      dateFin: this.suppDateFin,
      heureDebut: `${this.suppHeureDebut}:00`,
      heureFin: `${this.suppHeureFin}:00`,
    };

    this.creneauService.supprimerPlage(medecinId, body).subscribe({
      next: (response) => {
        this.isDeletingPlage = false;
        if (response.success) {
          this.chargerCreneauxDuMois();
          this.showModalSupprimerPlage = false;
        } else {
          this.suppPlageError = response.message;
        }
      },
      error: (err) => {
        this.isDeletingPlage = false;
        this.suppPlageError = err?.error?.message ?? 'Erreur lors de la suppression des créneaux.';
      },
    });
  }

  addPlageError = '';
  isSavingPlage = false;
  showSuccesAjout = false;
  messageSuccesAjout = '';

  fermerSuccesAjout(): void {
    this.showSuccesAjout = false;
  }

   openModalAddDisponibilite(): void {
    this.resetFormAjout();
    this.dateDebut = this.todayISO;
    this.dateFin = this.todayISO;
    this.showModalAddDisponibilite = true;
  }

  private resetFormAjout(): void {
    this.dispoDebut = '09:00';
    this.dispoFin = '12:00';
    this.selectedTemplate = null;
    this.addPlageError = '';
    this.isSavingPlage = false;
  }

   closeModalAddDisponibilite() {
    this.showModalAddDisponibilite = false;
  }

  showConfirmAjoutPlage = false;

  get todayISO(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  private validerPlageAjout(): string {
    const maintenant = new Date();
    const aujourdHui = this.todayISO;

    if (this.dateDebut < aujourdHui) {
      return "Impossible de planifier des créneaux pour une date déjà passée.";
    }

    if (this.dateDebut === aujourdHui) {
      const [h, m] = this.dispoDebut.split(':').map(Number);
      const heureDebutMinutes = h * 60 + m;
      const heureActuelleMinutes = maintenant.getHours() * 60 + maintenant.getMinutes();
      if (heureDebutMinutes < heureActuelleMinutes) {
        const heureActuelle = `${String(maintenant.getHours()).padStart(2, '0')}:${String(maintenant.getMinutes()).padStart(2, '0')}`;
        return `Pour aujourd'hui, l'heure de début doit être ${heureActuelle} ou plus tard.`;
      }
    }

    return '';
  }

  demanderConfirmationAjout(): void {
    const erreur = this.validerPlageAjout();
    if (erreur) {
      this.addPlageError = erreur;
      return;
    }
    this.addPlageError = '';
    this.showConfirmAjoutPlage = true;
  }

  annulerConfirmationAjout(): void {
    this.showConfirmAjoutPlage = false;
  }

  confirmerAjoutPlage(): void {
    const medecinId = this.authService.getMedecinId();
    if (!medecinId) {
      this.addPlageError = 'Profil médecin introuvable.';
      this.showConfirmAjoutPlage = false;
      return;
    }

    this.showConfirmAjoutPlage = false;
    this.addPlageError = '';
    this.isSavingPlage = true;
    const body: PlageCreneauxRequest = {
      dateDebut: this.dateDebut,
      dateFin: this.dateFin,
      heureDebut: `${this.dispoDebut}:00`,
      heureFin: `${this.dispoFin}:00`,
    };

    this.creneauService.ajouterPlage(medecinId, body).subscribe({
      next: (response) => {
        this.isSavingPlage = false;
        if (response.success) {
          this.messageSuccesAjout = this.resumePlageAjout;
          this.chargerCreneauxDuMois();
          this.showModalAddDisponibilite = false;
          this.showSuccesAjout = true;
        } else {
          this.addPlageError = response.message;
        }
      },
      error: (err) => {
        this.isSavingPlage = false;
        this.addPlageError = err?.error?.message ?? 'Erreur lors de la création des créneaux.';
      },
    });
  }

  toggleDay(key: string): void {
    const idx = this.selectedDays.indexOf(key);
    if (idx >= 0) {
      this.selectedDays.splice(idx, 1);
    } else {
      this.selectedDays.push(key);
    }
  }

  isDaySelected(key: string): boolean {
    return this.selectedDays.includes(key);
  }

  applyTemplate(preset: string): void {
    this.selectedTemplate = preset;
    const presets: Record<string, [string, string]> = {
      matin:   ['09:00', '12:00'],
      aprem:   ['14:00', '17:30'],
      journee: ['08:00', '18:00'],
    };
    if (presets[preset]) {
      [this.dispoDebut, this.dispoFin] = presets[preset];
    }
  }

  selectedTemplate: string | null = null;

  applyTemplate2(type: string): void {
  this.selectedTemplate = type;
    // ton traitement existant ici
  }

}