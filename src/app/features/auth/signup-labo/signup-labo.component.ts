import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LaboratoireService } from '../../../core/services/laboratoire.service';

@Component({
  selector: 'app-signup-labo',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './signup-labo.component.html',
  styleUrls: ['./signup-labo.component.css'],
})
export class SignupLaboComponent {
  email = '';
  password = '';
  confirmPassword = '';
  nom = '';
  adresse = '';
  telephone = '';

  errorMessage = '';
  isLoading = false;
  isDone = false;

  constructor(private laboratoireService: LaboratoireService) {}

  onSubmit(): void {
    this.errorMessage = '';

    if (!this.email || !this.password || !this.nom || !this.adresse) {
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
    this.laboratoireService.inscrire({
      email: this.email,
      password: this.password,
      nom: this.nom,
      adresse: this.adresse,
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
