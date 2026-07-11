import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../shared/modal/modal.component';
import { RegleRecurrence } from '../models/disponibilite.models';
import { MOCK_REGLES, ALL_JOURS } from '../data/mock-data';

type ModalType = 'add' | 'edit' | null;

@Component({
  selector: 'app-recurrences',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent],
  templateUrl: './recurrences.component.html',
  styleUrls: ['./recurrences.component.css'],
})
export class RecurrencesComponent {
  regles = signal<RegleRecurrence[]>(MOCK_REGLES.map(r => ({ ...r })));
  activeModal = signal<ModalType>(null);
  editingRegle: RegleRecurrence | null = null;

  newNom = '';
  newDebut = '09:00';
  newFin = '12:00';
  newJours: string[] = [];

  readonly allJours = ALL_JOURS;

  get recPreview(): string {
    const [dh, dm] = this.newDebut.split(':').map(Number);
    const [fh, fm] = this.newFin.split(':').map(Number);
    const mins = (fh * 60 + fm) - (dh * 60 + dm);
    const count = Math.max(0, Math.floor(mins / 15));
    return `${count} créneau${count > 1 ? 'x' : ''} de 15 min seront générés par jour actif`;
  }

  toggleActive(regle: RegleRecurrence): void {
    this.regles.update(list =>
      list.map(r => r.id === regle.id ? { ...r, isActive: !r.isActive } : r)
    );
  }

  openAdd(): void {
    this.newNom = '';
    this.newDebut = '09:00';
    this.newFin = '12:00';
    this.newJours = [];
    this.activeModal.set('add');
  }

  openEdit(regle: RegleRecurrence): void {
    this.editingRegle = { ...regle };
    this.newNom = regle.nom;
    this.newDebut = regle.heureDebut;
    this.newFin = regle.heureFin;
    this.newJours = [...regle.jours];
    this.activeModal.set('edit');
  }

  delete(id: string): void {
    this.regles.update(list => list.filter(r => r.id !== id));
  }

  saveAdd(): void {
    const regle: RegleRecurrence = {
      id: Date.now().toString(),
      nom: this.newNom || 'Nouvelle règle',
      jours: this.newJours as any,
      heureDebut: this.newDebut,
      heureFin: this.newFin,
      isActive: true,
      dateDebut: new Date().toISOString().slice(0, 10),
      creneauxParSemaine: 0,
    };
    this.regles.update(list => [...list, regle]);
    this.closeModal();
  }

  saveEdit(): void {
    if (!this.editingRegle) return;
    this.regles.update(list =>
      list.map(r => r.id === this.editingRegle!.id
        ? { ...r, nom: this.newNom, heureDebut: this.newDebut, heureFin: this.newFin, jours: this.newJours as any }
        : r)
    );
    this.closeModal();
  }

  closeModal(): void {
    this.activeModal.set(null);
    this.editingRegle = null;
  }

  toggleJour(key: string): void {
    const idx = this.newJours.indexOf(key);
    if (idx >= 0) this.newJours.splice(idx, 1);
    else this.newJours.push(key);
  }

  isJourSelected(key: string): boolean {
    return this.newJours.includes(key);
  }

  isJourActive(regle: RegleRecurrence, key: string): boolean {
    return regle.jours.includes(key as any);
  }
}
