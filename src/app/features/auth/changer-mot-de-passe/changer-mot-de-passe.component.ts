import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { roleHomePath } from '../../../core/guards/role.guard';

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

  constructor(private authService: AuthService, private router: Router) {}

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
        const role = this.authService.currentUserRole;
        this.router.navigateByUrl(role ? roleHomePath[role] : '/login');
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err?.error?.message ?? `Erreur (status ${err.status}) — voir la console.`;
      },
    });
  }
}
