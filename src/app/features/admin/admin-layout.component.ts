import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminSidebarComponent, AdminPageName } from './shared/sidebar/sidebar.component';
import { MedecinsComponent } from './medecins/medecins.component';
import { ValidationsComponent } from './validations/validations.component';
import { LaboratoiresComponent } from './laboratoires/laboratoires.component';
import { StatistiquesComponent } from './statistiques/statistiques.component';
import { UtilisateursComponent } from './utilisateurs/utilisateurs.component';
import { AdminDeleguesComponent } from './delegues/delegues.component';
import { GestionDeleguesComponent } from './gestion-delegues/gestion-delegues.component';
import { EtablissementsComponent } from './etablissements/etablissements.component';
import { AgendaMedecinsComponent } from './agenda-medecins/agenda-medecins.component';
import { AdminNotesEquipeComponent } from './notes-equipe/admin-notes-equipe.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, AdminSidebarComponent, MedecinsComponent, ValidationsComponent, LaboratoiresComponent, StatistiquesComponent, UtilisateursComponent, AdminDeleguesComponent, GestionDeleguesComponent, EtablissementsComponent, AgendaMedecinsComponent, AdminNotesEquipeComponent],
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.css'],
})
export class AdminLayoutComponent {
  activePage: AdminPageName = 'medecins';
  /** Compteur de notes à traiter, remonté par la page des notes vers la sidebar. */
  notesATraiter: number | null = null;

  onPageChange(page: any): void {
    this.activePage = page as AdminPageName;
  }
}