import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MedecinService } from '../../admin/services/medecin.service';
import { FonctionOption, RegionOption, SpecialiteOption } from '../../admin/models/medecin.model';
import { EtablissementService } from '../../admin/services/etablissement.service';
import { EtablissementResponse } from '../../admin/models/etablissement.model';
import { EtablissementComboboxComponent } from '../../../shared/etablissement-combobox/etablissement-combobox.component';
import { PhoneMaskDirective } from '../../../shared/phone/phone-mask.directive';
import { phoneError } from '../../../shared/phone/phone.util';
import { PasswordStrengthComponent } from '../../../shared/password/password-strength.component';
import { passwordError } from '../../../shared/password/password-policy';

@Component({
  selector: 'app-signup-medecin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, EtablissementComboboxComponent, PhoneMaskDirective, PasswordStrengthComponent],
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
  regionId = '';
  telephone = '';
  telephone2 = '';
  fonction = '';
  etablissementId = '';

  specialites: SpecialiteOption[] = [];
  regions: RegionOption[] = [];
  fonctions: FonctionOption[] = [];
  etablissements: EtablissementResponse[] = [];
  errorMessage = '';
  isLoading = false;
  isDone = false;

  constructor(
    private medecinService: MedecinService,
    private etablissementService: EtablissementService
  ) {}

  ngOnInit(): void {
    this.medecinService.getSpecialites().subscribe({
      next: (response) => {
        if (response.success) {
          this.specialites = response.data;
        }
      },
    });
    this.medecinService.getRegions().subscribe({
      next: (response) => {
        if (response.success) {
          this.regions = response.data;
        }
      },
    });
    this.medecinService.getFonctions().subscribe({
      next: (response) => {
        if (response.success) {
          this.fonctions = response.data;
        }
      },
    });
    this.etablissementService.getAll().subscribe({
      next: (response) => {
        if (response.success) {
          this.etablissements = response.data;
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

    if (!this.email || !this.password || !this.nom || !this.prenom || !this.specialite || !this.fonction || !this.adresseCabinet || !this.regionId) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires.';
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
    this.medecinService.inscrire({
      email: this.email,
      password: this.password,
      nom: this.nom,
      prenom: this.prenom,
      specialite: this.specialite,
      adresseCabinet: this.adresseCabinet,
      regionId: this.regionId,
      telephone: this.telephone || undefined,
      telephone2: this.telephone2.trim() || undefined,
      fonction: this.fonction,
      etablissementId: this.etablissementId || undefined,
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
