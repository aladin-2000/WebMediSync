import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RESERVATIONS } from '../../data/mock-data';

// ============================================
// PAGE: HISTORIQUE
// Affiche l'historique des rendez-vous
// - Visites réalisées
// - Annulations
// - Scores
// ============================================

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css'],
})
export class HistoryComponent {

  // ========== DONNEES ==========

  // Tous les rendez-vous (passés et présents)
  allReservations = RESERVATIONS;

  // Filtrer les visites réalisées
  completedVisits = this.allReservations.filter(r => r.status === 'done');

  // Filtrer les annulations
  cancellations = this.allReservations.filter(r => r.status === 'cancelled');

  // ========== METHODES ==========

  // Formater une date
  formatDate(dateStr: string): string {
    const date = new Date(dateStr + 'T00:00:00');
    const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    const day = days[date.getDay()];
    const num = date.getDate();
    const months = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin',
                    'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
    const month = months[date.getMonth()];
    return `${day} ${num} ${month}`;
  }

  // Compter les statistiques
  getTotalVisits(): number {
    return this.completedVisits.length;
  }

  getTotalCancellations(): number {
    return this.cancellations.length;
  }

  getCancellationRate(): number {
    const total = this.allReservations.length;
    return total > 0 ? Math.round((this.cancellations.length / total) * 100) : 0;
  }
}
