import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminSidebarComponent, AdminPageName } from './shared/sidebar/sidebar.component';
import { MedecinsComponent } from './medecins/medecins.component';
import { ValidationsComponent } from './validations/validations.component';
import { LaboratoiresComponent } from './laboratoires/laboratoires.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, AdminSidebarComponent, MedecinsComponent, ValidationsComponent, LaboratoiresComponent],
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.css'],
})
export class AdminLayoutComponent {
  activePage: AdminPageName = 'medecins';

  onPageChange(page: any): void {
    this.activePage = page as AdminPageName;
  }
}