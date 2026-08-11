import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { LaboratoireService } from '../../../../core/services/laboratoire.service';
import { ModalComponent } from '../../../delegue/shared/modal/modal.component';

export type LaboPageName = 'home' | 'delegues';

@Component({
  selector: 'app-labo-sidebar',
  standalone: true,
  imports: [CommonModule, ModalComponent],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent implements OnInit {
  @Input() activePage: LaboPageName = 'home';
  @Output() pageChange = new EventEmitter<LaboPageName>();

  nomLabo = '';
  initiales = '';
  showLogoutConfirm = false;

  constructor(
    private authService: AuthService,
    private laboratoireService: LaboratoireService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    this.nomLabo = user?.email ?? '';
    this.initiales = (user?.email?.[0] ?? '?').toUpperCase();

    if (user) {
      this.laboratoireService.getByUserId(user.id).subscribe({
        next: (response) => {
          if (response.success) {
            this.nomLabo = response.data.nom;
            this.initiales = response.data.nom?.[0]?.toUpperCase() ?? '?';
          }
        },
      });
    }
  }

  navigate(page: LaboPageName): void {
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
