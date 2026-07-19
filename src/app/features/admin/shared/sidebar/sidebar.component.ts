import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { ModalComponent } from '../../../disponibilites/shared/modal/modal.component';

export type AdminPageName = 'medecins';

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [CommonModule, ModalComponent],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class AdminSidebarComponent {
  @Input() activePage: AdminPageName = 'medecins';
  @Output() pageChange = new EventEmitter<AdminPageName>();

  showLogoutConfirm = false;

  constructor(private authService: AuthService, private router: Router) {}

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
