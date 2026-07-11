import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ViewName = 'calendar' | 'recurrences' | 'creneaux' | 'stats';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent {
  @Input() activeView: ViewName = 'calendar';
  @Output() viewChange = new EventEmitter<ViewName>();

  navigate(view: ViewName): void {
    this.viewChange.emit(view);
  }
}
