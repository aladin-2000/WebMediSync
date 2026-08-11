import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { DelegueService } from '../../delegue/services/delegue.service';
import { DelegueResponse } from '../../delegue/models/delegue.model';
import { RendezVousService } from '../../delegue/services/rendezvous.service';
import { RendezVousEnrichmentService } from '../../delegue/services/rendezvous-enrichment.service';
import { AuthService } from '../../../core/services/auth.service';
import { calculerStatsDelegue, moisKey } from '../labo-stats.util';

interface DelegueAvecStats {
  delegue: DelegueResponse;
  realiseesMoisCourant: number;
  totalRealisees: number;
}

@Component({
  selector: 'app-labo-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  @Output() navigateTo = new EventEmitter<string>();

  isLoading = true;
  delegues: DelegueResponse[] = [];
  classement: DelegueAvecStats[] = [];
  totalVisitesMoisCourant = 0;
  tauxAnnulationMoyen = 0;

  constructor(
    private delegueService: DelegueService,
    private rendezVousService: RendezVousService,
    private enrichmentService: RendezVousEnrichmentService,
    private authService: AuthService
  ) {}

  get totalActifs(): number {
    return this.delegues.filter((d) => d.isActive).length;
  }

  get totalInactifs(): number {
    return this.delegues.filter((d) => !d.isActive).length;
  }

  ngOnInit(): void {
    const laboratoireId = this.authService.getLaboratoireId();
    if (!laboratoireId) {
      this.isLoading = false;
      return;
    }

    this.delegueService.getByLaboratoire(laboratoireId).subscribe({
      next: (response) => {
        if (!response.success || response.data.length === 0) {
          this.isLoading = false;
          return;
        }
        this.delegues = response.data;
        this.chargerStats();
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  private chargerStats(): void {
    const moisCourant = moisKey(new Date().toISOString().slice(0, 10));
    const dateDebut = new Date();
    dateDebut.setFullYear(dateDebut.getFullYear() - 1);
    const dateFin = new Date();
    dateFin.setMonth(dateFin.getMonth() + 1);
    const dateDebutStr = dateDebut.toISOString().slice(0, 10);
    const dateFinStr = dateFin.toISOString().slice(0, 10);

    const appels = this.delegues.map((delegue) =>
      this.rendezVousService.listeDelegue(delegue.id).pipe(
        catchError(() => of({ success: false as const, message: '', data: [] })),
      )
    );

    forkJoin(appels).subscribe((reponses) => {
      const enrichissements = reponses.map((reponse, i) =>
        reponse.success && reponse.data.length > 0
          ? this.enrichmentService.enrichir(reponse.data, dateDebutStr, dateFinStr)
          : of([])
      );

      forkJoin(enrichissements).subscribe((listesEnrichies) => {
        let totalAnnulations = 0;
        let totalRdv = 0;
        let totalVisitesMois = 0;

        this.classement = this.delegues.map((delegue, i) => {
          const enrichis = listesEnrichies[i];
          const stats = calculerStatsDelegue(enrichis);
          totalAnnulations += stats.totalAnnulations;
          totalRdv += enrichis.length;
          const moisEntry = stats.parMois.find((m) => m.cle === moisCourant);
          const realiseesMoisCourant = moisEntry?.realisees ?? 0;
          totalVisitesMois += realiseesMoisCourant;

          return { delegue, realiseesMoisCourant, totalRealisees: stats.totalRealisees };
        }).sort((a, b) => b.realiseesMoisCourant - a.realiseesMoisCourant);

        this.totalVisitesMoisCourant = totalVisitesMois;
        this.tauxAnnulationMoyen = totalRdv ? Math.round((totalAnnulations / totalRdv) * 100) : 0;
        this.isLoading = false;
      });
    });
  }

  go(page: string): void {
    this.navigateTo.emit(page);
  }
}
