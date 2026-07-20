import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../shared/modal/modal.component';
import { SLOT_DATA, MONTHS, DAYS_LABELS } from '../data/mock-data';
import { CreneauResponse, PlageCreneauxRequest } from '../models/disponibilite.models';
import { CreneauService } from '../services/creneau.service';
import { AuthService } from '../../../core/services/auth.service';

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
export class CalendarComponent {
  @Output() navigateTo = new EventEmitter<string>();

  currentDate = new Date();
  activeModal: ModalType = null;
  selectedKey: string | null = null;

  constructor(private creneauService: CreneauService, private authService: AuthService) {
    const today = new Date();
    this.selectedKey = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
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

  get stats() {
    let total = 0, reserves = 0;
    Object.values(SLOT_DATA).forEach(s => { total += s.avail; reserves += s.taken; });
    return {
      total,
      reserves,
      libres: total - reserves,
      taux: total ? Math.round((reserves / total) * 100) : 0,
    };
  }

  get cells(): CalendarCell[] {
    const d = this.currentDate;
    const y = d.getFullYear(), m = d.getMonth();
    const numberfirstDayInMounth = new Date(y, m, 1).getDay();
    const numberdaysInMonth = new Date(y, m + 1, 0).getDate();
    const today = this.currentDate;
    today.setHours(0, 0, 0, 0);
    const cells: CalendarCell[] = [];

    for (let i = 0; i < numberfirstDayInMounth; i++) {
      cells.push({ day: 0, otherMonth: true, isToday: false, isPast: false, hasFull: false, hasSlots: false, available: 0, taken: 0, key: '' });
    }

    for (let day = 1; day <= numberdaysInMonth; day++) {
      const key = `${y}-${m + 1}-${day}`;
      const slot = SLOT_DATA[key];
      const isToday = y === today.getFullYear() && m === today.getMonth() && day === today.getDate();
      const cellDate = new Date(y, m, day);
      const isPast = cellDate < today;
      cells.push({
        day,
        otherMonth: false,
        isToday,
        isPast,
        hasFull: !!slot && slot.taken >= slot.avail,
        hasSlots: !!slot && slot.taken < slot.avail,
        available: slot ? slot.avail - slot.taken : 0,
        taken: slot ? slot.taken : 0,
        key,
      });
    }
    return cells;
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
}

  goToday(): void {
    this.currentDate = new Date();
  }


  showModalAddDisponibilite : boolean = false;

  selectDay(cell: CalendarCell): void {
    this.selectedKey = cell.key;
  }

  get selectedDayLabel(): string {
    if (!this.selectedKey) {
      return '';
    }
    const [year, month, day] = this.selectedKey.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return `${JOURS_LONGS[date.getDay()]} ${day} ${MONTHS[month - 1].toLowerCase()}`;
  }

  get selectedDaySlots(): DaySlot[] {
    if (!this.selectedKey) {
      return [];
    }
    const slot = SLOT_DATA[this.selectedKey];
    if (!slot) {
      return [];
    }
    const libres = Math.max(0, slot.avail - slot.taken);
    const list: DaySlot[] = [];
    let h = 9, m = 0;
    for (let i = 0; i < slot.taken; i++) {
      list.push({ heure: this.formatHeure(h, m), statut: 'reserve' });
      m += 15; if (m >= 60) { m -= 60; h++; }
    }
    for (let i = 0; i < libres; i++) {
      list.push({ heure: this.formatHeure(h, m), statut: 'libre' });
      m += 15; if (m >= 60) { m -= 60; h++; }
    }
    return list;
  }

  get visibleDaySlots(): DaySlot[] {
    return this.selectedDaySlots.slice(0, 4);
  }

  get extraReserveCount(): number {
    return this.countExtra('reserve');
  }

  get extraLibreCount(): number {
    return this.countExtra('libre');
  }

  private countExtra(statut: 'reserve' | 'libre'): number {
    const all = this.selectedDaySlots;
    const hidden = all.slice(4);
    return hidden.filter((s) => s.statut === statut).length;
  }

  private formatHeure(h: number, m: number): string {
    return `${String(h).padStart(2, '0')}h${String(m).padStart(2, '0')}`;
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
    if (this.selectedKey) {
      const [year, month, day] = this.selectedKey.split('-').map(Number);
      const cellDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      this.dateDebut = cellDate;
      this.dateFin = cellDate;
    }
    this.showModalAddDisponibilite = true;
  }

  supprimerCreneauxLibres(): void {
    if (!this.selectedKey) {
      return;
    }
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
        if (response.success && this.selectedKey) {
          const slot = SLOT_DATA[this.selectedKey];
          if (slot) {
            slot.avail = slot.taken;
          }
        }
      },
      error: (err) => console.error('Erreur lors de la suppression des créneaux du jour:', err),
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
    this.suppDateDebut = new Date().toISOString().split('T')[0];
    this.suppDateFin = new Date().toISOString().split('T')[0];
    this.suppHeureDebut = '09:00';
    this.suppHeureFin = '12:00';
    this.suppPlageError = '';
    this.showModalSupprimerPlage = true;
  }

  closeModalSupprimerPlage(): void {
    this.showModalSupprimerPlage = false;
  }

  showConfirmSuppressionPlage = false;

  demanderConfirmationSuppression(): void {
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
          this.clearLibresLocalement(this.suppDateDebut, this.suppDateFin);
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

  private clearLibresLocalement(dateDebut: string, dateFin: string): void {
    const debut = new Date(dateDebut);
    const fin = new Date(dateFin);
    Object.keys(SLOT_DATA).forEach((key) => {
      const [y, m, d] = key.split('-').map(Number);
      const date = new Date(y, m - 1, d);
      if (date >= debut && date <= fin) {
        SLOT_DATA[key].avail = SLOT_DATA[key].taken;
      }
    });
  }

  addPlageError = '';
  isSavingPlage = false;

   openModalAddDisponibilite(): void {
    this.dateDebut = new Date().toISOString().split('T')[0]; // Default to today's date in YYYY-MM-DD format
    this.dateFin = new Date().toISOString().split('T')[0]; // Default to today's date in YYYY-MM-DD format
    this.addPlageError = '';
    this.showModalAddDisponibilite = true;
  }

   closeModalAddDisponibilite() {
    this.showModalAddDisponibilite = false;
  }

  showConfirmAjoutPlage = false;

  demanderConfirmationAjout(): void {
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
          this.ajouterSlotsLocalement(response.data);
          this.showModalAddDisponibilite = false;
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

  private ajouterSlotsLocalement(creneaux: CreneauResponse[]): void {
    creneaux.forEach((c) => {
      const [y, m, d] = c.date.split('-').map(Number);
      const key = `${y}-${m}-${d}`;
      if (!SLOT_DATA[key]) {
        SLOT_DATA[key] = { avail: 0, taken: 0 };
      }
      SLOT_DATA[key].avail += 1;
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