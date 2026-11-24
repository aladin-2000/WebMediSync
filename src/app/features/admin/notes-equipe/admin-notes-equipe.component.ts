import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaginationComponent } from '../shared/pagination/pagination.component';
import { NoteEquipe, NotesEquipeService } from '../../../shared/notes-equipe/notes-equipe.service';

type FiltreRole = '' | 'MEDECIN' | 'DELEGUE';
type FiltreStatut = '' | 'a-traiter' | 'traitee';

const APERCU_MAX = 220;

function normaliser(s: string | null | undefined): string {
  return (s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

/** Admin : liste des notes envoyées par les médecins et les délégués. */
@Component({
  selector: 'app-admin-notes-equipe',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent],
  templateUrl: './admin-notes-equipe.component.html',
  styleUrls: ['./admin-notes-equipe.component.css'],
})
export class AdminNotesEquipeComponent implements OnInit {
  /** Nombre de notes à traiter, pour le badge de la sidebar. */
  @Output() aTraiterChange = new EventEmitter<number>();

  notes: NoteEquipe[] = [];
  isLoading = false;
  errorMessage = '';
  recherche = '';
  filtreRole: FiltreRole = '';
  filtreStatut: FiltreStatut = 'a-traiter';
  currentPage = 0;
  pageSize = 10;
  readonly pageSizeOptions = [10, 25, 50];
  private depliees = new Set<string>();
  enCours: string | null = null;

  constructor(private notesService: NotesEquipeService) {}

  ngOnInit(): void {
    this.charger();
  }

  charger(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.notesService.toutes().subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success) {
          this.notes = res.data;
          this.emettreCompteur();
        } else {
          this.errorMessage = res.message;
        }
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Impossible de charger les notes.';
      },
    });
  }

  get nombreATraiter(): number {
    return this.notes.filter((n) => !n.traitee).length;
  }

  get notesFiltrees(): NoteEquipe[] {
    const mots = normaliser(this.recherche).split(/\s+/).filter(Boolean);
    return this.notes.filter((n) => {
      if (this.filtreRole && n.role !== this.filtreRole) return false;
      if (this.filtreStatut === 'a-traiter' && n.traitee) return false;
      if (this.filtreStatut === 'traitee' && !n.traitee) return false;
      if (mots.length) {
        const texte = normaliser(`${n.auteurNom} ${n.contenu}`);
        if (!mots.every((m) => texte.includes(m))) return false;
      }
      return true;
    });
  }

  get notesPage(): NoteEquipe[] {
    const start = this.currentPage * this.pageSize;
    return this.notesFiltrees.slice(start, start + this.pageSize);
  }

  onFiltresChange(): void {
    this.currentPage = 0;
  }

  onPageChange(page: number): void {
    this.currentPage = page;
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.currentPage = 0;
  }

  estLongue(n: NoteEquipe): boolean {
    return n.contenu.length > APERCU_MAX;
  }

  estDepliee(n: NoteEquipe): boolean {
    return this.depliees.has(n.id);
  }

  texte(n: NoteEquipe): string {
    return this.estLongue(n) && !this.estDepliee(n) ? n.contenu.slice(0, APERCU_MAX).trimEnd() + '…' : n.contenu;
  }

  basculerDeplie(n: NoteEquipe): void {
    if (this.depliees.has(n.id)) this.depliees.delete(n.id);
    else this.depliees.add(n.id);
  }

  basculerTraitee(n: NoteEquipe): void {
    const valeur = !n.traitee;
    this.enCours = n.id;
    this.notesService.marquerTraitee(n.id, valeur).subscribe({
      next: (res) => {
        this.enCours = null;
        if (res.success) {
          n.traitee = res.data.traitee;
          this.emettreCompteur();
        } else {
          this.errorMessage = res.message;
        }
      },
      error: (err) => {
        this.enCours = null;
        this.errorMessage = err?.error?.message ?? 'Erreur lors de la mise à jour de la note.';
      },
    });
  }

  private emettreCompteur(): void {
    this.aTraiterChange.emit(this.nombreATraiter);
  }
}
