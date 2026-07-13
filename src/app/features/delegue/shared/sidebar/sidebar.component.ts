import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

// ============================================
// SIDEBAR - Navigation du délégué
// 3 pages: Recherche, Planning, Historique
// ============================================

export type PageName = 'search' | 'planning' | 'history';

@Component({
  selector: 'app-delegue-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent {
  // Page actuellement active
  @Input() activePage: PageName = 'search';

  // Quand l'utilisateur clique sur une nav item
  @Output() pageChange = new EventEmitter<PageName>();

  // Méthode pour naviguer
  navigate(page: PageName): void {
    this.pageChange.emit(page);
  }
}
