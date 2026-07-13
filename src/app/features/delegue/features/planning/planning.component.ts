import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MONTHS, DAYS_LABELS, RESERVATIONS } from '../../data/mock-data';

// ============================================
// PAGE: PLANNING
// Affiche le calendrier avec les rendez-vous
// ============================================

@Component({
  selector: 'app-planning',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './planning.component.html',
  styleUrls: ['./planning.component.css'],
})
export class PlanningComponent {

  // ========== ETATS ==========

  // Le mois/année affiché
  currentDate = signal(new Date(2025, 6, 1)); // Juillet 2025

  // Les rendez-vous confirmés
  reservations = RESERVATIONS.filter(r => r.status === 'confirmed');

  // ========== CONSTANTES ==========
  readonly monthLabels = MONTHS;
  readonly dayLabels = DAYS_LABELS;

  // ========== CALCULS REACTIFS ==========

  // Affiche "Juillet 2025"
  monthLabel = computed(() => {
    const d = this.currentDate();
    return `${this.monthLabels[d.getMonth()]} ${d.getFullYear()}`;
  });

  // Crée les cellules du calendrier
  cells = computed(() => {
    const d = this.currentDate();
    const year = d.getFullYear();
    const month = d.getMonth();

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells: any[] = [];

    // Jours vides au début
    for (let i = 0; i < firstDay; i++) {
      cells.push({ day: 0, otherMonth: true, reservations: [] });
    }

    // Jours du mois
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayReservations = this.reservations.filter(r => r.date === dateStr);

      cells.push({
        day,
        otherMonth: false,
        reservations: dayReservations,
      });
    }

    return cells;
  });

  // ========== METHODES ==========

  // Changer de mois
  changeMonth(direction: number): void {
    const d = this.currentDate();
    this.currentDate.set(new Date(d.getFullYear(), d.getMonth() + direction, 1));
  }

  // Retourner au mois actuel
  goToday(): void {
    this.currentDate.set(new Date(2025, 6, 1));
  }

  // Formater une date
  formatDate(dateStr: string): string {
    const date = new Date(dateStr + 'T00:00:00');
    const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    return `${days[date.getDay()]} ${date.getDate()}`;
  }
}
