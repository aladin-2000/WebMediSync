import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { DelegueService } from '../../services/delegue.service';
import { ModalComponent } from '../modal/modal.component';

// ============================================
// SIDEBAR - Navigation du délégué
// 3 pages: Recherche, Planning, Historique
// ============================================

export type PageName = 'search' | 'planning' | 'history';

@Component({
  selector: 'app-delegue-sidebar',
  standalone: true,
  imports: [CommonModule, ModalComponent],
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
}
