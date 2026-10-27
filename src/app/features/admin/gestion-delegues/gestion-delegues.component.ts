import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../../medecin/shared/modal/modal.component';
import { PaginationComponent } from '../shared/pagination/pagination.component';
import { DelegueService } from '../../delegue/services/delegue.service';
import { DelegueResponse } from '../../delegue/models/delegue.model';
import { LaboratoireService } from '../../../core/services/laboratoire.service';
import { LaboratoireResponse } from '../../../core/models/laboratoire.model';

interface DelegueFormState {
  email: string;
  nom: string;
  prenom: string;
  telephone: string;
  laboratoireId: string;
}

const EMPTY_FORM: DelegueFormState = {
  email: '',
  nom: '',
  prenom: '',
  telephone: '',
  laboratoireId: '',
};

@Component({
  selector: 'app-gestion-delegues',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent, PaginationComponent],
  templateUrl: './gestion-delegues.component.html',
  styleUrls: ['./gestion-delegues.component.css', '../shared/admin-modal-form.css'],
})
export class GestionDeleguesComponent implements OnInit {
  delegues: DelegueResponse[] = [];
  laboratoires: LaboratoireResponse[] = [];
  isLoading = false;
  errorMessage = '';
  filtreLaboId = '';
  currentPage = 0;
  pageSize = 10;

  showModal = false;
  isCreating = false;
  editingDelegue: DelegueResponse | null = null;
  form: DelegueFormState = { ...EMPTY_FORM };
  formError = '';
  successMessage = '';
  isSaving = false;

  constructor(
    private delegueService: DelegueService,
    private laboratoireService: LaboratoireService
  ) {}

  ngOnInit(): void {
    this.loadDelegues();
    this.loadLaboratoires();
  }

  loadDelegues(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.delegueService.getAll().subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success && response.data) {
          this.delegues = response.data;
        }
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Impossible de charger la liste des délégués.';
      },
    });
  }

  loadLaboratoires(): void {
    this.laboratoireService.getAll().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.laboratoires = [...response.data].sort((a, b) => a.nom.localeCompare(b.nom));
        }
      },
    });
  }

  get filteredDelegues(): DelegueResponse[] {
    if (!this.filtreLaboId) return this.delegues;
    return this.delegues.filter(d => d.laboratoireId === this.filtreLaboId);
  }

  get paginatedDelegues(): DelegueResponse[] {
    const start = this.currentPage * this.pageSize;
    return this.filteredDelegues.slice(start, start + this.pageSize);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
  }

  onFiltreChange(): void {
    this.currentPage = 0;
  }

  laboNom(laboratoireId: string | null): string {
    if (!laboratoireId) return '—';
    return this.laboratoires.find(l => l.id === laboratoireId)?.nom ?? '—';
  }

  openCreateModal(): void {
    this.isCreating = true;
    this.editingDelegue = null;
    this.form = { ...EMPTY_FORM };
    this.formError = '';
    this.showModal = true;
  }

  openEditModal(delegue: DelegueResponse): void {
    this.editingDelegue = delegue;
    this.form = {
      email: '',
      nom: delegue.nom,
      prenom: delegue.prenom,
      telephone: delegue.telephone ?? '',
      laboratoireId: delegue.laboratoireId ?? '',
    };
    this.formError = '';
    this.isCreating = false;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingDelegue = null;
    this.isCreating = false;
  }

  onSubmit(): void {
    if (this.isCreating) {
      this.onCreate();
    } else {
      this.onUpdate();
    }
  }

  private onCreate(): void {
    if (!this.form.email || !this.form.nom || !this.form.prenom || !this.form.laboratoireId) {
      this.formError = 'Email, nom, prénom et laboratoire sont obligatoires.';
      return;
    }

    if (!confirm(`Créer le compte délégué pour ${this.form.prenom.trim()} ${this.form.nom.trim()} ?`)) {
      return;
    }

    this.isSaving = true;
    this.formError = '';
    this.delegueService.adminCreer({
      email: this.form.email.trim(),
      password: 'medisync2027',
      nom: this.form.nom.trim(),
      prenom: this.form.prenom.trim(),
      telephone: this.form.telephone.trim() || undefined,
      laboratoireId: this.form.laboratoireId,
    }).subscribe({
      next: (response) => {
        this.isSaving = false;
        if (response.success && response.data) {
          this.delegues.push(response.data);
          this.showModal = false;
          this.isCreating = false;
          this.successMessage = `Le compte de ${response.data.prenom} ${response.data.nom} a été créé avec succès.`;
          setTimeout(() => this.successMessage = '', 5000);
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

  private onUpdate(): void {
    if (!this.editingDelegue) return;

    if (!this.form.nom || !this.form.prenom) {
      this.formError = 'Le nom et le prénom sont obligatoires.';
      return;
    }

    this.isSaving = true;
    this.formError = '';
    this.delegueService.adminUpdate(this.editingDelegue.id, {
      userId: this.editingDelegue.userId,
      nom: this.form.nom.trim(),
      prenom: this.form.prenom.trim(),
      telephone: this.form.telephone.trim() || undefined,
      laboratoireId: this.form.laboratoireId || undefined,
    }).subscribe({
      next: (response) => {
        this.isSaving = false;
        if (response.success && response.data) {
          const index = this.delegues.findIndex(d => d.id === this.editingDelegue!.id);
          if (index !== -1) {
            this.delegues[index] = response.data;
          }
          this.showModal = false;
          this.editingDelegue = null;
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

  toggleActif(delegue: DelegueResponse): void {
    const action = delegue.isActive
      ? confirm(`Désactiver le délégué ${delegue.prenom} ${delegue.nom} ?`)
      : confirm(`Réactiver le délégué ${delegue.prenom} ${delegue.nom} ?`);
    if (!action) return;

    const call = delegue.isActive
      ? this.delegueService.desactiver(delegue.id)
      : this.delegueService.activer(delegue.id);

    call.subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const index = this.delegues.findIndex(d => d.id === delegue.id);
          if (index !== -1) {
            this.delegues[index] = response.data;
          }
        }
      },
      error: (err) => {
        this.errorMessage = err?.error?.message ?? 'Erreur lors de la mise à jour du statut.';
      },
    });
  }

  formatDate(dateStr: string | null): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('fr-FR');
  }
}
