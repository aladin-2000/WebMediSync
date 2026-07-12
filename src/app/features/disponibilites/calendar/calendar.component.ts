import { Component, EventEmitter, Output, signal, computed } from '@angular/core';
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

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css'],
})
export class CalendarComponent {
  @Output() navigateTo = new EventEmitter<string>();

  currentDate = signal(new Date());
  activeModal = signal<ModalType>(null);

  dispoDebut = '09:00';
  dispoFin = '12:00';
  dateDebut = new Date().toISOString().split('T')[0]; // Default to today's date in YYYY-MM-DD format
  dateFin = new Date().toISOString().split('T')[0]; // Default to today's date in YYYY-MM-DD format
  selectedDays: string[] = [];


  readonly monthLabel = computed(() => {
    const d = this.currentDate();
    return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  });

  readonly stats = computed(() => {
    let total = 0, reserves = 0;
    Object.values(SLOT_DATA).forEach(s => { total += s.avail; reserves += s.taken; });
    return {
      total,
      reserves,
      libres: total - reserves,
      taux: total ? Math.round((reserves / total) * 100) : 0,
    };
  });

  readonly cells = computed((): CalendarCell[] => {
    const d = this.currentDate();
    const y = d.getFullYear(), m = d.getMonth();
    const numberfirstDayInMounth = new Date(y, m, 1).getDay();
    const numberdaysInMonth = new Date(y, m + 1, 0).getDate();
    const today = this.currentDate();
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
  });

  readonly daysLabels = DAYS_LABELS;

  get slotsCount(): number {
    const [dh, dm] = this.dispoDebut.split(':').map(Number);
    const [fh, fm] = this.dispoFin.split(':').map(Number);
    const mins = (fh * 60 + fm) - (dh * 60 + dm);
    return Math.max(0, Math.floor(mins / 15));
  }

changeMonth(dir: number): void {
  const current = this.currentDate();
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
    this.currentDate.set(today);
  } else {
    this.currentDate.set(newDate);
  }
}

  goToday(): void {
    this.currentDate.set(new Date());
  }


  showModalAddDisponibilite : boolean = false;

  openModalAddDisponibiliteFromCalendar(cell: CalendarCell): void {
    const [year, month, day] = cell.key.split('-').map(Number);
    let cellDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    console.log(cell);
    this.dateDebut = cellDate;
    this.dateFin = cellDate;
    this.showModalAddDisponibilite = true;
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
