import { RegleRecurrence, JourSemaineView, StatMois, StatJour } from '../models/disponibilite.models';

export const SLOT_DATA: Record<string, { avail: number; taken: number }> = {
  '2025-7-2':  { avail: 8,  taken: 6  },
  '2025-7-3':  { avail: 12, taken: 12 },
  '2025-7-7':  { avail: 8,  taken: 5  },
  '2025-7-8':  { avail: 12, taken: 8  },
  '2025-7-9':  { avail: 8,  taken: 8  },
  '2025-7-10': { avail: 12, taken: 3  },
  '2025-7-14': { avail: 8,  taken: 7  },
  '2025-7-15': { avail: 12, taken: 10 },
  '2025-7-16': { avail: 8,  taken: 2  },
  '2025-7-21': { avail: 12, taken: 12 },
  '2025-7-22': { avail: 8,  taken: 4  },
};

export const MOCK_REGLES: RegleRecurrence[] = [
  {
    id: '1',
    nom: 'Matinées classiques',
    jours: ['L', 'M', 'J'],
    heureDebut: '09:00',
    heureFin: '12:00',
    isActive: true,
    dateDebut: '2025-06-01',
    creneauxParSemaine: 32,
  },
  {
    id: '2',
    nom: 'Après-midi mercredi',
    jours: ['Me'],
    heureDebut: '14:00',
    heureFin: '17:30',
    isActive: true,
    dateDebut: '2025-06-15',
    creneauxParSemaine: 14,
  },
  {
    id: '3',
    nom: 'Vendredi matin',
    jours: ['V'],
    heureDebut: '08:00',
    heureFin: '10:00',
    isActive: false,
    dateDebut: '2025-06-01',
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

export const TEMPLATES = [
  { nom: 'Semaine standard',  desc: 'Lun–Jeu 09h→12h · Mer 14h→17h30 · 46 créneaux' },
  { nom: 'Semaine chargée',   desc: 'Lun–Sam 09h→12h + 14h→17h · 88 créneaux'       },
  { nom: 'Semaine légère',    desc: 'Mar + Jeu 09h→12h · 24 créneaux'                },
];

export const ALL_JOURS: { key: string; label: string }[] = [
  { key: 'L',  label: 'L' },
  { key: 'M',  label: 'M' },
  { key: 'Me', label: 'M' },
  { key: 'J',  label: 'J' },
  { key: 'V',  label: 'V' },
  { key: 'S',  label: 'S' },
];
