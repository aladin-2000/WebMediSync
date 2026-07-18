import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminSidebarComponent, AdminPageName } from './shared/sidebar/sidebar.component';
import { MedecinsComponent } from './medecins/medecins.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, AdminSidebarComponent, MedecinsComponent],
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.css'],
})
export class AdminLayoutComponent {
  activePage = signal<AdminPageName>('medecins');

  onPageChange(page: any): void {
    this.activePage.set(page as AdminPageName);
  }
}
