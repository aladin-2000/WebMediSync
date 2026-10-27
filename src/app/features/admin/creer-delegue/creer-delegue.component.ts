import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DelegueService } from '../../delegue/services/delegue.service';
import { LaboratoireService } from '../../../core/services/laboratoire.service';
import { LaboratoireResponse } from '../../../core/models/laboratoire.model';

interface CreerDelegueForm {
  email: string;
  nom: string;
  prenom: string;
  telephone: string;
  laboratoireId: string;
}

const EMPTY_FORM: CreerDelegueForm = {
  email: '',
  nom: '',
  prenom: '',
  telephone: '',
  laboratoireId: '',
};

@Component({
  selector: 'app-creer-delegue',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './creer-delegue.component.html',
  styleUrls: ['./creer-delegue.component.css'],
})
export class CreerDelegueComponent implements OnInit {
  laboratoires: LaboratoireResponse[] = [];
  form: CreerDelegueForm = { ...EMPTY_FORM };
  formError = '';
  successMessage = '';
  isSaving = false;

  constructor(
    private delegueService: DelegueService,
    private laboratoireService: LaboratoireService
  ) {}

  ngOnInit(): void {
    this.laboratoireService.getAll().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.laboratoires = [...response.data].sort((a, b) => a.nom.localeCompare(b.nom));
        }
      },
    });
  }

  onSubmit(): void {
    if (!this.form.email || !this.form.nom || !this.form.prenom || !this.form.laboratoireId) {
      this.formError = 'Email, nom, prénom et laboratoire sont obligatoires.';
      return;
    }

    if (!confirm(`Créer le compte délégué pour ${this.form.prenom.trim()} ${this.form.nom.trim()} ?`)) {
      return;
    }

    this.isSaving = true;
    this.formError = '';
    this.successMessage = '';
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
          this.successMessage = `Le compte de ${response.data.prenom} ${response.data.nom} a été créé avec succès.`;
          this.form = { ...EMPTY_FORM };
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
}
