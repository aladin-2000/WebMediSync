import { Injectable } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { MedecinService } from '../../admin/services/medecin.service';
import { CreneauService } from '../../medecin/services/creneau.service';
import { RendezVousResponse } from '../models/rendezvous.model';
import { RendezVousEnrichi } from '../models/rendezvous-enrichi.model';

@Injectable({
  providedIn: 'root',
})
export class RendezVousEnrichmentService {
  constructor(
    private medecinService: MedecinService,
    private creneauService: CreneauService
  ) {}

  enrichir(
    rendezvous: RendezVousResponse[],
    dateDebut: string,
    dateFin: string
  ): Observable<RendezVousEnrichi[]> {
    if (rendezvous.length === 0) {
      return of([]);
    }

    const medecinIds = [...new Set(rendezvous.map((r) => r.medecinId))];

    return forkJoin({
      medecins: this.medecinService.getAll(),
      creneauxParMedecin: forkJoin(
        medecinIds.reduce((acc, medecinId) => {
          acc[medecinId] = this.creneauService.getPeriode(medecinId, dateDebut, dateFin);
          return acc;
        }, {} as Record<string, ReturnType<CreneauService['getPeriode']>>)
      ),
    }).pipe(
      map(({ medecins, creneauxParMedecin }) => {
        const medecinsMap = new Map(
          medecins.success ? medecins.data.map((m) => [m.id, m]) : []
        );
        const creneauxMap = new Map<string, { date: string; heureDebut: string; heureFin: string }>();
        for (const medecinId of medecinIds) {
          const response = creneauxParMedecin[medecinId];
          if (response.success) {
            for (const creneau of response.data) {
              creneauxMap.set(creneau.id, creneau);
            }
          }
        }

        return rendezvous.map((rdv): RendezVousEnrichi => {
          const medecin = medecinsMap.get(rdv.medecinId);
          const creneau = creneauxMap.get(rdv.creneauId);
          return {
            ...rdv,
            date: creneau?.date ?? '',
            heureDebut: creneau?.heureDebut ?? '',
            heureFin: creneau?.heureFin ?? '',
            medecinNom: medecin?.nom ?? '',
            medecinPrenom: medecin?.prenom ?? '',
            medecinSpecialite: medecin?.specialite ?? '',
          };
        });
      })
    );
  }
}
