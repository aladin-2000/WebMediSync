import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { MedecinService } from '../../services/medecin.service';
import { ModalComponent } from '../../../medecin/shared/modal/modal.component';
import { NotesEquipeService } from '../../../../shared/notes-equipe/notes-equipe.service';

export type AdminPageName = 'medecins' | 'agenda-medecins' | 'validations' | 'laboratoires' | 'etablissements' | 'delegues' | 'gestion-delegues' | 'statistiques' | 'utilisateurs' | 'notes-equipe';

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [CommonModule, ModalComponent],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class AdminSidebarComponent implements OnInit {
  @Input() activePage: AdminPageName = 'medecins';
  @Output() pageChange = new EventEmitter<AdminPageName>();

  showLogoutConfirm = false;
  nombreEnAttente = 0;
  nombreNotesATraiter = 0;

  /** Mis à jour par la page « Notes des utilisateurs » quand l'admin traite une note. */
  @Input() set notesATraiter(valeur: number | null) {
    if (valeur !== null) {
      this.nombreNotesATraiter = valeur;
    }
  }
  deleguesMenuOpen = false;
  medecinsMenuOpen = false;
  mobileOpen = false;

  constructor(
    private authService: AuthService,
    private medecinService: MedecinService,
    private notesService: NotesEquipeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.notesService.toutes().subscribe({
      next: (response) => {
        if (response.success) {
          this.nombreNotesATraiter = response.data.filter((n) => !n.traitee).length;
        }
      },
    });
    this.medecinService.getEnAttente().subscribe({
      next: (response) => {
        if (response.success) {
          this.nombreEnAttente = response.data.length;
        }
      },
    });
  }

  get isMedecinsPage(): boolean {
    return this.activePage === 'medecins' || this.activePage === 'validations' || this.activePage === 'agenda-medecins';
  }

  get isDeleguesPage(): boolean {
    return this.activePage === 'delegues' || this.activePage === 'gestion-delegues';
  }

  toggleMedecinsMenu(): void {
    this.medecinsMenuOpen = !this.medecinsMenuOpen;
  }

  toggleDeleguesMenu(): void {
    this.deleguesMenuOpen = !this.deleguesMenuOpen;
  }

  toggleMobileMenu(): void {
    this.mobileOpen = !this.mobileOpen;
  }

  closeMobileMenu(): void {
    this.mobileOpen = false;
  }

  navigate(page: AdminPageName): void {
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
}
