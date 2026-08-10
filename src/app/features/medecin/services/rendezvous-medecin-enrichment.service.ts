import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { CreneauService } from './creneau.service';
import { RendezVousResponse } from '../../delegue/models/rendezvous.model';
import { RendezVousMedecinEnrichi } from '../models/rendezvous-medecin-enrichi.model';

@Injectable({
  providedIn: 'root',
})
export class RendezVousMedecinEnrichmentService {
  constructor(private creneauService: CreneauService) {}

  enrichir(
    rendezvous: RendezVousResponse[],
    medecinId: string,
    dateDebut: string,
    dateFin: string
  ): Observable<RendezVousMedecinEnrichi[]> {
    return this.creneauService.getPeriode(medecinId, dateDebut, dateFin).pipe(
      map((response) => {
        const creneauxMap = new Map(
          response.success ? response.data.map((c) => [c.id, c]) : []
        );

        return rendezvous.map((rdv): RendezVousMedecinEnrichi => {
          const creneau = creneauxMap.get(rdv.creneauId);
          return {
            ...rdv,
            date: creneau?.date ?? '',
            heureDebut: creneau?.heureDebut ?? '',
            heureFin: creneau?.heureFin ?? '',
            delegueNom: '',
            deleguePrenom: '',
          };
        });
      })
    );
  }
}
