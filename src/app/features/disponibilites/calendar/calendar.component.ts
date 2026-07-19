import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../shared/modal/modal.component';
import { SLOT_DATA, MONTHS, DAYS_LABELS } from '../data/mock-data';

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

  constructor() {
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
    const slot = SLOT_DATA[this.selectedKey];
    if (slot) {
      slot.avail = slot.taken;
    }
  }

  showModalSupprimerPlage: boolean = false;
  suppDateDebut = new Date().toISOString().split('T')[0];
  suppDateFin = new Date().toISOString().split('T')[0];
  suppHeureDebut = '09:00';
  suppHeureFin = '12:00';

  openModalSupprimerPlage(): void {
    this.suppDateDebut = new Date().toISOString().split('T')[0];
    this.suppDateFin = new Date().toISOString().split('T')[0];
    this.suppHeureDebut = '09:00';
    this.suppHeureFin = '12:00';
    this.showModalSupprimerPlage = true;
  }

  closeModalSupprimerPlage(): void {
    this.showModalSupprimerPlage = false;
  }

  confirmerSuppressionPlage(): void {
    const debut = new Date(this.suppDateDebut);
    const fin = new Date(this.suppDateFin);
    Object.keys(SLOT_DATA).forEach((key) => {
      const [y, m, d] = key.split('-').map(Number);
      const date = new Date(y, m - 1, d);
      if (date >= debut && date <= fin) {
        SLOT_DATA[key].avail = SLOT_DATA[key].taken;
      }
    });
    this.showModalSupprimerPlage = false;
  }

   openModalAddDisponibilite(): void {
    this.dateDebut = new Date().toISOString().split('T')[0]; // Default to today's date in YYYY-MM-DD format
    this.dateFin = new Date().toISOString().split('T')[0]; // Default to today's date in YYYY-MM-DD format
    this.showModalAddDisponibilite = true;
  }

   closeModalAddDisponibilite() {
    this.showModalAddDisponibilite = false;
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