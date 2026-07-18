import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-labo-placeholder',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="placeholder-page">
      <h2>Espace Laboratoire</h2>
      <p>Cet espace n'est pas encore disponible.</p>
    </div>
  `,
  styles: [
    `
      .placeholder-page {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100vh;
        gap: 8px;
        color: #495057;
      }
    `,
  ],
})
export class LaboPlaceholderComponent {}
