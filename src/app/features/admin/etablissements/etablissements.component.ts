import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../../medecin/shared/modal/modal.component';
import { PaginationComponent } from '../shared/pagination/pagination.component';
import { EtablissementService } from '../services/etablissement.service';
import { MedecinService } from '../services/medecin.service';
import { EtablissementResponse } from '../models/etablissement.model';
import { RegionOption } from '../models/medecin.model';

interface EtablissementFormState {
  nom: string;
  adresse: string;
  regionId: string;
}

const EMPTY_FORM: EtablissementFormState = { nom: '', adresse: '', regionId: '' };

@Component({
  selector: 'app-admin-etablissements',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent, PaginationComponent],
  templateUrl: './etablissements.component.html',
  styleUrls: ['./etablissements.component.css', '../shared/admin-modal-form.css'],
})
export class EtablissementsComponent implements OnInit {
  etablissements: EtablissementResponse[] = [];
  regions: RegionOption[] = [];
  recherche = '';
  isLoading = false;
  errorMessage = '';
  currentPage = 0;
  pageSize = 10;

  showModal = false;
  editing: EtablissementResponse | null = null;
  form: EtablissementFormState = { ...EMPTY_FORM };
  formError = '';
  isSaving = false;

  constructor(
    private etablissementService: EtablissementService,
    private medecinService: MedecinService
  ) {}

  ngOnInit(): void {
    this.load();
    this.medecinService.getRegions().subscribe({
      next: (response) => {
        if (response.success) {
          this.regions = response.data;
        }
      },
    });
  }

  load(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.etablissementService.getAll().subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success && response.data) {
          this.etablissements = response.data;
          this.currentPage = 0;
        }
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Impossible de charger la liste des établissements.';
      },
    });
  }

  get filtered(): EtablissementResponse[] {
    const q = this.recherche.trim().toLowerCase();
    if (!q) {
      return this.etablissements;
    }
    return this.etablissements.filter(
      (e) => e.nom.toLowerCase().includes(q) || (e.regionNom ?? '').toLowerCase().includes(q)
    );
  }

  get paginated(): EtablissementResponse[] {
    const start = this.currentPage * this.pageSize;
    return this.filtered.slice(start, start + this.pageSize);
  }

  onRechercheChange(): void {
    this.currentPage = 0;
  }

  onPageChange(page: number): void {
    this.currentPage = page;
  }

  openAddModal(): void {
    this.editing = null;
    this.form = { ...EMPTY_FORM };
    this.formError = '';
    this.showModal = true;
  }

  openEditModal(etab: EtablissementResponse): void {
    this.editing = etab;
    this.form = { nom: etab.nom, adresse: etab.adresse ?? '', regionId: etab.regionId ?? '' };
    this.formError = '';
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  get modalTitle(): string {
    return this.editing ? "Modifier l'établissement" : 'Ajouter un établissement';
  }

  onSubmit(): void {
    this.formError = '';
    if (!this.form.nom.trim()) {
      this.formError = 'Le nom est obligatoire.';
      return;
    }

    const body = {
      nom: this.form.nom.trim(),
      adresse: this.form.adresse.trim() || undefined,
      regionId: this.form.regionId || undefined,
    };
    const editing = this.editing;
    const call = editing
      ? this.etablissementService.update(editing.id, body)
      : this.etablissementService.create(body);

    this.isSaving = true;
    call.subscribe({
      next: (response) => {
        this.isSaving = false;
        if (response.success && response.data) {
          if (editing) {
            const index = this.etablissements.findIndex((e) => e.id === editing.id);
            if (index !== -1) {
              this.etablissements[index] = response.data;
            }
          } else {
            this.etablissements = [...this.etablissements, response.data].sort((a, b) =>
              a.nom.localeCompare(b.nom, 'fr')
            );
          }
          this.showModal = false;
        } else {
          this.formError = response.message;
        }
      },
      error: (err) => {
        this.isSaving = false;
        this.formError = err?.error?.message ?? "Erreur lors de l'enregistrement.";
      },
    });
  }

  deleteEtablissement(etab: EtablissementResponse): void {
    if (!confirm(`Supprimer l'établissement « ${etab.nom} » ?`)) {
      return;
    }
    this.errorMessage = '';
    this.etablissementService.delete(etab.id).subscribe({
      next: (response) => {
        if (response.success) {
          this.etablissements = this.etablissements.filter((e) => e.id !== etab.id);
        }
      },
      error: (err) => {
        this.errorMessage = err?.error?.message ?? 'Erreur lors de la suppression.';
      },
    });
  }
}
