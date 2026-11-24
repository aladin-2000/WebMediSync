import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, map, of, switchMap } from 'rxjs';
import { MedecinService } from '../services/medecin.service';
import { MedecinResponse, SpecialiteOption } from '../models/medecin.model';
import { CreneauService } from '../../medecin/services/creneau.service';
import { CreneauResponse, CreneauStatsMedecin } from '../../medecin/models/disponibilite.models';
import { PaginationComponent } from '../shared/pagination/pagination.component';
import { RendezVousService } from '../../delegue/services/rendezvous.service';
import { RendezVousMedecinEnrichmentService } from '../../medecin/services/rendezvous-medecin-enrichment.service';
import { RendezVousMedecinEnrichi } from '../../medecin/models/rendezvous-medecin-enrichi.model';
import { DAYS_LABELS, DAYS_LABELS_LONG, MONTHS } from '../../medecin/shared/date-labels.constants';
import { PhonePipe } from '../../../shared/phone/phone.pipe';

interface AgendaCell {
  day: number;
  key: string;
  isToday: boolean;
  isPast: boolean;
  libres: number;
  reserves: number;
  annules: number;
}

interface CreneauAvecRdv extends CreneauResponse {
  rdvs: RendezVousMedecinEnrichi[];
}

type FiltreJour = 'tous' | 'libres' | 'reserves';

interface LigneMedecin {
  medecin: MedecinResponse;
  stats: CreneauStatsMedecin;
}

const STATUT_RDV_LIBELLES: Record<string, string> = {
  RESERVE: 'Réservé',
  ANNULE: 'Annulé',
  REALISE: 'Réalisé',
  ABSENT_MEDECIN: 'Médecin absent',
  ABSENT_DELEGUE: 'Délégué absent',
  CONFLIT: 'Conflit',
};

function normaliser(s: string | null | undefined): string {
  return (s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

@Component({
  selector: 'app-admin-agenda-medecins',
  standalone: true,
  imports: [CommonModule, FormsModule, PhonePipe, PaginationComponent],
  templateUrl: './agenda-medecins.component.html',
  styleUrls: ['./agenda-medecins.component.css'],
})
export class AgendaMedecinsComponent implements OnInit {
  readonly daysLabels = DAYS_LABELS;

  // ── Sélection du médecin ──
  medecins: MedecinResponse[] = [];
  specialites: SpecialiteOption[] = [];
  recherche = '';
  listeOuverte = false;
  medecin: MedecinResponse | null = null;
  isLoadingMedecins = false;

  // ── Tableau des médecins ayant publié des créneaux ──
  private statsParMedecin = new Map<string, CreneauStatsMedecin>();
  lignes: LigneMedecin[] = [];
  filtreTableau = '';
  isLoadingStats = false;
  statsError = '';
  readonly pageSize = 10;
  currentPage = 0;

  // ── Agenda ──
  currentDate = new Date();
  creneaux: CreneauAvecRdv[] = [];
  cells: (AgendaCell | null)[] = [];
  stats = { total: 0, libres: 0, reserves: 0, annules: 0, taux: 0 };
  selectedKey = '';
  filtre: FiltreJour = 'tous';
  isLoading = false;
  errorMessage = '';

  constructor(
    private medecinService: MedecinService,
    private creneauService: CreneauService,
    private rendezVousService: RendezVousService,
    private enrichmentService: RendezVousMedecinEnrichmentService,
  ) {}

  ngOnInit(): void {
    this.isLoadingMedecins = true;
    this.medecinService.getAll().subscribe({
      next: (res) => {
        this.isLoadingMedecins = false;
        if (res.success) {
          this.medecins = [...res.data].sort((a, b) =>
            `${a.nom} ${a.prenom}`.localeCompare(`${b.nom} ${b.prenom}`, 'fr'));
          this.construireLignes();
        }
      },
      error: () => {
        this.isLoadingMedecins = false;
        this.errorMessage = 'Impossible de charger la liste des médecins.';
      },
    });
    this.chargerStats();
    this.medecinService.getSpecialites().subscribe({
      next: (res) => { if (res.success) this.specialites = res.data; },
    });
  }

  // ── Tableau des médecins ayant publié des créneaux ──

  private chargerStats(): void {
    this.isLoadingStats = true;
    this.statsError = '';
    this.creneauService.getStatsParMedecin().subscribe({
      next: (res) => {
        this.isLoadingStats = false;
        if (res.success) {
          this.statsParMedecin = new Map(res.data.map((s) => [s.medecinId, s]));
          this.construireLignes();
        } else {
          this.statsError = res.message;
        }
      },
      error: (err) => {
        this.isLoadingStats = false;
        this.statsError = err?.error?.message ?? 'Impossible de charger les médecins ayant publié des créneaux.';
      },
    });
  }

  /** Joint les stats aux médecins ; tri : prochain créneau le plus proche, puis nom. */
  private construireLignes(): void {
    this.lignes = this.medecins
      .map((medecin) => ({ medecin, stats: this.statsParMedecin.get(medecin.id) }))
      .filter((l): l is LigneMedecin => !!l.stats && l.stats.total > 0)
      .sort((a, b) => {
        const pa = a.stats.prochainCreneau ?? '9999-12-31';
        const pb = b.stats.prochainCreneau ?? '9999-12-31';
        return pa.localeCompare(pb)
          || `${a.medecin.nom} ${a.medecin.prenom}`.localeCompare(`${b.medecin.nom} ${b.medecin.prenom}`, 'fr');
      });
  }

  get lignesFiltrees(): LigneMedecin[] {
    const mots = normaliser(this.filtreTableau).split(/\s+/).filter(Boolean);
    if (mots.length === 0) return this.lignes;
    return this.lignes.filter(({ medecin: m }) => {
      const texte = normaliser(
        `${m.nom} ${m.prenom} ${this.specialiteLibelle(m.specialite)} ${m.fonctionLibelle ?? ''} ${m.etablissementNom ?? ''} ${m.regionNom ?? ''}`);
      return mots.every((mot) => texte.includes(mot));
    });
  }

  get lignesPage(): LigneMedecin[] {
    const start = this.currentPage * this.pageSize;
    return this.lignesFiltrees.slice(start, start + this.pageSize);
  }

  onFiltreTableauChange(): void {
    this.currentPage = 0;
  }

  onPageChange(page: number): void {
    this.currentPage = page;
  }

  // ── Recherche médecin ──

  get medecinsFiltres(): MedecinResponse[] {
    const mots = normaliser(this.recherche).split(/\s+/).filter(Boolean);
    const liste = mots.length === 0 ? this.medecins : this.medecins.filter((m) => {
      const texte = normaliser(
        `${m.nom} ${m.prenom} ${this.specialiteLibelle(m.specialite)} ${m.etablissementNom ?? ''} ${m.regionNom ?? ''}`);
      return mots.every((mot) => texte.includes(mot));
    });
    return liste.slice(0, 50);
  }

  specialiteLibelle(valeur: string): string {
    return this.specialites.find((s) => s.valeur === valeur)?.libelle ?? valeur;
  }

  ouvrirListe(): void {
    this.listeOuverte = true;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.medecin-picker')) {
      this.listeOuverte = false;
    }
  }

  choisirMedecin(m: MedecinResponse): void {
    this.medecin = m;
    this.recherche = '';
    this.listeOuverte = false;
    this.currentDate = new Date();
    this.selectedKey = this.todayKey();
    this.filtre = 'tous';
    this.charger();
  }

  retourListe(): void {
    this.medecin = null;
    this.creneaux = [];
    this.cells = [];
    this.selectedKey = '';
    this.errorMessage = '';
    this.listeOuverte = false;
    // Rafraîchit les compteurs (de nouveaux créneaux ont pu être publiés)
    this.chargerStats();
  }

  // ── Navigation mois ──

  get moisLibelle(): string {
    return `${MONTHS[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
  }

  changeMonth(dir: number): void {
    const d = this.currentDate;
    this.currentDate = new Date(d.getFullYear(), d.getMonth() + dir, 1);
    const today = new Date();
    const estMoisCourant = this.currentDate.getFullYear() === today.getFullYear()
      && this.currentDate.getMonth() === today.getMonth();
    this.selectedKey = estMoisCourant ? this.todayKey() : this.keyOf(this.currentDate);
    this.charger();
  }

  goToday(): void {
    this.currentDate = new Date();
    this.selectedKey = this.todayKey();
    this.charger();
  }

  // ── Chargement ──

  private charger(): void {
    if (!this.medecin) {
      return;
    }
    const medecinId = this.medecin.id;
    const y = this.currentDate.getFullYear();
    const m = this.currentDate.getMonth();
    const dateDebut = `${y}-${pad(m + 1)}-01`;
    const dateFin = `${y}-${pad(m + 1)}-${pad(new Date(y, m + 1, 0).getDate())}`;

    this.isLoading = true;
    this.errorMessage = '';
    forkJoin({
      creneaux: this.creneauService.getPeriode(medecinId, dateDebut, dateFin)
        .pipe(map((r) => (r.success ? r.data : []))),
      rdvs: this.rendezVousService.listeMedecin(medecinId).pipe(
        switchMap((r) => (r.success && r.data.length
          ? this.enrichmentService.enrichir(r.data, medecinId, dateDebut, dateFin)
          : of([] as RendezVousMedecinEnrichi[]))),
      ),
    }).subscribe({
      next: ({ creneaux, rdvs }) => {
        this.isLoading = false;
        // Ignore une réponse arrivée après un changement de médecin
        if (this.medecin?.id !== medecinId) {
          return;
        }
        const rdvsParCreneau = new Map<string, RendezVousMedecinEnrichi[]>();
        rdvs.forEach((rdv) => {
          const liste = rdvsParCreneau.get(rdv.creneauId) ?? [];
          liste.push(rdv);
          rdvsParCreneau.set(rdv.creneauId, liste);
        });
        this.creneaux = creneaux
          .map((c) => ({
            ...c,
            rdvs: (rdvsParCreneau.get(c.id) ?? []).sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
          }))
          .sort((a, b) => a.date.localeCompare(b.date) || a.heureDebut.localeCompare(b.heureDebut));
        this.recalculer();
      },
      error: (err) => {
        this.isLoading = false;
        this.creneaux = [];
        this.recalculer();
        this.errorMessage = err?.error?.message ?? 'Erreur lors du chargement de l\'agenda.';
      },
    });
  }

  private recalculer(): void {
    const y = this.currentDate.getFullYear();
    const m = this.currentDate.getMonth();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const parJour = new Map<string, CreneauAvecRdv[]>();
    this.creneaux.forEach((c) => {
      const k = this.toKey(c.date);
      parJour.set(k, [...(parJour.get(k) ?? []), c]);
    });

    const cells: (AgendaCell | null)[] = [];
    for (let i = 0; i < new Date(y, m, 1).getDay(); i++) {
      cells.push(null);
    }
    const nbJours = new Date(y, m + 1, 0).getDate();
    for (let day = 1; day <= nbJours; day++) {
      const key = `${y}-${pad(m + 1)}-${pad(day)}`;
      const jour = parJour.get(key) ?? [];
      const cellDate = new Date(y, m, day);
      cells.push({
        day,
        key,
        isToday: cellDate.getTime() === today.getTime(),
        isPast: cellDate < today,
        libres: jour.filter((c) => c.statut === 'DISPONIBLE').length,
        reserves: jour.filter((c) => c.statut === 'RESERVE').length,
        annules: jour.filter((c) => c.statut === 'ANNULE').length,
      });
    }
    this.cells = cells;

    const libres = this.creneaux.filter((c) => c.statut === 'DISPONIBLE').length;
    const reserves = this.creneaux.filter((c) => c.statut === 'RESERVE').length;
    const annules = this.creneaux.filter((c) => c.statut === 'ANNULE').length;
    const actifs = libres + reserves;
    this.stats = {
      total: this.creneaux.length,
      libres,
      reserves,
      annules,
      taux: actifs ? Math.round((reserves / actifs) * 100) : 0,
    };
  }

  // ── Détail du jour ──

  selectDay(cell: AgendaCell | null): void {
    if (cell) {
      this.selectedKey = cell.key;
    }
  }

  get creneauxDuJour(): CreneauAvecRdv[] {
    return this.creneaux.filter((c) => {
      if (this.toKey(c.date) !== this.selectedKey) return false;
      if (this.filtre === 'libres') return c.statut === 'DISPONIBLE';
      if (this.filtre === 'reserves') return c.statut === 'RESERVE' || c.rdvs.length > 0;
      return true;
    });
  }

  get jourLibelle(): string {
    if (!this.selectedKey) return '';
    const [y, m, d] = this.selectedKey.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return `${DAYS_LABELS_LONG[date.getDay()]} ${d} ${MONTHS[m - 1].toLowerCase()} ${y}`;
  }

  get jourAppartientAuMois(): boolean {
    return this.cells.some((c) => c?.key === this.selectedKey);
  }

  heure(h: string): string {
    return (h ?? '').slice(0, 5);
  }

  statutCreneauLibelle(statut: string): string {
    return statut === 'DISPONIBLE' ? 'Libre' : statut === 'RESERVE' ? 'Réservé' : 'Annulé';
  }

  statutRdvLibelle(statut: string): string {
    return STATUT_RDV_LIBELLES[statut] ?? statut;
  }

  annuleParLibelle(par: string | null): string {
    return par === 'MEDECIN' ? 'le médecin' : par === 'DELEGUE' ? 'le délégué' : '';
  }

  // ── Utilitaires ──

  private toKey(dateStr: string): string {
    return (dateStr ?? '').slice(0, 10);
  }

  private keyOf(d: Date): string {
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }

  private todayKey(): string {
    return this.keyOf(new Date());
  }
}
