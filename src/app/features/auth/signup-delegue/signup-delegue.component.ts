import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DelegueService } from '../../delegue/services/delegue.service';
import { LaboratoireService } from '../../../core/services/laboratoire.service';
import { LaboratoireResponse } from '../../../core/models/laboratoire.model';
import { PhoneMaskDirective } from '../../../shared/phone/phone-mask.directive';
import { phoneError } from '../../../shared/phone/phone.util';
import { PasswordStrengthComponent } from '../../../shared/password/password-strength.component';
import { passwordError } from '../../../shared/password/password-policy';

@Component({
  selector: 'app-signup-delegue',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, PhoneMaskDirective, PasswordStrengthComponent],
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
  laboName = '';
  laboInconnu = false;
  telephone = '';
  telephone2 = '';

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
    const telError = phoneError(this.telephone, this.telephone2);
    if (telError) {
      this.errorMessage = telError;
      return;
    }

    this.errorMessage = '';

    if (!this.email || !this.password || !this.nom || !this.prenom) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires.';
      return;
    }
    if (this.laboInconnu ? !this.laboName : !this.laboratoireId) {
      this.errorMessage = 'Veuillez choisir votre laboratoire ou en saisir le nom.';
      return;
    }
    const pwdError = passwordError(this.password);
    if (pwdError) {
      this.errorMessage = pwdError;
      return;
    }
    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Les mots de passe ne correspondent pas.';
      return;
    }

    this.isLoading = true;

    const resolvedLaboName = this.laboInconnu
      ? this.laboName
      : this.laboratoires.find(l => l.id === this.laboratoireId)?.nom;

    this.delegueService.inscrire({
      email: this.email,
      password: this.password,
      nom: this.nom,
      prenom: this.prenom,
      laboName: resolvedLaboName,
      telephone: this.telephone || undefined,
      telephone2: this.telephone2.trim() || undefined,
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
