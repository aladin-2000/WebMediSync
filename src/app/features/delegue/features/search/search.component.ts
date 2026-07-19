import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../../shared/modal/modal.component';
import { DOCTORS, AVAILABILITIES, RESERVATIONS, Availability, Reservation } from '../../data/mock-data';

// ============================================
// PAGE: RECHERCHE ET RESERVATION
// - Chercher un médecin
// - Voir ses disponibilités
// - Réserver un créneau
// ============================================

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css'],
})
export class SearchComponent {

  // ========== ETATS ==========

  // Liste de tous les médecins
  doctors = DOCTORS;

  // Réservations existantes
  reservations: Reservation[] = RESERVATIONS;

  // Texte de recherche
  searchText = '';

  // Médecin sélectionné
  selectedDoctor: typeof DOCTORS[0] | null = null;

  // Disponibilités du médecin sélectionné
  availabilities: Availability[] = [];

  // Modal pour confirmer la réservation
  showConfirmModal = false;

  // Disponibilité choisie pour réserver
  selectedAvailability: Availability | null = null;

  // ========== METHODES ==========

  // Chercher un médecin par nom ou spécialité
  get filteredDoctors() {
    const text = this.searchText.toLowerCase();
    return this.doctors.filter(doc =>
      doc.name.toLowerCase().includes(text) ||
      doc.specialty.toLowerCase().includes(text) ||
      doc.city.toLowerCase().includes(text)
    );
  }

  // Quand on clique sur un médecin
  selectDoctor(doctor: typeof DOCTORS[0]): void {
    this.selectedDoctor = doctor;

    // Charger les disponibilités de ce médecin
    this.availabilities = AVAILABILITIES.filter(a => a.doctorId === doctor.id);
  }

  // Fermer la sélection du médecin
  closeDoctor(): void {
    this.selectedDoctor = null;
    this.availabilities = [];
  }

  // Quand on clique sur une disponibilité
  selectAvailability(avail: Availability): void {
    this.selectedAvailability = avail;
    this.showConfirmModal = true;
  }

  // Confirmer la réservation
  confirmReservation(): void {
    const doc = this.selectedDoctor;
    const avail = this.selectedAvailability;

    if (!doc || !avail) return;

    // Créer la nouvelle réservation
    const newReservation: Reservation = {
      id: 'r' + Date.now(),
      doctorId: doc.id,
      doctorName: doc.name,
      date: avail.date,
      time: avail.time,
      status: 'confirmed',
    };

    // L'ajouter à la liste
    this.reservations = [...this.reservations, newReservation];

    // Retirer cette disponibilité de la liste
    this.availabilities = this.availabilities.filter(a => a.id !== avail.id);

    console.log('✅ Rendez-vous réservé:', newReservation);

    // Fermer la modal
    this.showConfirmModal = false;
    this.closeDoctor();
  }

  // Annuler la réservation
  cancelReservation(): void {
    this.showConfirmModal = false;
    this.selectedAvailability = null;
  }

  // Formater une date pour l'affichage
  formatDate(dateStr: string): string {
    const date = new Date(dateStr + 'T00:00:00');
    const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    const day = days[date.getDay()];
    const num = date.getDate();
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    const month = months[date.getMonth()];
    return `${day} ${num} ${month}`;
  }

  // Compter les réservations pour un médecin
  countReservations(doctorId: string): number {
    return this.reservations.filter(r =>
      r.doctorId === doctorId && r.status === 'confirmed'
    ).length;
  }
}