import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../../delegue/shared/modal/modal.component';
import { DelegueService } from '../../delegue/services/delegue.service';
import { DelegueResponse } from '../../delegue/models/delegue.model';
import { RendezVousService } from '../../delegue/services/rendezvous.service';
import { RendezVousEnrichmentService } from '../../delegue/services/rendezvous-enrichment.service';
import { RendezVousEnrichi } from '../../delegue/models/rendezvous-enrichi.model';
import { AuthService } from '../../../core/services/auth.service';
import { calculerStatsDelegue, StatsDelegue } from '../labo-stats.util';

interface CreerForm {
  email: string;
  password: string;
  nom: string;
  prenom: string;
  telephone: string;
}

const EMPTY_FORM: CreerForm = { email: '', password: '', nom: '', prenom: '', telephone: '' };

@Component({
  selector: 'app-labo-delegues',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent],
  templateUrl: './delegues.component.html',
  styleUrls: ['./delegues.component.css'],
})
export class DeleguesComponent implements OnInit {
  delegues: DelegueResponse[] = [];
  isLoading = false;
  errorMessage = '';

  showCreateModal = false;
  form: CreerForm = { ...EMPTY_FORM };
  formError = '';
  isSaving = false;

  selectedDelegue: DelegueResponse | null = null;
  detailLoading = false;
  detailStats: StatsDelegue | null = null;
  detailRendezvous: RendezVousEnrichi[] = [];

  constructor(
    private delegueService: DelegueService,
    private rendezVousService: RendezVousService,
    private enrichmentService: RendezVousEnrichmentService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.chargerDelegues();
  }

  chargerDelegues(): void {
    const laboratoireId = this.authService.getLaboratoireId();
    if (!laboratoireId) {
      this.errorMessage = 'Impossible de retrouver votre laboratoire.';
      return;
    }
    this.isLoading = true;
    this.errorMessage = '';
    this.delegueService.getByLaboratoire(laboratoireId).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.delegues = response.data;
        } else {
          this.errorMessage = response.message;
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err?.error?.message ?? 'Erreur lors du chargement des délégués.';
      },
    });
  }

  openCreateModal(): void {
    this.form = { ...EMPTY_FORM };
    this.formError = '';
    this.showCreateModal = true;
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
  }

  creerDelegue(): void {
    if (!this.form.email.trim() || !this.form.password.trim() || !this.form.nom.trim() || !this.form.prenom.trim()) {
      this.formError = 'Email, mot de passe, nom et prénom sont obligatoires.';
      return;
    }
    if (this.form.password.length < 6) {
      this.formError = 'Le mot de passe doit contenir au moins 6 caractères.';
      return;
    }

    this.isSaving = true;
    this.formError = '';
    this.delegueService.creerDelegueComplet({
      email: this.form.email.trim(),
      password: this.form.password,
      nom: this.form.nom.trim(),
      prenom: this.form.prenom.trim(),
      telephone: this.form.telephone.trim() || undefined,
    }).subscribe({
      next: (response) => {
        this.isSaving = false;
        if (response.success) {
          this.delegues.push(response.data);
          this.showCreateModal = false;
        } else {
          this.formError = response.message;
        }
      },
      error: (err) => {
        this.isSaving = false;
        this.formError = err?.error?.message ?? 'Erreur lors de la création du délégué.';
      },
    });
  }

  toggleActif(delegue: DelegueResponse): void {
    const action = delegue.isActive
      ? confirm(`Désactiver ${delegue.prenom} ${delegue.nom} ? Il ne pourra plus se connecter à son espace.`)
      : confirm(`Réactiver ${delegue.prenom} ${delegue.nom} ?`);
    if (!action) {
      return;
    }

    const call = delegue.isActive
      ? this.delegueService.desactiver(delegue.id)
      : this.delegueService.activer(delegue.id);

    call.subscribe({
      next: (response) => {
        if (response.success) {
          const index = this.delegues.findIndex((d) => d.id === delegue.id);
          if (index !== -1) {
            this.delegues[index] = response.data;
          }
          if (this.selectedDelegue?.id === delegue.id) {
            this.selectedDelegue = response.data;
          }
        }
      },
      error: (err) => {
        this.errorMessage = err?.error?.message ?? 'Erreur lors de la mise à jour du statut.';
      },
    });
  }

  voirDetail(delegue: DelegueResponse): void {
    this.selectedDelegue = delegue;
    this.detailLoading = true;
    this.detailStats = null;
    this.detailRendezvous = [];

    const aujourdHui = new Date();
    const dateDebut = new Date(aujourdHui);
    dateDebut.setFullYear(dateDebut.getFullYear() - 2);
    const dateFin = new Date(aujourdHui);
    dateFin.setFullYear(dateFin.getFullYear() + 1);

    this.rendezVousService.listeDelegue(delegue.id).subscribe({
      next: (response) => {
        if (!response.success) {
          this.detailLoading = false;
          return;
        }
        this.enrichmentService.enrichir(
          response.data,
          dateDebut.toISOString().slice(0, 10),
          dateFin.toISOString().slice(0, 10)
        ).subscribe({
          next: (enrichis) => {
            this.detailLoading = false;
            this.detailRendezvous = enrichis.sort((a, b) => b.date.localeCompare(a.date));
            this.detailStats = calculerStatsDelegue(enrichis);
          },
          error: () => {
            this.detailLoading = false;
          },
        });
      },
      error: () => {
        this.detailLoading = false;
      },
    });
  }

  fermerDetail(): void {
    this.selectedDelegue = null;
  }

  formatDate(dateStr: string): string {
    if (!dateStr) {
      return '—';
    }
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('fr-FR');
  }
}
