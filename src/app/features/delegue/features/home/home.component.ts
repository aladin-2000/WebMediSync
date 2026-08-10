import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RendezVousService } from '../../services/rendezvous.service';
import { RendezVousEnrichmentService } from '../../services/rendezvous-enrichment.service';
import { RendezVousEnrichi } from '../../models/rendezvous-enrichi.model';
import { AuthService } from '../../../../core/services/auth.service';
import { DelegueService } from '../../services/delegue.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { NotificationResponse } from '../../../../core/models/notification.model';
import { toISODate, lundiDeLaSemaine, dimancheDeLaSemaine } from '../../shared/semaine.util';

const MONTHS = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
];

@Component({
  selector: 'app-delegue-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  @Output() navigateTo = new EventEmitter<string>();

  today = new Date();
  nomComplet = '';
  score: number | null = null;
  isLoading = false;
  error = '';

  rendezvousSemaine: RendezVousEnrichi[] = [];
  notifications: NotificationResponse[] = [];

  constructor(
    private rendezVousService: RendezVousService,
    private enrichmentService: RendezVousEnrichmentService,
    private authService: AuthService,
    private delegueService: DelegueService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    this.nomComplet = user?.email ?? '';
    if (user) {
      this.delegueService.getByUserId(user.id).subscribe({
        next: (response) => {
          if (response.success) {
            this.nomComplet = `${response.data.prenom} ${response.data.nom}`;
            this.score = response.data.scoreFiabilite;
          }
        },
      });
    }
    this.chargerSemaine();
    this.chargerNotifications();
  }

  get todayLabel(): string {
    const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    return `${days[this.today.getDay()]} ${this.today.getDate()} ${MONTHS[this.today.getMonth()]} ${this.today.getFullYear()}`;
  }

  get rendezvousAujourdhui(): RendezVousEnrichi[] {
    const todayISO = toISODate(this.today);
    return this.rendezvousSemaine
      .filter((r) => r.date === todayISO && r.statut !== 'ANNULE')
      .sort((a, b) => a.heureDebut.localeCompare(b.heureDebut));
  }

  get totalAujourdhui(): number {
    return this.rendezvousAujourdhui.length;
  }

  get totalSemaine(): number {
    return this.rendezvousSemaine.filter((r) => r.statut !== 'ANNULE').length;
  }

  get totalRealisesSemaine(): number {
    return this.rendezvousSemaine.filter((r) => r.statut === 'REALISE').length;
  }

  get totalAnnulesSemaine(): number {
    return this.rendezvousSemaine.filter((r) => r.statut === 'ANNULE').length;
  }

  get unreadNotifCount(): number {
    return this.notifications.filter((n) => !n.isRead).length;
  }

  get dernieresNotifications(): NotificationResponse[] {
    return this.notifications.slice(0, 4);
  }

  chargerSemaine(): void {
    const delegueId = this.authService.getDelegueId();
    if (!delegueId) {
      this.resoudreDelegueId();
      return;
    }

    this.isLoading = true;
    this.error = '';
    const semaine = toISODate(this.today);
    const dateDebut = toISODate(lundiDeLaSemaine(this.today));
    const dateFin = toISODate(dimancheDeLaSemaine(this.today));

    this.rendezVousService.listeSemaine(delegueId, semaine).subscribe({
      next: (response) => {
        if (!response.success) {
          this.isLoading = false;
          this.error = response.message;
          return;
        }
        this.enrichmentService.enrichir(response.data, dateDebut, dateFin).subscribe({
          next: (enrichis) => {
            this.isLoading = false;
            this.rendezvousSemaine = enrichis;
          },
          error: () => {
            this.isLoading = false;
            this.error = 'Erreur lors du chargement des rendez-vous.';
          },
        });
      },
      error: (err) => {
        this.isLoading = false;
        this.error = err?.error?.message ?? 'Erreur lors du chargement des rendez-vous.';
      },
    });
  }

  private resoudreDelegueId(): void {
    const user = this.authService.getCurrentUser();
    if (!user) {
      return;
    }
    this.isLoading = true;
    this.delegueService.getByUserId(user.id).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.authService.setDelegueId(response.data.id);
          this.nomComplet = `${response.data.prenom} ${response.data.nom}`;
          this.score = response.data.scoreFiabilite;
          this.chargerSemaine();
        } else {
          this.error = response.message;
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.error = err?.error?.message ?? 'Impossible de récupérer votre profil délégué.';
      },
    });
  }

  chargerNotifications(): void {
    this.notificationService.getMesNotifications().subscribe({
      next: (response) => {
        if (response.success) {
          this.notifications = response.data;
        }
      },
    });
  }

  formatHeure(heure: string): string {
    return heure ? heure.slice(0, 5) : '';
  }

  medecinLabel(rdv: RendezVousEnrichi): string {
    if (rdv.medecinNom || rdv.medecinPrenom) {
      return `Dr ${rdv.medecinPrenom} ${rdv.medecinNom}`.trim();
    }
    return `Médecin #${rdv.medecinId.slice(0, 8)}`;
  }

  notifIcon(type: NotificationResponse['type']): string {
    switch (type) {
      case 'REALISATION':
        return 'ti-circle-check';
      case 'ANNULATION':
        return 'ti-circle-x';
      case 'ABSENCE':
        return 'ti-user-off';
      case 'CONFLIT':
        return 'ti-alert-triangle';
      case 'RESERVATION':
        return 'ti-calendar-plus';
      case 'PROPOSITION':
        return 'ti-replace';
      default:
        return 'ti-bell';
    }
  }

  go(page: string): void {
    this.navigateTo.emit(page);
  }
}
