import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../core/services/notification.service';
import { NotificationResponse } from '../../../core/models/notification.model';

type NotifFilter = 'toutes' | 'non-lues';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css'],
})
export class NotificationsComponent implements OnInit {
  notifications: NotificationResponse[] = [];
  isLoading = false;
  error = '';
  filtre: NotifFilter = 'toutes';

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.charger();
  }

  charger(): void {
    this.isLoading = true;
    this.error = '';
    this.notificationService.getMesNotifications().subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.notifications = response.data;
        } else {
          this.error = response.message;
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.error = err?.error?.message ?? 'Erreur lors du chargement des notifications.';
      },
    });
  }

  get unreadCount(): number {
    return this.notifications.filter((n) => !n.isRead).length;
  }

  get notificationsAffichees(): NotificationResponse[] {
    return this.filtre === 'non-lues' ? this.notifications.filter((n) => !n.isRead) : this.notifications;
  }

  setFiltre(filtre: NotifFilter): void {
    this.filtre = filtre;
  }

  marquerLue(notif: NotificationResponse): void {
    if (notif.isRead) {
      return;
    }
    this.notificationService.marquerLue(notif.id).subscribe({
      next: () => (notif.isRead = true),
    });
  }

  marquerToutesLues(): void {
    if (this.unreadCount === 0) {
      return;
    }
    this.notificationService.marquerToutesLues().subscribe({
      next: () => this.notifications.forEach((n) => (n.isRead = true)),
    });
  }

  notifIcon(type: NotificationResponse['type']): string {
    switch (type) {
      case 'REALISATION':
        return 'ti-circle-check';
      case 'ANNULATION':
        return 'ti-circle-x';
      case 'ABSENCE':
        return 'ti-user-off';
      case 'CONFLIT':
        return 'ti-alert-triangle';
      case 'RESERVATION':
        return 'ti-calendar-plus';
      case 'PROPOSITION':
        return 'ti-replace';
      default:
        return 'ti-bell';
    }
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
