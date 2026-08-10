import { Injectable } from '@angular/core';
import { Observable, forkJoin, map, of } from 'rxjs';
import { CreneauService } from './creneau.service';
import { DelegueService } from '../../delegue/services/delegue.service';
import { LaboratoireService } from '../../../core/services/laboratoire.service';
import { RendezVousResponse } from '../../delegue/models/rendezvous.model';
import { RendezVousMedecinEnrichi } from '../models/rendezvous-medecin-enrichi.model';

@Injectable({
  providedIn: 'root',
})
export class RendezVousMedecinEnrichmentService {
  constructor(
    private creneauService: CreneauService,
    private delegueService: DelegueService,
    private laboratoireService: LaboratoireService
  ) {}

  enrichir(
    rendezvous: RendezVousResponse[],
    medecinId: string,
    dateDebut: string,
    dateFin: string
  ): Observable<RendezVousMedecinEnrichi[]> {
    if (rendezvous.length === 0) {
      return of([]);
    }

    return forkJoin({
      creneaux: this.creneauService.getPeriode(medecinId, dateDebut, dateFin),
      delegues: this.delegueService.getAll(),
      laboratoires: this.laboratoireService.getAll(),
    }).pipe(
      map(({ creneaux, delegues, laboratoires }) => {
        const creneauxMap = new Map(
          creneaux.success ? creneaux.data.map((c) => [c.id, c]) : []
        );
        const deleguesMap = new Map(
          delegues.success ? delegues.data.map((d) => [d.id, d]) : []
        );
        const laboratoiresMap = new Map(
          laboratoires.success ? laboratoires.data.map((l) => [l.id, l]) : []
        );

        return rendezvous.map((rdv): RendezVousMedecinEnrichi => {
          const creneau = creneauxMap.get(rdv.creneauId);
          const delegue = deleguesMap.get(rdv.delegueId);
          const laboratoire = rdv.laboratoireId ? laboratoiresMap.get(rdv.laboratoireId) : undefined;
          return {
            ...rdv,
            date: creneau?.date ?? '',
            heureDebut: creneau?.heureDebut ?? '',
            heureFin: creneau?.heureFin ?? '',
            delegueNom: delegue?.nom ?? '',
            deleguePrenom: delegue?.prenom ?? '',
            laboratoireNom: laboratoire?.nom ?? '',
          };
        });
      })
    );
  }
}
