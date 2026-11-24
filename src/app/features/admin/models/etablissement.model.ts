export interface EtablissementResponse {
  id: string;
  nom: string;
  adresse: string | null;
  regionId: string | null;
  regionNom: string | null;
}

export interface EtablissementRequest {
  nom: string;
  adresse?: string;
  regionId?: string;
}
