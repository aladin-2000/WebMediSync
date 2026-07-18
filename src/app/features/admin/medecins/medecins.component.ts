import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../../disponibilites/shared/modal/modal.component';
import { MedecinService } from '../services/medecin.service';
import { MedecinResponse } from '../models/medecin.model';

interface MedecinFormState {
  email: string;
  password: string;
  nom: string;
  prenom: string;
  specialite: string;
  adresseCabinet: string;
}

const EMPTY_FORM: MedecinFormState = {
  email: '',
  password: '',
  nom: '',
  prenom: '',
  specialite: '',
  adresseCabinet: '',
};

@Component({
  selector: 'app-admin-medecins',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent],
  templateUrl: './medecins.component.html',
  styleUrls: ['./medecins.component.css'],
})
export class MedecinsComponent implements OnInit {
  medecins: MedecinResponse[] = [];
  isLoading = false;
  errorMessage = '';

  showModal = false;
  editingMedecin: MedecinResponse | null = null;
  form: MedecinFormState = { ...EMPTY_FORM };
  formError = '';
  isSaving = false;

  constructor(private medecinService: MedecinService) {}

  ngOnInit(): void {
    this.loadMedecins();
  }

  loadMedecins(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.medecinService.getAll().subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success && response.data) {
          this.medecins = response.data;
        }
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = "Impossible de charger la liste des médecins.";
      },
    });
  }

  openAddModal(): void {
    this.editingMedecin = null;
    this.form = { ...EMPTY_FORM };
    this.formError = '';
    this.showModal = true;
  }

  openEditModal(medecin: MedecinResponse): void {
    this.editingMedecin = medecin;
    this.form = {
      email: '',
      password: '',
      nom: medecin.nom,
      prenom: medecin.prenom,
      specialite: medecin.specialite,
      adresseCabinet: medecin.adresseCabinet ?? '',
    };
    this.formError = '';
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  onSubmit(): void {
    this.formError = '';

    if (!this.form.nom || !this.form.prenom || !this.form.specialite) {
      this.formError = 'Nom, prénom et spécialité sont obligatoires.';
      return;
    }

    if (this.editingMedecin) {
      this.updateMedecin(this.editingMedecin.id);
    } else {
      this.createMedecin();
    }
  }

  private createMedecin(): void {
    if (!this.form.email || !this.form.password) {
      this.formError = 'Email et mot de passe sont obligatoires.';
      return;
    }

    this.isSaving = true;
    this.medecinService
      .create({
        email: this.form.email,
        password: this.form.password,
        nom: this.form.nom,
        prenom: this.form.prenom,
        specialite: this.form.specialite,
        adresseCabinet: this.form.adresseCabinet || undefined,
      })
      .subscribe({
        next: (response) => {
          this.isSaving = false;
          if (response.success && response.data) {
            this.medecins.push(response.data);
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

  private updateMedecin(id: string): void {
    this.isSaving = true;
    this.medecinService
      .update(id, {
        nom: this.form.nom,
        prenom: this.form.prenom,
        specialite: this.form.specialite,
        adresseCabinet: this.form.adresseCabinet || undefined,
      })
      .subscribe({
        next: (response) => {
          this.isSaving = false;
          if (response.success && response.data) {
            const updated = response.data;
            const index = this.medecins.findIndex((m) => m.id === id);
            if (index !== -1) {
              this.medecins[index] = updated;
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

  deleteMedecin(medecin: MedecinResponse): void {
    const confirmed = confirm(`Supprimer le profil de ${medecin.prenom} ${medecin.nom} ?`);
    if (!confirmed) {
      return;
    }

    this.medecinService.delete(medecin.id).subscribe({
      next: (response) => {
        if (response.success) {
          this.medecins = this.medecins.filter((m) => m.id !== medecin.id);
        }
      },
      error: () => {
        this.errorMessage = 'Erreur lors de la suppression.';
      },
    });
  }
}
