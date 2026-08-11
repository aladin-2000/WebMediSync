import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MedecinService } from '../../admin/services/medecin.service';
import { SpecialiteOption } from '../../admin/models/medecin.model';

@Component({
  selector: 'app-signup-medecin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './signup-medecin.component.html',
  styleUrls: ['./signup-medecin.component.css'],
})
export class SignupMedecinComponent implements OnInit {
  email = '';
  password = '';
  confirmPassword = '';
  nom = '';
  prenom = '';
  specialite = '';
  adresseCabinet = '';
  telephone = '';

  specialites: SpecialiteOption[] = [];
  errorMessage = '';
  isLoading = false;
  isDone = false;

  constructor(private medecinService: MedecinService) {}

  ngOnInit(): void {
    this.medecinService.getSpecialites().subscribe({
      next: (response) => {
        if (response.success) {
          this.specialites = response.data;
        }
      },
    });
  }

  onSubmit(): void {
    this.errorMessage = '';

    if (!this.email || !this.password || !this.nom || !this.prenom || !this.specialite || !this.adresseCabinet) {
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
    this.medecinService.inscrire({
      email: this.email,
      password: this.password,
      nom: this.nom,
      prenom: this.prenom,
      specialite: this.specialite,
      adresseCabinet: this.adresseCabinet,
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
