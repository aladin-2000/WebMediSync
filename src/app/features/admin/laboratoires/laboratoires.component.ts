import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../../medecin/shared/modal/modal.component';
import { PaginationComponent } from '../shared/pagination/pagination.component';
import { LaboratoireService } from '../../../core/services/laboratoire.service';
import { LaboratoireResponse, StatutAbonnement } from '../../../core/models/laboratoire.model';

interface LaboFormState {
  email: string;
  nom: string;
  adresse: string;
  telephone: string;
  statutAbonnement: StatutAbonnement | '';
  dateDebutAbonnement: string;
  dateFinAbonnement: string;
}

const EMPTY_FORM: LaboFormState = {
  email: '',
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
  imports: [CommonModule, FormsModule, ModalComponent, PaginationComponent],
  templateUrl: './laboratoires.component.html',
  styleUrls: ['./laboratoires.component.css', '../shared/admin-modal-form.css'],
})
export class LaboratoiresComponent implements OnInit {
  laboratoires: LaboratoireResponse[] = [];
  isLoading = false;
  errorMessage = '';
  currentPage = 0;
  pageSize = 10;

  showModal = false;
  editingLabo: LaboratoireResponse | null = null;
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
          this.currentPage = 0;
        }
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Impossible de charger la liste des laboratoires.';
      },
    });
  }

  get paginatedLaboratoires(): LaboratoireResponse[] {
    const start = this.currentPage * this.pageSize;
    return this.laboratoires.slice(start, start + this.pageSize);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
  }

  openAddModal(): void {
    this.editingLabo = null;
    this.form = { ...EMPTY_FORM };
    this.formError = '';
    this.showModal = true;
  }

  openEditModal(labo: LaboratoireResponse): void {
    this.editingLabo = labo;
    this.form = {
      email: '',
      nom: labo.nom,
      adresse: labo.adresse ?? '',
      telephone: labo.telephone ?? '',
      statutAbonnement: labo.statutAbonnement,
      dateDebutAbonnement: labo.dateDebutAbonnement ?? '',
      dateFinAbonnement: labo.dateFinAbonnement ?? '',
    };
    this.formError = '';
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  onSubmit(): void {
    this.formError = '';

    if (!this.form.nom || !this.form.adresse || !this.form.statutAbonnement
      || !this.form.dateDebutAbonnement || !this.form.dateFinAbonnement) {
      this.formError = 'Nom, adresse, statut et dates d\'abonnement sont obligatoires.';
      return;
    }

    if (this.editingLabo) {
      this.updateLaboratoire(this.editingLabo);
    } else {
      this.createLaboratoire();
    }
  }

  private createLaboratoire(): void {
    if (!this.form.email) {
      this.formError = 'L\'email est obligatoire.';
      return;
    }

    this.isSaving = true;
    this.laboratoireService
      .creerLaboratoireComplet({
        email: this.form.email.trim(),
        password: 'medisync2027',
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

  private updateLaboratoire(labo: LaboratoireResponse): void {
    this.isSaving = true;
    this.laboratoireService
      .update(labo.id, {
        userId: labo.userId,
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
            const updated = response.data;
            const index = this.laboratoires.findIndex((l) => l.id === labo.id);
            if (index !== -1) {
              this.laboratoires[index] = updated;
            }
            this.showModal = false;
          } else {
            this.formError = response.message;
          }
        },
        error: (err) => {
          this.isSaving = false;
          this.formError = err?.error?.message ?? 'Erreur lors de la modification.';
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
