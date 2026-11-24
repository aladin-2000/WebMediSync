import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NOTE_MAX, NOTE_MIN, NoteEquipe, NotesEquipeService } from './notes-equipe.service';

/**
 * Page « Notes à l'équipe MediSync » partagée par le médecin et le délégué :
 * formulaire d'envoi + historique de ses propres notes.
 */
@Component({
  selector: 'app-notes-equipe',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './notes-equipe.component.html',
  styleUrls: ['./notes-equipe.component.css'],
})
export class NotesEquipeComponent implements OnInit {
  readonly max = NOTE_MAX;
  readonly min = NOTE_MIN;

  contenu = '';
  notes: NoteEquipe[] = [];
  isLoading = false;
  isSending = false;
  errorMessage = '';
  successMessage = '';
  private successTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(private notesService: NotesEquipeService) {}

  ngOnInit(): void {
    this.charger();
  }

  get longueur(): number {
    return this.contenu.trim().length;
  }

  get peutEnvoyer(): boolean {
    return !this.isSending && this.longueur >= NOTE_MIN && this.contenu.length <= NOTE_MAX;
  }

  charger(): void {
    this.isLoading = true;
    this.notesService.mesNotes().subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success) {
          this.notes = res.data;
        }
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Impossible de charger vos notes.';
      },
    });
  }

  envoyer(): void {
    if (!this.peutEnvoyer) {
      this.errorMessage = this.longueur < NOTE_MIN
        ? 'Écrivez votre note avant de l\'envoyer.'
        : `La note ne peut pas dépasser ${NOTE_MAX} caractères.`;
      return;
    }
    this.isSending = true;
    this.errorMessage = '';
    this.notesService.envoyer(this.contenu.trim()).subscribe({
      next: (res) => {
        this.isSending = false;
        if (res.success) {
          this.notes = [res.data, ...this.notes];
          this.contenu = '';
          this.afficherSucces(res.message || 'Merci ! Votre note a été envoyée.');
        } else {
          this.errorMessage = res.message;
        }
      },
      error: (err) => {
        this.isSending = false;
        this.errorMessage = err?.error?.message ?? "Erreur lors de l'envoi de la note.";
      },
    });
  }

  /** Ctrl+Entrée (ou Cmd+Entrée) envoie la note. */
  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      this.envoyer();
    }
  }

  private afficherSucces(message: string): void {
    this.successMessage = message;
    if (this.successTimer) clearTimeout(this.successTimer);
    this.successTimer = setTimeout(() => (this.successMessage = ''), 5000);
  }
}
