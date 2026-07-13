import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from './features/disponibilites/shared/sidebar/sidebar.component';
import { CalendarComponent } from './features/disponibilites/calendar/calendar.component';
import { CreneauxComponent } from './features/disponibilites/creneaux/creneaux.component';
import { StatsComponent } from './features/disponibilites/stats/stats.component';
import { AuthComponent } from './features/auth/auth.component';
import { AuthService } from './core/services/auth.service';

import { SidebarComponent as DelegueSidebarComponent } from './features/delegue/shared/sidebar/sidebar.component';
import { SearchComponent } from './features/delegue/features/search/search.component';
import { PlanningComponent } from './features/delegue/features/planning/planning.component';
import { HistoryComponent } from './features/delegue/features/history/history.component';

export type ViewName = 'calendar' | 'recurrences' | 'creneaux' | 'stats';
export type DeleguePageName = 'search' | 'planning' | 'history';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    SidebarComponent,
    CalendarComponent,
    CreneauxComponent,
    StatsComponent,
    AuthComponent,
    DelegueSidebarComponent,
    SearchComponent,
    PlanningComponent,
    HistoryComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  activeView = signal<ViewName>('calendar');
  activeDelegueView = signal<DeleguePageName>('search');

  constructor(public authService: AuthService) {}

  get isLoggedIn(): boolean {
    return this.authService.isAuthenticated();
  }

  onViewChange(view: any): void {
    this.activeView.set(view as ViewName);
  }

  onDelegueViewChange(view: any): void {
    this.activeDelegueView.set(view as DeleguePageName);
  }

  getTopbarTitle(): string {
    const titles: Record<ViewName, string> = {
      calendar: 'Mes disponibilités — Juillet 2025',
      recurrences: 'Règles de récurrence',
      creneaux: 'Mes créneaux',
      stats: 'Statistiques',
    };
    return titles[this.activeView()];
  }
}
