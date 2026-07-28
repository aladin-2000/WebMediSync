import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { roleHomePath } from '../../../core/guards/role.guard';
import { MedecinService } from '../../admin/services/medecin.service';
import { DelegueService } from '../../delegue/services/delegue.service';

@Component({
  selector: 'app-changer-mot-de-passe',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './changer-mot-de-passe.component.html',
  styleUrls: ['./changer-mot-de-passe.component.css']
})
export class ChangerMotDePasseComponent {
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  errorMessage = '';
  isLoading = false;

  constructor(
    private authService: AuthService,
    private medecinService: MedecinService,
    private delegueService: DelegueService,
    private router: Router
  ) {}

  onSubmit() {
    this.errorMessage = '';

    if (!this.currentPassword || !this.newPassword || !this.confirmPassword) {
      this.errorMessage = 'Veuillez remplir tous les champs.';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'Les deux mots de passe ne correspondent pas.';
      return;
    }

    this.isLoading = true;
    this.authService.changePassword(this.currentPassword, this.newPassword).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (!response.success) {
          this.errorMessage = response.message;
          return;
        }
        const user = this.authService.getCurrentUser();
        if (!user) {
          this.router.navigateByUrl('/login');
          return;
        }

        if (user.role === 'MEDECIN') {
          this.medecinService.getByUserId(user.id).subscribe({
            next: (medecinResponse) => {
              if (medecinResponse.success) {
                this.authService.setMedecinId(medecinResponse.data.id);
              }
              this.router.navigateByUrl(roleHomePath[user.role]);
            },
            error: (err) => {
              console.error('Récupération du profil médecin échouée:', err);
              this.router.navigateByUrl(roleHomePath[user.role]);
            },
          });
        } else if (user.role === 'DELEGUE') {
          this.delegueService.getByUserId(user.id).subscribe({
            next: (delegueResponse) => {
              if (delegueResponse.success) {
                this.authService.setDelegueId(delegueResponse.data.id);
              }
              this.router.navigateByUrl(roleHomePath[user.role]);
            },
            error: (err) => {
              console.error('Récupération du profil délégué échouée:', err);
              this.router.navigateByUrl(roleHomePath[user.role]);
            },
          });
        } else {
          this.router.navigateByUrl(roleHomePath[user.role]);
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err?.error?.message ?? `Erreur (status ${err.status}) — voir la console.`;
      },
    });
  }
}
