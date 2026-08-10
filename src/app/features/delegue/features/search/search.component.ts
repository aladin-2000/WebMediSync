import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../../shared/modal/modal.component';
import { MedecinService } from '../../../admin/services/medecin.service';
import { MedecinResponse, SpecialiteOption } from '../../../admin/models/medecin.model';
import { CreneauService } from '../../../medecin/services/creneau.service';
import { CreneauResponse } from '../../../medecin/models/disponibilite.models';
import { RendezVousService } from '../../services/rendezvous.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css'],
})
export class SearchComponent {
  readonly todayISO = new Date().toISOString().split('T')[0];

  searchNom = '';
  searchDate = this.todayISO;
  searchHeureDebut = '08:00';
  searchHeureFin = '17:00';

  specialites: SpecialiteOption[] = [];
  searchSpecialites: string[] = [];
  showSpecialiteDropdown = false;

  doctors: MedecinResponse[] = [];
  isSearching = false;
  searchError = '';
  hasSearched = false;

  selectedDoctor: MedecinResponse | null = null;
  creneaux: CreneauResponse[] = [];
  isLoadingCreneaux = false;
  creneauxError = '';

  selectedCreneau: CreneauResponse | null = null;
  showConfirmModal = false;
  isReserving = false;
  reserveError = '';
  showSuccessModal = false;

  constructor(
    private medecinService: MedecinService,
    private creneauService: CreneauService,
    private rendezVousService: RendezVousService,
    private authService: AuthService
  ) {
    this.medecinService.getSpecialites().subscribe({
      next: (response) => {
        if (response.success) {
          this.specialites = response.data;
        }
      },
    });
    this.rechercher();
  }

  toggleSpecialite(valeur: string): void {
    const index = this.searchSpecialites.indexOf(valeur);
    if (index === -1) {
      this.searchSpecialites.push(valeur);
    } else {
      this.searchSpecialites.splice(index, 1);
    }
  }

  specialiteLibelle(valeur: string): string {
    return this.specialites.find((s) => s.valeur === valeur)?.libelle ?? valeur;
  }

  get specialitesLabel(): string {
    if (this.searchSpecialites.length === 0) {
      return 'Toutes les spécialités';
    }
    if (this.searchSpecialites.length === 1) {
      return this.specialiteLibelle(this.searchSpecialites[0]);
    }
    return `${this.searchSpecialites.length} spécialités sélectionnées`;
  }

  rechercher(): void {
    this.searchError = '';
    this.isSearching = true;
    this.hasSearched = true;
    this.showSpecialiteDropdown = false;
    this.medecinService.rechercher({
      date: this.searchDate,
      nom: this.searchNom || undefined,
      specialites: this.searchSpecialites.length > 0 ? this.searchSpecialites : undefined,
      heureDebut: this.searchHeureDebut ? `${this.searchHeureDebut}:00` : undefined,
      heureFin: this.searchHeureFin ? `${this.searchHeureFin}:00` : undefined,
    }).subscribe({
      next: (response) => {
        this.isSearching = false;
        if (response.success) {
          this.doctors = response.data;
        } else {
          this.doctors = [];
          this.searchError = response.message;
        }
      },
      error: (err) => {
        this.isSearching = false;
        this.doctors = [];
        this.searchError = err?.error?.message ?? 'Erreur lors de la recherche des médecins.';
      },
    });
  }

  rafraichir(): void {
    this.rechercher();
    if (this.selectedDoctor) {
      this.selectDoctor(this.selectedDoctor);
    }
  }

  selectDoctor(doctor: MedecinResponse): void {
    this.selectedDoctor = doctor;
    this.creneaux = [];
    this.creneauxError = '';
    this.isLoadingCreneaux = true;

    this.creneauService.getPeriode(doctor.id, this.searchDate, this.searchDate).subscribe({
      next: (response) => {
        this.isLoadingCreneaux = false;
        if (response.success) {
          this.creneaux = response.data
            .filter((c) => c.statut === 'DISPONIBLE')
            .sort((a, b) => a.heureDebut.localeCompare(b.heureDebut));
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

  closeDoctor(): void {
    this.selectedDoctor = null;
    this.creneaux = [];
    this.creneauxError = '';
  }

  selectCreneau(creneau: CreneauResponse): void {
    this.selectedCreneau = creneau;
    this.reserveError = '';
    this.showConfirmModal = true;
  }

  annulerConfirmation(): void {
    this.showConfirmModal = false;
    this.selectedCreneau = null;
  }

  confirmerReservation(): void {
    const doctor = this.selectedDoctor;
    const creneau = this.selectedCreneau;
    const delegueId = this.authService.getDelegueId();

    if (!doctor || !creneau || !delegueId) {
      this.reserveError = 'Profil délégué introuvable.';
      return;
    }

    this.isReserving = true;
    this.reserveError = '';
    this.rendezVousService.reserver({
      creneauId: creneau.id,
      delegueId,
      medecinId: doctor.id,
    }).subscribe({
      next: (response) => {
        this.isReserving = false;
        if (!response.success) {
          this.reserveError = response.message;
          return;
        }
        this.creneaux = this.creneaux.filter((c) => c.id !== creneau.id);
        this.showConfirmModal = false;
        this.showSuccessModal = true;
      },
      error: (err) => {
        this.isReserving = false;
        this.reserveError = err?.error?.message ?? 'Erreur lors de la réservation.';
      },
    });
  }

  fermerSucces(): void {
    this.showSuccessModal = false;
    this.selectedCreneau = null;
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr + 'T00:00:00');
    const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    const day = days[date.getDay()];
    const num = date.getDate();
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    const month = months[date.getMonth()];
    return `${day} ${num} ${month}`;
  }

  formatHeure(heure: string): string {
    return heure.slice(0, 5);
  }

  private readonly avatarPalette = [
    'linear-gradient(135deg, #4dabf7, #1971c2)',
    'linear-gradient(135deg, #63e6be, #12b886)',
    'linear-gradient(135deg, #da77f2, #9c36b5)',
    'linear-gradient(135deg, #ffa8a8, #e03131)',
    'linear-gradient(135deg, #ffd43b, #f08c00)',
    'linear-gradient(135deg, #66d9e8, #0c8599)',
    'linear-gradient(135deg, #b197fc, #7048e8)',
    'linear-gradient(135deg, #ff8787, #e8590c)',
  ];

  avatarGradient(doctor: MedecinResponse): string {
    const hash = [...doctor.id].reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return this.avatarPalette[hash % this.avatarPalette.length];
  }

  initials(doctor: MedecinResponse): string {
    return `${doctor.prenom?.[0] ?? ''}${doctor.nom?.[0] ?? ''}`.toUpperCase();
  }
}
