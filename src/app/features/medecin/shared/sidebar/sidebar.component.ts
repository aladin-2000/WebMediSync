import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { MedecinService } from '../../../admin/services/medecin.service';
import { MedecinResponse, SpecialiteOption } from '../../../admin/models/medecin.model';
import { ModalComponent } from '../modal/modal.component';

export type ViewName = 'calendar' | 'recurrences' | 'creneaux' | 'historique';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent implements OnInit {
  @Input() activeView: ViewName = 'calendar';
  @Output() viewChange = new EventEmitter<ViewName>();

  showLogoutConfirm = false;
  nomAffiche = '';
  initiales = '';

  medecin: MedecinResponse | null = null;
  specialites: SpecialiteOption[] = [];

  showEditProfil = false;
  formNom = '';
  formPrenom = '';
  formSpecialite = '';
  formAdresseCabinet = '';
  formTelephone = '';
  formScoreFiabiliteMin: number | null = null;
  isSavingProfil = false;
  editProfilError = '';

  constructor(
    private authService: AuthService,
    private medecinService: MedecinService,
    private router: Router
  ) {
    const user = this.authService.getCurrentUser();
    this.nomAffiche = user?.email ?? 'Médecin';
    this.initiales = (user?.email?.[0] ?? 'D').toUpperCase();
  }

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (!user) {
      return;
    }
    this.medecinService.getByUserId(user.id).subscribe({
      next: (response) => {
        if (response.success) {
          this.medecin = response.data;
          this.nomAffiche = `Dr. ${response.data.prenom} ${response.data.nom}`;
          this.initiales = `${response.data.prenom?.[0] ?? ''}${response.data.nom?.[0] ?? ''}`.toUpperCase();
        }
      },
    });
    this.medecinService.getSpecialites().subscribe({
      next: (response) => {
        if (response.success) {
          this.specialites = response.data;
        }
      },
    });
  }

  specialiteLibelle(valeur: string): string {
    return this.specialites.find((s) => s.valeur === valeur)?.libelle ?? valeur;
  }

  navigate(view: ViewName): void {
    this.viewChange.emit(view);
  }

  askLogout(): void {
    this.showLogoutConfirm = true;
  }

  cancelLogout(): void {
    this.showLogoutConfirm = false;
  }

  confirmLogout(): void {
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }

  ouvrirEditProfil(): void {
    if (!this.medecin) {
      return;
    }
    this.formNom = this.medecin.nom;
    this.formPrenom = this.medecin.prenom;
    this.formSpecialite = this.medecin.specialite;
    this.formAdresseCabinet = this.medecin.adresseCabinet ?? '';
    this.formTelephone = this.medecin.telephone ?? '';
    this.formScoreFiabiliteMin = this.medecin.scoreFiabiliteMin;
    this.editProfilError = '';
    this.showEditProfil = true;
  }

  fermerEditProfil(): void {
    this.showEditProfil = false;
  }

  enregistrerProfil(): void {
    if (!this.formNom.trim() || !this.formPrenom.trim() || !this.formSpecialite.trim()) {
      this.editProfilError = 'Nom, prénom et spécialité sont obligatoires.';
      return;
    }

    this.isSavingProfil = true;
    this.editProfilError = '';
    this.medecinService.updateMonProfil({
      nom: this.formNom.trim(),
      prenom: this.formPrenom.trim(),
      specialite: this.formSpecialite.trim(),
      adresseCabinet: this.formAdresseCabinet.trim() || undefined,
      telephone: this.formTelephone.trim() || undefined,
      scoreFiabiliteMin: this.formScoreFiabiliteMin ?? undefined,
    }).subscribe({
      next: (response) => {
        this.isSavingProfil = false;
        if (response.success) {
          this.medecin = response.data;
          this.nomAffiche = `Dr. ${response.data.prenom} ${response.data.nom}`;
          this.initiales = `${response.data.prenom?.[0] ?? ''}${response.data.nom?.[0] ?? ''}`.toUpperCase();
          this.showEditProfil = false;
        } else {
          this.editProfilError = response.message;
        }
      },
      error: (err) => {
        this.isSavingProfil = false;
        this.editProfilError = err?.error?.message ?? 'Erreur lors de la mise à jour du profil.';
      },
    });
  }
}
