import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RendezVousService } from '../../delegue/services/rendezvous.service';
import { RendezVousMedecinEnrichmentService } from '../services/rendezvous-medecin-enrichment.service';
import { RendezVousMedecinEnrichi } from '../models/rendezvous-medecin-enrichi.model';
import { AuthService } from '../../../core/services/auth.service';
import { MedecinService } from '../../admin/services/medecin.service';
import { NotificationService } from '../../../core/services/notification.service';
import { NotificationResponse } from '../../../core/models/notification.model';
import { toISODate, lundiDeLaSemaine, dimancheDeLaSemaine } from '../../delegue/shared/semaine.util';
import { MONTHS, DAYS_LABELS_LONG } from '../shared/date-labels.constants';

@Component({
  selector: 'app-medecin-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  @Output() navigateTo = new EventEmitter<string>();

  today = new Date();
  nomAffiche = '';
  isLoading = false;
  error = '';

  rendezvousSemaine: RendezVousMedecinEnrichi[] = [];
  notifications: NotificationResponse[] = [];

  constructor(
    private rendezVousService: RendezVousService,
    private enrichmentService: RendezVousMedecinEnrichmentService,
    private authService: AuthService,
    private medecinService: MedecinService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    this.nomAffiche = user?.email ?? 'Médecin';
    if (user) {
      this.medecinService.getByUserId(user.id).subscribe({
        next: (response) => {
          if (response.success) {
            this.nomAffiche = `Dr. ${response.data.prenom} ${response.data.nom}`;
          }
        },
      });
    }
    this.chargerSemaine();
    this.chargerNotifications();
  }

  get todayLabel(): string {
    return `${DAYS_LABELS_LONG[this.today.getDay()]} ${this.today.getDate()} ${MONTHS[this.today.getMonth()]} ${this.today.getFullYear()}`;
  }

  get rendezvousAujourdhui(): RendezVousMedecinEnrichi[] {
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

  get totalAbsencesSemaine(): number {
    return this.rendezvousSemaine.filter((r) => r.statut === 'ABSENT_MEDECIN' || r.statut === 'ABSENT_DELEGUE').length;
  }

  get unreadNotifCount(): number {
    return this.notifications.filter((n) => !n.isRead).length;
  }

  get dernieresNotifications(): NotificationResponse[] {
    return this.notifications.slice(0, 4);
  }

  chargerSemaine(): void {
    const medecinId = this.authService.getMedecinId();
    if (!medecinId) {
      this.resoudreMedecinId();
      return;
    }

    this.isLoading = true;
    this.error = '';
    const semaine = toISODate(this.today);
    const dateDebut = toISODate(lundiDeLaSemaine(this.today));
    const dateFin = toISODate(dimancheDeLaSemaine(this.today));

    this.rendezVousService.listeMedecinSemaine(medecinId, semaine).subscribe({
      next: (response) => {
        if (!response.success) {
          this.isLoading = false;
          this.error = response.message;
          return;
        }
        this.enrichmentService.enrichir(response.data, medecinId, dateDebut, dateFin).subscribe({
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

  private resoudreMedecinId(): void {
    const user = this.authService.getCurrentUser();
    if (!user) {
      return;
    }
    this.isLoading = true;
    this.medecinService.getByUserId(user.id).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.authService.setMedecinId(response.data.id);
          this.nomAffiche = `Dr. ${response.data.prenom} ${response.data.nom}`;
          this.chargerSemaine();
        } else {
          this.error = response.message;
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.error = err?.error?.message ?? 'Impossible de récupérer votre profil médecin.';
      },
    });
  }

  refresh(): void {
    this.chargerSemaine();
    this.chargerNotifications();
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

  delegueLabel(rdv: RendezVousMedecinEnrichi): string {
    if (rdv.delegueNom || rdv.deleguePrenom) {
      return `${rdv.deleguePrenom} ${rdv.delegueNom}`.trim();
    }
    return `Délégué #${rdv.delegueId.slice(0, 8)}`;
  }

  laboratoireLabel(rdv: RendezVousMedecinEnrichi): string {
    return rdv.laboratoireNom || '';
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

  go(view: string): void {
    this.navigateTo.emit(view);
  }
}
