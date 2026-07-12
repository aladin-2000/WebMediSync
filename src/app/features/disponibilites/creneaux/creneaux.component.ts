import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../shared/modal/modal.component';
import { JourSemaineView } from '../models/disponibilite.models';
import { MOCK_SEMAINE } from '../data/mock-data';

@Component({
  selector: 'app-creneaux',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent],
  templateUrl: './creneaux.component.html',
  styleUrls: ['./creneaux.component.css'],
})
export class CreneauxComponent {
  semaine = signal<JourSemaineView[]>(MOCK_SEMAINE.map(j => ({ ...j })));
  weekOffset = signal(0);
  showAddModal = false;

  newDate = '2025-07-08';
  newHeure = '14:00';

  readonly weekLabels = [
    'Semaine du 30 juin au 5 juillet',
    'Semaine du 7 au 12 juillet',
    'Semaine du 14 au 19 juillet',
  ];

  get currentWeekLabel(): string {
    return this.weekLabels[Math.abs(this.weekOffset()) % this.weekLabels.length];
  }

  changeWeek(dir: number): void {
    this.weekOffset.update(w => w + dir);
  }

  openAddModal(): void {
    this.showAddModal=true;
  }

  closeAddModal(): void {
    this.showAddModal =false;
  }

  addCreneau(): void {
    console.log(`Ajouter créneau: ${this.newDate} à ${this.newHeure}`);
    this.closeAddModal();
  }

  deleteCreneau(dayIdx: number, slotIdx: number): void {
    this.semaine.update(semaine => {
      const updated = semaine.map((j, i) => {
        if (i === dayIdx) {
          return {
            ...j,
            creneaux: j.creneaux.filter((_, idx) => idx !== slotIdx),
          };
        }
        return j;
      });
      return updated;
    });
  }
}
