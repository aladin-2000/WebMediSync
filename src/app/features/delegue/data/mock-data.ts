// ============================================
// DONNEES DE TEST POUR LES DELEGUES
// (Mock = données fictives pour tester l'app)
// ============================================

// Interface: Un médecin
export interface Doctor {
  id: string;
  name: string;
  specialty: string; // Cardiologue, généraliste, etc
  city: string;
  score: number; // Notre score auprès du médecin (0-100)
}

// Interface: Une disponibilité d'un médecin
export interface Availability {
  id: string;
  doctorId: string;
  date: string; // Format: YYYY-MM-DD
  time: string; // Format: HH:mm
  duration: number; // 15 min
}

// Interface: Une réservation du délégué
export interface Reservation {
  id: string;
  doctorId: string;
  doctorName: string;
  date: string;
  time: string;
  status: 'confirmed' | 'cancelled' | 'done';
  cancellationReason?: string;
}

// ========== LISTE DES MEDECINS ==========
export const DOCTORS: Doctor[] = [
  {
    id: '1',
    name: 'Dr. Martin Dupont',
    specialty: 'Cardiologue',
    city: 'Paris',
    score: 85,
  },
  {
    id: '2',
    name: 'Dr. Sophie Bernard',
    specialty: 'Généraliste',
    city: 'Lyon',
    score: 92,
  },
  {
    id: '3',
    name: 'Dr. Pierre Leclerc',
    specialty: 'Pneumologue',
    city: 'Marseille',
    score: 78,
  },
  {
    id: '4',
    name: 'Dr. Marie Rousseau',
    specialty: 'Dermatologue',
    city: 'Toulouse',
    score: 88,
  },
];

// ========== DISPONIBILITES DES MEDECINS ==========
export const AVAILABILITIES: Availability[] = [
  // Dr. Martin - Demain (2025-07-09)
  { id: 'a1', doctorId: '1', date: '2025-07-09', time: '09:00', duration: 15 },
  { id: 'a2', doctorId: '1', date: '2025-07-09', time: '10:00', duration: 15 },
  { id: 'a3', doctorId: '1', date: '2025-07-09', time: '14:00', duration: 15 },

  // Dr. Sophie - Aujourd'hui et demain
  { id: 'a4', doctorId: '2', date: '2025-07-08', time: '11:00', duration: 15 },
  { id: 'a5', doctorId: '2', date: '2025-07-09', time: '09:30', duration: 15 },
  { id: 'a6', doctorId: '2', date: '2025-07-09', time: '15:00', duration: 15 },

  // Dr. Pierre - Cette semaine
  { id: 'a7', doctorId: '3', date: '2025-07-10', time: '10:00', duration: 15 },
  { id: 'a8', doctorId: '3', date: '2025-07-11', time: '13:00', duration: 15 },

  // Dr. Marie - Prochaine semaine
  { id: 'a9', doctorId: '4', date: '2025-07-14', time: '09:00', duration: 15 },
  { id: 'a10', doctorId: '4', date: '2025-07-15', time: '10:00', duration: 15 },
];

// ========== RESERVATIONS EXISTANTES DU DELEGUE ==========
export const RESERVATIONS: Reservation[] = [
  {
    id: 'r1',
    doctorId: '1',
    doctorName: 'Dr. Martin Dupont',
    date: '2025-07-02',
    time: '10:00',
    status: 'done',
  },
  {
    id: 'r2',
    doctorId: '2',
    doctorName: 'Dr. Sophie Bernard',
    date: '2025-07-05',
    time: '14:00',
    status: 'done',
  },
  {
    id: 'r3',
    doctorId: '3',
    doctorName: 'Dr. Pierre Leclerc',
    date: '2025-07-06',
    time: '11:00',
    status: 'cancelled',
    cancellationReason: 'Urgence professionnelle',
  },
];

// Constantes
export const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

export const DAYS_LABELS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
