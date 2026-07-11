import { Component, EventEmitter, Output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../shared/modal/modal.component';
import { SLOT_DATA, MONTHS, DAYS_LABELS, TEMPLATES, ALL_JOURS } from '../data/mock-data';

export interface CalendarCell {
  day: number;
  otherMonth: boolean;
  isToday: boolean;
  hasFull: boolean;
  hasSlots: boolean;
  available: number;
  taken: number;
  key: string;
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

  currentDate = signal(new Date(2025, 6, 1));
  activeModal = signal<ModalType>(null);

  dispoDebut = '09:00';
  dispoFin = '12:00';
  dispoDate = '2025-07-08';
  selectedDays: string[] = [];

  readonly allJours = ALL_JOURS;
  readonly templates = TEMPLATES;

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
    const firstDay = new Date(y, m, 1).getDay();
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const today = new Date();
    const cells: CalendarCell[] = [];

    for (let i = 0; i < firstDay; i++) {
      cells.push({ day: 0, otherMonth: true, isToday: false, hasFull: false, hasSlots: false, available: 0, taken: 0, key: '' });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const key = `${y}-${m + 1}-${day}`;
      const slot = SLOT_DATA[key];
      const isToday = y === today.getFullYear() && m === today.getMonth() && day === today.getDate();
      cells.push({
        day,
        otherMonth: false,
        isToday,
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
    const d = this.currentDate();
    this.currentDate.set(new Date(d.getFullYear(), d.getMonth() + dir, 1));
  }

  goToday(): void {
    this.currentDate.set(new Date(2025, 6, 1));
  }

  openModal(type: ModalType): void {
    this.activeModal.set(type);
  }

  closeModal(): void {
    this.activeModal.set(null);
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
    const presets: Record<string, [string, string]> = {
      matin:   ['09:00', '12:00'],
      aprem:   ['14:00', '17:30'],
      journee: ['08:00', '18:00'],
    };
    if (presets[preset]) {
      [this.dispoDebut, this.dispoFin] = presets[preset];
    }
  }
}
