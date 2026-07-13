import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

// ============================================
// MODAL - Popup/Fenetre modale
// Simple: apparait quand visible=true, disparait au close
// ============================================

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css'],
})
export class ModalComponent {
  // Ce qu'on reçoit du composant parent
  @Input() title = '';
  @Input() visible = false;

  // Ce qu'on envoie au parent
  @Output() close = new EventEmitter<void>();

  // Quand on clique sur le fond gris, on ferme
  onOverlayClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (target.classList.contains('overlay')) {
      this.close.emit();
    }
  }
}
