import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from './shared/sidebar/sidebar.component';
import { HomeComponent } from './features/home/home.component';
import { SearchComponent } from './features/search/search.component';
import { PlanningComponent } from './features/planning/planning.component';
import { HistoryComponent } from './features/history/history.component';
import { NotificationsComponent } from './features/notifications/notifications.component';

export type DeleguePageName = 'home' | 'search' | 'planning' | 'history' | 'notifications';

@Component({
  selector: 'app-delegue-layout',
  standalone: true,
  imports: [CommonModule, SidebarComponent, HomeComponent, SearchComponent, PlanningComponent, HistoryComponent, NotificationsComponent],
  templateUrl: './delegue-layout.component.html',
  styleUrls: ['./delegue-layout.component.css'],
})
export class DelegueLayoutComponent {
  activePage: DeleguePageName = 'home';

  onPageChange(page: any): void {
    this.activePage = page as DeleguePageName;
  }
}