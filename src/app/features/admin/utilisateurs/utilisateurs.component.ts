import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { UserAdminService } from '../services/user.service';
import { UserDetailResponse } from '../models/user.model';

@Component({
  selector: 'app-utilisateurs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './utilisateurs.component.html',
  styleUrls: ['./utilisateurs.component.css'],
})
export class UtilisateursComponent implements OnInit, OnDestroy {
  users: UserDetailResponse[] = [];
  isLoading = false;
  errorMessage = '';

  page = 0;
  size = 10;
  totalPages = 0;
  totalElements = 0;

  roleFilter = '';
  searchTerm = '';

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(private userService: UserAdminService) {}

  ngOnInit(): void {
    this.loadUsers();
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
    ).subscribe((term) => {
      this.searchTerm = term;
      this.page = 0;
      this.loadUsers();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.errorMessage = '';
    const role = this.roleFilter || undefined;
    const search = this.searchTerm || undefined;
    this.userService.getListe(this.page, this.size, role, search).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success && response.data) {
          this.users = response.data.content;
          this.totalPages = response.data.totalPages;
          this.totalElements = response.data.totalElements;
        }
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Impossible de charger la liste des utilisateurs.';
      },
    });
  }

  onSearchInput(value: string): void {
    this.searchSubject.next(value);
  }

  onRoleChange(): void {
    this.page = 0;
    this.loadUsers();
  }

  previousPage(): void {
    if (this.page > 0) {
      this.page--;
      this.loadUsers();
    }
  }

  nextPage(): void {
    if (this.page < this.totalPages - 1) {
      this.page++;
      this.loadUsers();
    }
  }

  toggleActive(user: UserDetailResponse): void {
    if (user.isActive) {
      if (!confirm(`Désactiver le compte de ${user.prenom} ${user.nom} ?`)) return;
      this.userService.desactiver(user.id).subscribe({
        next: (response) => {
          if (response.success && response.data) {
            const idx = this.users.findIndex(u => u.id === user.id);
            if (idx !== -1) this.users[idx] = response.data;
          }
        },
        error: () => { this.errorMessage = 'Erreur lors de la désactivation.'; },
      });
    } else {
      this.userService.activer(user.id).subscribe({
        next: (response) => {
          if (response.success && response.data) {
            const idx = this.users.findIndex(u => u.id === user.id);
            if (idx !== -1) this.users[idx] = response.data;
          }
        },
        error: () => { this.errorMessage = "Erreur lors de l'activation."; },
      });
    }
  }
}
