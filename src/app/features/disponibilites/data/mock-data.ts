import { RegleRecurrence, JourSemaineView, StatMois, StatJour } from '../models/disponibilite.models';

export const MOCK_REGLES: RegleRecurrence[] = [
  {
    id: '1',
    nom: 'Matinées classiques',
    heureDebut: '09:00',
    heureFin: '12:00',
    isActive: true,
    dateDebut: '2026-06-01',
    creneauxParSemaine: 32,
  },
  {
    id: '2',
    nom: 'Après-midi mercredi',
    heureDebut: '14:00',
    heureFin: '17:30',
    isActive: true,
    dateDebut: '2026-06-15',
    creneauxParSemaine: 14,
  },
  {
    id: '3',
    nom: 'Vendredi matin',
    heureDebut: '08:00',
    heureFin: '10:00',
    isActive: false,
    dateDebut: '2026-06-01',
    creneauxParSemaine: 0,
  },
];

export const MOCK_SEMAINE: JourSemaineView[] = [
  {
    label: 'Lundi 30 juin',
    creneaux: [
      { heure: '09h00', statut: 'reserve' },
      { heure: '09h15', statut: 'reserve' },
      { heure: '09h30', statut: 'reserve' },
      { heure: '09h45', statut: 'libre'   },
      { heure: '10h00', statut: 'libre'   },
      { heure: '10h15', statut: 'reserve' },
    ],
  },
  {
    label: 'Mardi 1 juil',
    creneaux: [
      { heure: '09h00', statut: 'reserve' },
      { heure: '09h15', statut: 'reserve' },
      { heure: '14h00', statut: 'libre'   },
      { heure: '14h15', statut: 'libre'   },
      { heure: '14h30', statut: 'reserve' },
      { heure: '14h45', statut: 'reserve' },
    ],
  },
  {
    label: 'Merc 2 juil',
    creneaux: [
      { heure: '14h00', statut: 'reserve' },
      { heure: '14h15', statut: 'libre'   },
      { heure: '14h30', statut: 'libre'   },
      { heure: '14h45', statut: 'reserve' },
      { heure: '15h00', statut: 'reserve' },
      { heure: '15h15', statut: 'reserve' },
    ],
  },
  {
    label: 'Jeudi 3 juil',
    creneaux: [
      { heure: '09h00', statut: 'reserve' },
      { heure: '09h15', statut: 'reserve' },
      { heure: '09h30', statut: 'libre'   },
      { heure: '09h45', statut: 'libre'   },
      { heure: '10h00', statut: 'reserve' },
      { heure: '10h15', statut: 'libre'   },
    ],
  },
  {
    label: 'Vendr 4 juil',
    creneaux: [
      { heure: '09h00', statut: 'libre' },
      { heure: '09h15', statut: 'libre' },
      { heure: '09h30', statut: 'libre' },
    ],
  },
  {
    label: 'Samedi 5 juil',
    creneaux: [],
  },
];

export const MOCK_STATS: StatMois = {
  total: 46,
  reserves: 34,
  taux: 74,
  annulations: 3,
};

export const MOCK_STATS_JOURS: StatJour[] = [
  { label: 'Lun', taux: 80 },
  { label: 'Mar', taux: 95 },
  { label: 'Mer', taux: 60 },
  { label: 'Jeu', taux: 70 },
  { label: 'Ven', taux: 40 },
  { label: 'Sam', taux: 30 },
];

export const MONTHS = [
  'Janvier','Février','Mars','Avril','Mai','Juin',
  'Juillet','Août','Septembre','Octobre','Novembre','Décembre',
];

export const DAYS_LABELS = ['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'];
