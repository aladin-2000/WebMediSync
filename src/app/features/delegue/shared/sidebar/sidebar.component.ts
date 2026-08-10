import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { DelegueService } from '../../services/delegue.service';
import { DelegueResponse } from '../../models/delegue.model';
import { ModalComponent } from '../modal/modal.component';

// ============================================
// SIDEBAR - Navigation du délégué
// 3 pages: Recherche, Planning, Historique
// ============================================

export type PageName = 'search' | 'planning' | 'history';

@Component({
  selector: 'app-delegue-sidebar',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent implements OnInit {
  // Page actuellement active
  @Input() activePage: PageName = 'search';

  // Quand l'utilisateur clique sur une nav item
  @Output() pageChange = new EventEmitter<PageName>();

  nomComplet = '';
  initiales = '';
  score: number | null = null;
  showLogoutConfirm = false;

  delegue: DelegueResponse | null = null;

  showEditProfil = false;
  formNom = '';
  formPrenom = '';
  formTelephone = '';
  isSavingProfil = false;
  editProfilError = '';

  constructor(
    private authService: AuthService,
    private delegueService: DelegueService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    this.nomComplet = user?.email ?? '';
    this.initiales = (user?.email?.[0] ?? '?').toUpperCase();

    if (user) {
      this.delegueService.getByUserId(user.id).subscribe({
        next: (response) => {
          if (response.success) {
            this.delegue = response.data;
            this.nomComplet = `${response.data.prenom} ${response.data.nom}`;
            this.initiales = `${response.data.prenom?.[0] ?? ''}${response.data.nom?.[0] ?? ''}`.toUpperCase();
            this.score = response.data.scoreFiabilite;
          }
        },
      });
    }
  }

  // Méthode pour naviguer
  navigate(page: PageName): void {
    this.pageChange.emit(page);
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
    if (!this.delegue) {
      return;
    }
    this.formNom = this.delegue.nom;
    this.formPrenom = this.delegue.prenom;
    this.formTelephone = this.delegue.telephone ?? '';
    this.editProfilError = '';
    this.showEditProfil = true;
  }

  fermerEditProfil(): void {
    this.showEditProfil = false;
  }

  enregistrerProfil(): void {
    if (!this.formNom.trim() || !this.formPrenom.trim()) {
      this.editProfilError = 'Nom et prénom sont obligatoires.';
      return;
    }

    this.isSavingProfil = true;
    this.editProfilError = '';
    this.delegueService.updateMonProfil({
      nom: this.formNom.trim(),
      prenom: this.formPrenom.trim(),
      telephone: this.formTelephone.trim() || undefined,
    }).subscribe({
      next: (response) => {
        this.isSavingProfil = false;
        if (response.success) {
          this.delegue = response.data;
          this.nomComplet = `${response.data.prenom} ${response.data.nom}`;
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
