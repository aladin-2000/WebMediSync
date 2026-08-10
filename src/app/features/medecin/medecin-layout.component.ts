import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from './shared/sidebar/sidebar.component';
import { HomeComponent } from './home/home.component';
import { CalendarComponent } from './calendar/calendar.component';
import { CreneauxComponent } from './creneaux/creneaux.component';
import { HistoriqueComponent } from './historique/historique.component';
import { NotificationsComponent } from './notifications/notifications.component';

export type ViewName = 'home' | 'calendar' | 'recurrences' | 'creneaux' | 'historique' | 'notifications';

@Component({
  selector: 'app-medecin-layout',
  standalone: true,
  imports: [CommonModule, SidebarComponent, HomeComponent, CalendarComponent, CreneauxComponent, HistoriqueComponent, NotificationsComponent],
  templateUrl: './medecin-layout.component.html',
  styleUrls: ['./medecin-layout.component.css'],
})
export class MedecinLayoutComponent {
  activeView: ViewName = 'home';

  onViewChange(view: any): void {
    this.activeView = view as ViewName;
  }
}