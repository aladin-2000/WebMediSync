export interface DelegueResponse {
  id: string;
  userId: string;
  laboratoireId: string;
  nom: string;
  prenom: string;
  telephone: string | null;
  photoUrl: string | null;
  scoreFiabilite: number;
  createdAt: string;
}
