import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatMois, StatJour } from '../models/disponibilite.models';
import { MOCK_STATS, MOCK_STATS_JOURS } from '../data/mock-data';

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.css'],
})
export class StatsComponent {
  stats: StatMois = MOCK_STATS;
  statsJours: StatJour[] = MOCK_STATS_JOURS;

  getBarHeight(taux: number): number {
    return (taux / 100) * 100;
  }
}
