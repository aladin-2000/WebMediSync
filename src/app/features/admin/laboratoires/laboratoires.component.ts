import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../../medecin/shared/modal/modal.component';
import { LaboratoireService } from '../../../core/services/laboratoire.service';
import { LaboratoireResponse, StatutAbonnement } from '../../../core/models/laboratoire.model';

interface LaboFormState {
  email: string;
  password: string;
  nom: string;
  adresse: string;
  telephone: string;
  statutAbonnement: StatutAbonnement | '';
  dateDebutAbonnement: string;
  dateFinAbonnement: string;
}

const EMPTY_FORM: LaboFormState = {
  email: '',
  password: '',
  nom: '',
  adresse: '',
  telephone: '',
  statutAbonnement: '',
  dateDebutAbonnement: '',
  dateFinAbonnement: '',
};

@Component({
  selector: 'app-admin-laboratoires',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent],
  templateUrl: './laboratoires.component.html',
  styleUrls: ['./laboratoires.component.css'],
})
export class LaboratoiresComponent implements OnInit {
  laboratoires: LaboratoireResponse[] = [];
  isLoading = false;
  errorMessage = '';

  showModal = false;
  form: LaboFormState = { ...EMPTY_FORM };
  formError = '';
  isSaving = false;

  constructor(private laboratoireService: LaboratoireService) {}

  ngOnInit(): void {
    this.loadLaboratoires();
  }

  loadLaboratoires(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.laboratoireService.getAll().subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success && response.data) {
          this.laboratoires = response.data;
        }
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Impossible de charger la liste des laboratoires.';
      },
    });
  }

  openAddModal(): void {
    this.form = { ...EMPTY_FORM };
    this.formError = '';
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  onSubmit(): void {
    this.formError = '';

    if (!this.form.email || !this.form.password || !this.form.nom || !this.form.adresse || !this.form.statutAbonnement
      || !this.form.dateDebutAbonnement || !this.form.dateFinAbonnement) {
      this.formError = 'Email, mot de passe, nom, adresse, statut et dates d\'abonnement sont obligatoires.';
      return;
    }
    if (this.form.password.length < 6) {
      this.formError = 'Le mot de passe doit contenir au moins 6 caractères.';
      return;
    }

    this.isSaving = true;
    this.laboratoireService
      .creerLaboratoireComplet({
        email: this.form.email.trim(),
        password: this.form.password,
        nom: this.form.nom.trim(),
        adresse: this.form.adresse.trim(),
        telephone: this.form.telephone.trim() || undefined,
        statutAbonnement: this.form.statutAbonnement as StatutAbonnement,
        dateDebutAbonnement: this.form.dateDebutAbonnement,
        dateFinAbonnement: this.form.dateFinAbonnement,
      })
      .subscribe({
        next: (response) => {
          this.isSaving = false;
          if (response.success && response.data) {
            this.laboratoires.push(response.data);
            this.showModal = false;
          } else {
            this.formError = response.message;
          }
        },
        error: (err) => {
          this.isSaving = false;
          this.formError = err?.error?.message ?? 'Erreur lors de la création.';
        },
      });
  }

  toggleActif(labo: LaboratoireResponse): void {
    const action = labo.isActive
      ? confirm(`Désactiver le laboratoire ${labo.nom} ? Tous ses délégués seront également désactivés et ne pourront plus se connecter.`)
      : confirm(`Réactiver le laboratoire ${labo.nom} ?`);
    if (!action) {
      return;
    }

    const call = labo.isActive
      ? this.laboratoireService.desactiver(labo.id)
      : this.laboratoireService.activer(labo.id);

    call.subscribe({
      next: (response) => {
        if (response.success) {
          const index = this.laboratoires.findIndex((l) => l.id === labo.id);
          if (index !== -1) {
            this.laboratoires[index] = response.data;
          }
        }
      },
      error: (err) => {
        this.errorMessage = err?.error?.message ?? 'Erreur lors de la mise à jour du statut.';
      },
    });
  }

  formatDate(dateStr: string | null): string {
    if (!dateStr) {
      return '—';
    }
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('fr-FR');
  }
}
