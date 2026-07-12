import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from './features/disponibilites/shared/sidebar/sidebar.component';
import { CalendarComponent } from './features/disponibilites/calendar/calendar.component';
import { CreneauxComponent } from './features/disponibilites/creneaux/creneaux.component';
import { StatsComponent } from './features/disponibilites/stats/stats.component';
import { AuthComponent } from './features/auth/auth.component';
import { AuthService } from './core/services/auth.service';

export type ViewName = 'calendar' | 'recurrences' | 'creneaux' | 'stats';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    SidebarComponent,
    CalendarComponent,
    CreneauxComponent,
    StatsComponent,
    AuthComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  activeView = signal<ViewName>('calendar');

  constructor(public authService: AuthService) {}

  get isLoggedIn(): boolean {
    return this.authService.isAuthenticated();
  }

  onViewChange(view: any): void {
    this.activeView.set(view as ViewName);
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
