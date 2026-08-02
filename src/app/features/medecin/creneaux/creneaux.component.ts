import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CreneauResponse } from '../models/disponibilite.models';
import { CreneauService } from '../services/creneau.service';
import { AuthService } from '../../../core/services/auth.service';
import { MedecinService } from '../../admin/services/medecin.service';

interface CreneauSemaine {
  heure: string;
  statut: 'reserve' | 'libre';
}

interface JourSemaineView {
  label: string;
  creneaux: CreneauSemaine[];
}

const JOURS_LABELS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const MOIS_ABBR = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];

@Component({
  selector: 'app-creneaux',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './creneaux.component.html',
  styleUrls: ['./creneaux.component.css'],
})
export class CreneauxComponent implements OnInit {
  semaine: JourSemaineView[] = [];
  weekOffset = 0;
  isLoading = false;
  error = '';

  constructor(
    private creneauService: CreneauService,
    private authService: AuthService,
    private medecinService: MedecinService
  ) {}

  ngOnInit(): void {
    this.chargerSemaine();
  }

  get currentWeekLabel(): string {
    const { lundi, samedi } = this.bornesSemaine();
    return `Semaine du ${this.formatCourt(lundi)} au ${this.formatCourt(samedi)}`;
  }

  changeWeek(dir: number): void {
    this.weekOffset += dir;
    this.chargerSemaine();
  }

  private bornesSemaine(): { lundi: Date; samedi: Date } {
    const today = new Date();
    const jourSemaine = (today.getDay() + 6) % 7; // 0 = lundi
    const lundi = new Date(today.getFullYear(), today.getMonth(), today.getDate() - jourSemaine + this.weekOffset * 7);
    const samedi = new Date(lundi.getFullYear(), lundi.getMonth(), lundi.getDate() + 5);
    return { lundi, samedi };
  }

  private toISO(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  private formatCourt(date: Date): string {
    return `${date.getDate()} ${MOIS_ABBR[date.getMonth()]}`;
  }

  private chargerSemaine(): void {
    const medecinId = this.authService.getMedecinId();
    if (!medecinId) {
      this.resoudreMedecinId();
      return;
    }
    this.chargerAvecMedecinId(medecinId);
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

  private chargerAvecMedecinId(medecinId: string): void {
    const { lundi, samedi } = this.bornesSemaine();
    this.isLoading = true;
    this.error = '';
    this.creneauService.getPeriode(medecinId, this.toISO(lundi), this.toISO(samedi)).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.semaine = this.construireSemaine(lundi, response.data);
        } else {
          this.error = response.message;
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.error = err?.error?.message ?? 'Erreur lors du chargement des créneaux.';
      },
    });
  }

  private construireSemaine(lundi: Date, creneaux: CreneauResponse[]): JourSemaineView[] {
    return JOURS_LABELS.map((label, i) => {
      const jour = new Date(lundi.getFullYear(), lundi.getMonth(), lundi.getDate() + i);
      const jourISO = this.toISO(jour);
      const creneauxDuJour = creneaux
        .filter((c) => c.date === jourISO && c.statut !== 'ANNULE')
        .sort((a, b) => a.heureDebut.localeCompare(b.heureDebut))
        .map((c) => ({
          heure: this.formatHeure(c.heureDebut),
          statut: (c.statut === 'RESERVE' ? 'reserve' : 'libre') as 'reserve' | 'libre',
        }));
      return { label: `${label} ${this.formatCourt(jour)}`, creneaux: creneauxDuJour };
    });
  }

  private formatHeure(heure: string): string {
    const [h, m] = heure.split(':');
    return `${h}h${m}`;
  }
}
