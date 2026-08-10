import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from './shared/sidebar/sidebar.component';
import { CalendarComponent } from './calendar/calendar.component';
import { CreneauxComponent } from './creneaux/creneaux.component';
import { HistoriqueComponent } from './historique/historique.component';

export type ViewName = 'calendar' | 'recurrences' | 'creneaux' | 'historique';

@Component({
  selector: 'app-medecin-layout',
  standalone: true,
  imports: [CommonModule, SidebarComponent, CalendarComponent, CreneauxComponent, HistoriqueComponent],
  templateUrl: './medecin-layout.component.html',
  styleUrls: ['./medecin-layout.component.css'],
})
export class MedecinLayoutComponent {
  activeView: ViewName = 'calendar';

  onViewChange(view: any): void {
    this.activeView = view as ViewName;
  }
}