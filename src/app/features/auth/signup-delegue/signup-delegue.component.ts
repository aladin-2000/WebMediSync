import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DelegueService } from '../../delegue/services/delegue.service';
import { LaboratoireService } from '../../../core/services/laboratoire.service';
import { LaboratoireResponse } from '../../../core/models/laboratoire.model';

@Component({
  selector: 'app-signup-delegue',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './signup-delegue.component.html',
  styleUrls: ['./signup-delegue.component.css'],
})
export class SignupDelegueComponent implements OnInit {
  email = '';
  password = '';
  confirmPassword = '';
  nom = '';
  prenom = '';
  laboratoireId = '';
  telephone = '';

  laboratoires: LaboratoireResponse[] = [];
  errorMessage = '';
  isLoading = false;
  isDone = false;

  constructor(
    private delegueService: DelegueService,
    private laboratoireService: LaboratoireService
  ) {}

  ngOnInit(): void {
    this.laboratoireService.getAll().subscribe({
      next: (response) => {
        if (response.success) {
          this.laboratoires = [...response.data].sort((a, b) => a.nom.localeCompare(b.nom));
        }
      },
    });
  }

  onSubmit(): void {
    this.errorMessage = '';

    if (!this.email || !this.password || !this.nom || !this.prenom || !this.laboratoireId) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires.';
      return;
    }
    if (this.password.length < 6) {
      this.errorMessage = 'Le mot de passe doit contenir au moins 6 caractères.';
      return;
    }
    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Les mots de passe ne correspondent pas.';
      return;
    }

    this.isLoading = true;
    this.delegueService.inscrire({
      email: this.email,
      password: this.password,
      nom: this.nom,
      prenom: this.prenom,
      laboratoireId: this.laboratoireId,
      telephone: this.telephone || undefined,
    }).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.isDone = true;
        } else {
          this.errorMessage = response.message;
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err?.error?.message ?? "Erreur lors de l'inscription.";
      },
    });
  }
}
