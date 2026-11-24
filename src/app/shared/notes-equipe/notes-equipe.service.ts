import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../core/config/api.config';
import { ApiResponse } from '../../core/models/user.model';

export interface NoteEquipe {
  id: string;
  contenu: string;
  role: 'MEDECIN' | 'DELEGUE';
  auteurNom: string;
  traitee: boolean;
  createdAt: string;
}

/** Longueurs acceptées par le backend (NoteEquipeRequest). */
export const NOTE_MIN = 1;
export const NOTE_MAX = 2000;

@Injectable({ providedIn: 'root' })
export class NotesEquipeService {
  private readonly baseUrl = `${API_BASE_URL}/api/notes-equipe`;

  constructor(private http: HttpClient) {}

  /** Médecin / délégué : envoie une note à l'équipe MediSync. */
  envoyer(contenu: string): Observable<ApiResponse<NoteEquipe>> {
    return this.http.post<ApiResponse<NoteEquipe>>(this.baseUrl, { contenu });
  }

  /** Médecin / délégué : ses propres notes. */
  mesNotes(): Observable<ApiResponse<NoteEquipe[]>> {
    return this.http.get<ApiResponse<NoteEquipe[]>>(`${this.baseUrl}/mes-notes`);
  }

  /** Admin : toutes les notes. */
  toutes(): Observable<ApiResponse<NoteEquipe[]>> {
    return this.http.get<ApiResponse<NoteEquipe[]>>(this.baseUrl);
  }

  /** Admin : marque une note comme traitée ou la rouvre. */
  marquerTraitee(id: string, valeur: boolean): Observable<ApiResponse<NoteEquipe>> {
    return this.http.patch<ApiResponse<NoteEquipe>>(`${this.baseUrl}/${id}/traitee?valeur=${valeur}`, {});
  }
}
