import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { roleHomePath } from '../../core/guards/role.guard';

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

  constructor(private authService: AuthService, private router: Router) {}

  onLogin() {
    this.errorMessage = '';
    if (!this.email || !this.password) {
      this.errorMessage = 'Veuillez remplir tous les champs.';
      return;
    }

    this.isLoading = true;
    this.authService.login(this.email, this.password).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.authService.setCurrentUser(response.data);
          this.router.navigateByUrl(roleHomePath[response.data.role]);
        } else {
          this.errorMessage = response.message;
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
