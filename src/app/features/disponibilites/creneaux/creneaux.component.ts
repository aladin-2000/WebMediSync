import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JourSemaineView } from '../models/disponibilite.models';
import { MOCK_SEMAINE } from '../data/mock-data';

@Component({
  selector: 'app-creneaux',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './creneaux.component.html',
  styleUrls: ['./creneaux.component.css'],
})
export class CreneauxComponent {
  semaine = signal<JourSemaineView[]>(MOCK_SEMAINE.map(j => ({ ...j })));
  weekOffset = signal(0);

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
}
