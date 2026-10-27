import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../../medecin/shared/modal/modal.component';
import { PaginationComponent } from '../shared/pagination/pagination.component';
import { DelegueService } from '../../delegue/services/delegue.service';
import { DelegueResponse } from '../../delegue/models/delegue.model';
import { LaboratoireService } from '../../../core/services/laboratoire.service';
import { LaboratoireResponse } from '../../../core/models/laboratoire.model';

@Component({
  selector: 'app-admin-delegues',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent, PaginationComponent],
  templateUrl: './delegues.component.html',
  styleUrls: ['./delegues.component.css', '../shared/admin-modal-form.css'],
})
export class AdminDeleguesComponent implements OnInit {
  delegues: DelegueResponse[] = [];
  laboratoires: LaboratoireResponse[] = [];
  isLoading = false;
  errorMessage = '';
  currentPage = 0;
  pageSize = 10;

  showModal = false;
  selectedDelegue: DelegueResponse | null = null;
  selectedLaboId = '';
  formError = '';
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
          this.delegues = response.data.filter(d => !d.isActive && !d.laboratoireId);
          this.currentPage = 0;
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
          this.laboratoires = [...response.data]
            .filter(l => l.isActive)
            .sort((a, b) => a.nom.localeCompare(b.nom));
        }
      },
    });
  }

  get paginatedDelegues(): DelegueResponse[] {
    const start = this.currentPage * this.pageSize;
    return this.delegues.slice(start, start + this.pageSize);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
  }

  openActiverModal(delegue: DelegueResponse): void {
    this.selectedDelegue = delegue;
    this.selectedLaboId = '';
    this.formError = '';
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedDelegue = null;
  }

  onActiver(): void {
    if (!this.selectedDelegue) return;

    if (!this.selectedLaboId) {
      this.formError = 'Veuillez choisir un laboratoire.';
      return;
    }

    this.isSaving = true;
    this.formError = '';
    this.delegueService.adminActiver(this.selectedDelegue.id, this.selectedLaboId).subscribe({
      next: (response) => {
        this.isSaving = false;
        if (response.success) {
          this.delegues = this.delegues.filter(d => d.id !== this.selectedDelegue!.id);
          this.showModal = false;
          this.selectedDelegue = null;
        } else {
          this.formError = response.message;
        }
      },
      error: (err) => {
        this.isSaving = false;
        this.formError = err?.error?.message ?? "Erreur lors de l'activation.";
      },
    });
  }

  formatDate(dateStr: string | null): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('fr-FR');
  }
}
