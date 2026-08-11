import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { roleHomePath, CHANGE_PASSWORD_PATH } from '../../core/guards/role.guard';
import { MedecinService } from '../admin/services/medecin.service';
import { DelegueService } from '../delegue/services/delegue.service';
import { LaboratoireService } from '../../core/services/laboratoire.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent {
  email = '';
  password = '';
  errorMessage = '';
  isLoading = false;

  constructor(
    private authService: AuthService,
    private medecinService: MedecinService,
    private delegueService: DelegueService,
    private laboratoireService: LaboratoireService,
    private router: Router
  ) {}

  onLogin() {
    this.errorMessage = '';
    if (!this.email || !this.password) {
      this.errorMessage = 'Veuillez remplir tous les champs.';
      return;
    }

    this.isLoading = true;
    this.authService.login(this.email, this.password).subscribe({
      next: (response) => {
        if (!response.success) {
          this.isLoading = false;
          this.errorMessage = response.message;
          return;
        }

        const { token, user } = response.data;
        this.authService.setSession(token, user);

        if (user.mustChangePassword) {
          this.isLoading = false;
          this.router.navigateByUrl(CHANGE_PASSWORD_PATH);
          return;
        }

        if (user.role === 'MEDECIN') {
          this.medecinService.getByUserId(user.id).subscribe({
            next: (medecinResponse) => {
              this.isLoading = false;
              if (medecinResponse.success) {
                this.authService.setMedecinId(medecinResponse.data.id);
              }
              this.router.navigateByUrl(roleHomePath[user.role]);
            },
            error: (err) => {
              this.isLoading = false;
              console.error('Récupération du profil médecin échouée:', err);
              this.router.navigateByUrl(roleHomePath[user.role]);
            },
          });
        } else if (user.role === 'DELEGUE') {
          this.delegueService.getByUserId(user.id).subscribe({
            next: (delegueResponse) => {
              this.isLoading = false;
              if (delegueResponse.success) {
                this.authService.setDelegueId(delegueResponse.data.id);
              }
              this.router.navigateByUrl(roleHomePath[user.role]);
            },
            error: (err) => {
              this.isLoading = false;
              console.error('Récupération du profil délégué échouée:', err);
              this.router.navigateByUrl(roleHomePath[user.role]);
            },
          });
        } else if (user.role === 'LABO') {
          this.laboratoireService.getByUserId(user.id).subscribe({
            next: (laboResponse) => {
              this.isLoading = false;
              if (laboResponse.success) {
                this.authService.setLaboratoireId(laboResponse.data.id);
              }
              this.router.navigateByUrl(roleHomePath[user.role]);
            },
            error: (err) => {
              this.isLoading = false;
              console.error('Récupération du profil laboratoire échouée:', err);
              this.router.navigateByUrl(roleHomePath[user.role]);
            },
          });
        } else {
          this.isLoading = false;
          this.router.navigateByUrl(roleHomePath[user.role]);
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Login error:', err);
        this.errorMessage = err?.error?.message ?? `Erreur (status ${err.status}) — voir la console.`;
      },
    });
  }
}
