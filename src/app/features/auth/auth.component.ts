import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { roleHomePath } from '../../core/guards/role.guard';
import { MedecinService } from '../admin/services/medecin.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
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

        this.authService.setCurrentUser(response.data);

        if (response.data.role === 'MEDECIN') {
          this.medecinService.getByUserId(response.data.id).subscribe({
            next: (medecinResponse) => {
              this.isLoading = false;
              if (medecinResponse.success) {
                this.authService.setMedecinId(medecinResponse.data.id);
              }
              this.router.navigateByUrl(roleHomePath[response.data.role]);
            },
            error: (err) => {
              this.isLoading = false;
              console.error('Récupération du profil médecin échouée:', err);
              this.router.navigateByUrl(roleHomePath[response.data.role]);
            },
          });
        } else {
          this.isLoading = false;
          this.router.navigateByUrl(roleHomePath[response.data.role]);
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
