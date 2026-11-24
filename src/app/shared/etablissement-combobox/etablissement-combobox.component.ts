import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EtablissementResponse } from '../../features/admin/models/etablissement.model';

let nextId = 0;

/**
 * Champ de recherche d'établissement (combobox) : on tape quelques lettres et la liste
 * se réduit. Recherche insensible aux accents / à la casse, sur nom + région, plusieurs
 * mots dans n'importe quel ordre. Usage : `<app-etablissement-combobox [etablissements]="…" [(value)]="etablissementId">`.
 *
 * `inline` : la liste s'ouvre dans le flux (pousse le contenu) au lieu de flotter —
 * à utiliser dans un conteneur qui défile (modale), où une liste flottante serait coupée.
 */
@Component({
  selector: 'app-etablissement-combobox',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './etablissement-combobox.component.html',
  styleUrls: ['./etablissement-combobox.component.css'],
})
export class EtablissementComboboxComponent implements OnChanges {
  @Input() etablissements: EtablissementResponse[] = [];
  /** Id de l'établissement choisi ('' = aucun). */
  @Input() value = '';
  @Output() valueChange = new EventEmitter<string>();

  @Input() inputId = `etablissement-combobox-${nextId++}`;
  @Input() placeholder = 'Tapez pour rechercher (ex. Charles Nicolle, Sfax…)';
  @Input() inline = false;
  @Input() compact = false;

  get listboxId(): string {
    return `${this.inputId}-listbox`;
  }
  private static readonly MAX_RESULTS = 50;

  query = '';
  open = false;
  activeIndex = -1;

  ngOnChanges(changes: SimpleChanges): void {
    // Affiche le nom de l'établissement déjà choisi (édition de profil, liste chargée après coup)
    if ((changes['value'] || changes['etablissements']) && !this.open) {
      this.query = this.selectedNom();
    }
  }

  /** Minuscule + sans accents : « hopital » trouve « Hôpital ». */
  private static normaliser(texte: string): string {
    return texte.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
  }

  private selectedNom(): string {
    return this.etablissements.find((e) => e.id === this.value)?.nom ?? '';
  }

  get filtered(): EtablissementResponse[] {
    const mots = EtablissementComboboxComponent.normaliser(this.query).split(/\s+/).filter(Boolean);
    const resultats = mots.length === 0
      ? this.etablissements
      : this.etablissements.filter((e) => {
          const cible = EtablissementComboboxComponent.normaliser(`${e.nom} ${e.regionNom ?? ''}`);
          return mots.every((m) => cible.includes(m));
        });
    return resultats.slice(0, EtablissementComboboxComponent.MAX_RESULTS);
  }

  private setValue(id: string): void {
    if (id !== this.value) {
      this.value = id;
      this.valueChange.emit(id);
    }
  }

  onFocus(): void {
    this.open = true;
    this.activeIndex = -1;
  }

  onBlur(): void {
    this.open = false;
    // Texte saisi sans choisir dans la liste : on ne garde pas une valeur ambiguë.
    this.query = this.selectedNom();
  }

  onQueryChange(): void {
    this.setValue('');
    this.open = true;
    this.activeIndex = this.query.trim() ? 0 : -1;
  }

  select(etab: EtablissementResponse): void {
    this.setValue(etab.id);
    this.query = etab.nom;
    this.open = false;
  }

  clear(): void {
    this.setValue('');
    this.query = '';
    this.activeIndex = -1;
    this.open = true;
  }

  onKeydown(event: KeyboardEvent): void {
    const liste = this.filtered;
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.open = true;
        this.activeIndex = Math.min(this.activeIndex + 1, liste.length - 1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.activeIndex = Math.max(this.activeIndex - 1, 0);
        break;
      case 'Enter':
        // Empêche la soumission du formulaire parent pendant le choix
        if (this.open && this.activeIndex >= 0 && liste[this.activeIndex]) {
          event.preventDefault();
          this.select(liste[this.activeIndex]);
        }
        break;
      case 'Escape':
        if (this.open) {
          // Ne ferme pas la modale parente : on ferme seulement la liste
          event.stopPropagation();
          this.open = false;
        }
        break;
    }
  }
}
