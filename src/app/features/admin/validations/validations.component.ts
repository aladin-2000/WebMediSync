import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MedecinService } from '../services/medecin.service';
import { MedecinResponse, SpecialiteOption } from '../models/medecin.model';

@Component({
  selector: 'app-admin-validations',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './validations.component.html',
  styleUrls: ['./validations.component.css'],
})
export class ValidationsComponent implements OnInit {
  medecinsEnAttente: MedecinResponse[] = [];
  specialites: SpecialiteOption[] = [];
  isLoading = false;
  errorMessage = '';
  validatingId: string | null = null;

  constructor(private medecinService: MedecinService) {}

  ngOnInit(): void {
    this.charger();
    this.medecinService.getSpecialites().subscribe({
      next: (response) => {
        if (response.success) {
          this.specialites = response.data;
        }
      },
    });
  }

  charger(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.medecinService.getEnAttente().subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.medecinsEnAttente = response.data;
        } else {
          this.errorMessage = response.message;
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err?.error?.message ?? 'Impossible de charger les médecins en attente.';
      },
    });
  }

  specialiteLibelle(valeur: string): string {
    return this.specialites.find((s) => s.valeur === valeur)?.libelle ?? valeur;
  }

  validerMedecin(medecin: MedecinResponse): void {
    this.validatingId = medecin.id;
    this.medecinService.valider(medecin.id).subscribe({
      next: (response) => {
        this.validatingId = null;
        if (response.success) {
          this.medecinsEnAttente = this.medecinsEnAttente.filter((m) => m.id !== medecin.id);
        } else {
          this.errorMessage = response.message;
        }
      },
      error: (err) => {
        this.validatingId = null;
        this.errorMessage = err?.error?.message ?? 'Erreur lors de la validation du médecin.';
      },
    });
  }
}
