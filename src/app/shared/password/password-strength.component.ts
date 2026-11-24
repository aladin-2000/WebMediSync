import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PasswordRule, passwordRules } from './password-policy';

/**
 * Indicateur affiché sous un champ « nouveau mot de passe » :
 * barre de force + liste des critères (✓ respecté / ○ manquant), mise à jour à la frappe.
 * <app-password-strength [password]="password"></app-password-strength>
 */
@Component({
  selector: 'app-password-strength',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './password-strength.component.html',
  styleUrls: ['./password-strength.component.css'],
})
export class PasswordStrengthComponent {
  @Input() password: string | null | undefined = '';

  get regles(): PasswordRule[] {
    return passwordRules(this.password);
  }

  get nbOk(): number {
    return this.regles.filter((r) => r.ok).length;
  }

  get niveau(): 'faible' | 'moyen' | 'fort' {
    const n = this.nbOk;
    if (n === this.regles.length) return 'fort';
    return n >= 3 ? 'moyen' : 'faible';
  }

  get niveauLibelle(): string {
    return { faible: 'Faible', moyen: 'Moyen', fort: 'Robuste' }[this.niveau];
  }
}
