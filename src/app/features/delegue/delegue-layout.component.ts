import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from './shared/sidebar/sidebar.component';
import { SearchComponent } from './features/search/search.component';
import { PlanningComponent } from './features/planning/planning.component';
import { HistoryComponent } from './features/history/history.component';

export type DeleguePageName = 'search' | 'planning' | 'history';

@Component({
  selector: 'app-delegue-layout',
  standalone: true,
  imports: [CommonModule, SidebarComponent, SearchComponent, PlanningComponent, HistoryComponent],
  templateUrl: './delegue-layout.component.html',
  styleUrls: ['./delegue-layout.component.css'],
})
export class DelegueLayoutComponent {
  activePage: DeleguePageName = 'search';

  onPageChange(page: any): void {
    this.activePage = page as DeleguePageName;
  }
}