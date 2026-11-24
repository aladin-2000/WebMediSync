import { Component, ElementRef, EventEmitter, HostListener, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NOTE_MAX, NOTE_MIN, NoteEquipe, NotesEquipeService } from './notes-equipe.service';

/**
 * Bouton flottant (bas droite) « Notes à l'équipe » : ouvre un petit panneau
 * pour écrire une note rapidement, avec un aperçu des dernières notes envoyées.
 */
@Component({
  selector: 'app-notes-equipe-fab',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './notes-equipe-fab.component.html',
  styleUrls: ['./notes-equipe-fab.component.css'],
})
export class NotesEquipeFabComponent {
  /** Demande d'ouverture de la page complète « Notes à l'équipe ». */
  @Output() voirTout = new EventEmitter<void>();

  @ViewChild('zoneTexte') zoneTexte?: ElementRef<HTMLTextAreaElement>;

  readonly max = NOTE_MAX;
  ouvert = false;
  contenu = '';
  dernieres: NoteEquipe[] = [];
  total = 0;
  isLoading = false;
  isSending = false;
  errorMessage = '';
  successMessage = '';

  constructor(private notesService: NotesEquipeService, private host: ElementRef<HTMLElement>) {}

  get peutEnvoyer(): boolean {
    return !this.isSending && this.contenu.trim().length >= NOTE_MIN && this.contenu.length <= NOTE_MAX;
  }

  basculer(): void {
    this.ouvert ? this.fermer() : this.ouvrir();
  }

  ouvrir(): void {
    this.ouvert = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.charger();
    setTimeout(() => this.zoneTexte?.nativeElement.focus(), 50);
  }

  fermer(): void {
    this.ouvert = false;
  }

  private charger(): void {
    this.isLoading = true;
    this.notesService.mesNotes().subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success) {
          this.total = res.data.length;
          this.dernieres = res.data.slice(0, 3);
        }
      },
      error: () => (this.isLoading = false),
    });
  }

  envoyer(): void {
    if (!this.peutEnvoyer) {
      this.errorMessage = 'Écrivez votre note avant de l\'envoyer.';
      return;
    }
    this.isSending = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.notesService.envoyer(this.contenu.trim()).subscribe({
      next: (res) => {
        this.isSending = false;
        if (res.success) {
          this.contenu = '';
          this.dernieres = [res.data, ...this.dernieres].slice(0, 3);
          this.total++;
          this.successMessage = 'Merci ! Votre note a été envoyée.';
        } else {
          this.errorMessage = res.message;
        }
      },
      error: (err) => {
        this.isSending = false;
        this.errorMessage = err?.error?.message ?? 'Erreur lors de l\'envoi de la note.';
      },
    });
  }

  ouvrirPageComplete(): void {
    this.fermer();
    this.voirTout.emit();
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      this.envoyer();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.ouvert) this.fermer();
  }

  /** Clic en dehors du bouton et du panneau : on referme. */
  @HostListener('document:mousedown', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.ouvert && !this.host.nativeElement.contains(event.target as Node)) {
      this.fermer();
    }
  }
}
