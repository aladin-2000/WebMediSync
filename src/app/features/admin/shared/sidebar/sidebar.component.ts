import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export type AdminPageName = 'medecins';

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class AdminSidebarComponent {
  @Input() activePage: AdminPageName = 'medecins';
  @Output() pageChange = new EventEmitter<AdminPageName>();

  navigate(page: AdminPageName): void {
    this.pageChange.emit(page);
  }
}
