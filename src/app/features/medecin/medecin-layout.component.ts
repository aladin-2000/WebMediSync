import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../disponibilites/shared/sidebar/sidebar.component';
import { CalendarComponent } from '../disponibilites/calendar/calendar.component';
import { CreneauxComponent } from '../disponibilites/creneaux/creneaux.component';
import { StatsComponent } from '../disponibilites/stats/stats.component';

export type ViewName = 'calendar' | 'recurrences' | 'creneaux' | 'stats';

@Component({
  selector: 'app-medecin-layout',
  standalone: true,
  imports: [CommonModule, SidebarComponent, CalendarComponent, CreneauxComponent, StatsComponent],
  templateUrl: './medecin-layout.component.html',
  styleUrls: ['./medecin-layout.component.css'],
})
export class MedecinLayoutComponent {
  activeView: ViewName = 'calendar';

  onViewChange(view: any): void {
    this.activeView = view as ViewName;
  }
}