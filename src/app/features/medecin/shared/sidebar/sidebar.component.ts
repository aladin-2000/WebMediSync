import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { NotificationResponse } from '../../../../core/models/notification.model';
import { MedecinService } from '../../../admin/services/medecin.service';
import { MedecinResponse, RegionOption, SpecialiteOption } from '../../../admin/models/medecin.model';
import { ModalComponent } from '../modal/modal.component';

export type ViewName = 'home' | 'calendar' | 'recurrences' | 'creneaux' | 'historique' | 'notifications';

const NOTIF_POLL_INTERVAL_MS = 30000;

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent implements OnInit, OnDestroy {
  @Input() activeView: ViewName = 'calendar';
  @Output() viewChange = new EventEmitter<ViewName>();

  showLogoutConfirm = false;
  nomAffiche = '';
  initiales = '';

  medecin: MedecinResponse | null = null;
  specialites: SpecialiteOption[] = [];
  regions: RegionOption[] = [];

  showEditProfil = false;
  formNom = '';
  formPrenom = '';
  formSpecialite = '';
  formAdresseCabinet = '';
  formRegionId = '';
  formTelephone = '';
  formScoreFiabiliteMin: number | null = null;
  isSavingProfil = false;
  editProfilError = '';

  notifications: NotificationResponse[] = [];
  unreadCount = 0;
  private notifPollHandle: ReturnType<typeof setInterval> | null = null;

  // Tiroir mobile : sidebar masquée par défaut sous 768px, ouverte via le bouton hamburger
  mobileOpen = false;

  constructor(
    private authService: AuthService,
    private medecinService: MedecinService,
    private notificationService: NotificationService,
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
    this.medecinService.getRegions().subscribe({
      next: (response) => {
        if (response.success) {
          this.regions = response.data;
        }
      },
    });

    this.loadNotifications();
    this.notifPollHandle = setInterval(() => this.loadNotifications(), NOTIF_POLL_INTERVAL_MS);
  }

  ngOnDestroy(): void {
    if (this.notifPollHandle) {
      clearInterval(this.notifPollHandle);
    }
  }

  loadNotifications(): void {
    this.notificationService.getMesNotifications().subscribe({
      next: (response) => {
        if (response.success) {
          this.notifications = response.data;
          this.unreadCount = response.data.filter((n) => !n.isRead).length;
        }
      },
    });
  }


  specialiteLibelle(valeur: string): string {
    return this.specialites.find((s) => s.valeur === valeur)?.libelle ?? valeur;
  }

  navigate(view: ViewName): void {
    this.viewChange.emit(view);
    this.closeMobileMenu();
  }

  toggleMobileMenu(): void {
    this.mobileOpen = !this.mobileOpen;
  }

  closeMobileMenu(): void {
    this.mobileOpen = false;
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
    this.formRegionId = this.medecin.regionId ?? '';
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
      regionId: this.formRegionId || undefined,
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
