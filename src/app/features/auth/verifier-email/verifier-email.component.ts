import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

type VerifState = 'loading' | 'success' | 'error' | 'missing';

@Component({
  selector: 'app-verifier-email',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './verifier-email.component.html',
  styleUrls: ['./verifier-email.component.css'],
})
export class VerifierEmailComponent implements OnInit {
  state: VerifState = 'loading';
  errorMessage = '';

  resendEmail = '';
  isResending = false;
  resendDone = false;
  resendError = '';

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (!token) {
      this.state = 'missing';
      return;
    }

    this.authService.verifierEmail(token).subscribe({
      next: (response) => {
        if (response.success) {
          this.state = 'success';
        } else {
          this.state = 'error';
          this.errorMessage = response.message;
        }
      },
      error: (err) => {
        this.state = 'error';
        this.errorMessage = err?.error?.message ?? 'Erreur lors de la vérification de votre email.';
      },
    });
  }

  renvoyer(): void {
    if (!this.resendEmail) {
      this.resendError = 'Veuillez saisir votre email.';
      return;
    }
    this.isResending = true;
    this.resendError = '';
    this.authService.renvoyerVerification(this.resendEmail).subscribe({
      next: (response) => {
        this.isResending = false;
        if (response.success) {
          this.resendDone = true;
        } else {
          this.resendError = response.message;
        }
      },
      error: (err) => {
        this.isResending = false;
        this.resendError = err?.error?.message ?? "Erreur lors du renvoi de l'email.";
      },
    });
  }
}
