import { MONTHS } from '../medecin/shared/date-labels.constants';
import { RendezVousEnrichi } from '../delegue/models/rendezvous-enrichi.model';

/** Clé "YYYY-MM" d'un rendez-vous, pour le regrouper par mois. */
export function moisKey(dateISO: string): string {
  return dateISO.slice(0, 7);
}

/** Libellé humain d'une clé "YYYY-MM", ex: "2026-03" -> "Mars 2026". */
export function libelleMois(cle: string): string {
  const [year, month] = cle.split('-').map(Number);
  return `${MONTHS[month - 1]} ${year}`;
}

export interface StatsDelegue {
  totalRealisees: number;
  totalAbsences: number;
  totalAnnulations: number;
  tauxAnnulation: number;
  parMois: { cle: string; libelle: string; realisees: number }[];
}

/** Calcule les statistiques d'un délégué à partir de sa liste complète de rendez-vous. */
export function calculerStatsDelegue(rendezvous: RendezVousEnrichi[]): StatsDelegue {
  const realisees = rendezvous.filter((r) => r.statut === 'REALISE');
  const absences = rendezvous.filter((r) => r.statut === 'ABSENT_MEDECIN' || r.statut === 'ABSENT_DELEGUE');
  const annulations = rendezvous.filter((r) => r.statut === 'ANNULE');
  const total = rendezvous.length;

  const parMoisMap = new Map<string, number>();
  for (const rdv of realisees) {
    const cle = moisKey(rdv.date);
    parMoisMap.set(cle, (parMoisMap.get(cle) ?? 0) + 1);
  }
  const parMois = [...parMoisMap.entries()]
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([cle, realisees]) => ({ cle, libelle: libelleMois(cle), realisees }));

  return {
    totalRealisees: realisees.length,
    totalAbsences: absences.length,
    totalAnnulations: annulations.length,
    tauxAnnulation: total ? Math.round((annulations.length / total) * 100) : 0,
    parMois,
  };
}
