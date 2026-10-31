import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { MedecinService } from '../../services/medecin.service';
import { ModalComponent } from '../../../medecin/shared/modal/modal.component';

export type AdminPageName = 'medecins' | 'validations' | 'laboratoires' | 'delegues' | 'gestion-delegues' | 'statistiques' | 'utilisateurs';

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
  deleguesMenuOpen = false;
  medecinsMenuOpen = false;

  constructor(
    private authService: AuthService,
    private medecinService: MedecinService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.medecinService.getEnAttente().subscribe({
      next: (response) => {
        if (response.success) {
          this.nombreEnAttente = response.data.length;
        }
      },
    });
  }

  get isMedecinsPage(): boolean {
    return this.activePage === 'medecins' || this.activePage === 'validations';
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
