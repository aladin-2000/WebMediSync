import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class NotificationSoundService {
  private audio: HTMLAudioElement | null = null;

  play(): void {
    if (!this.audio) {
      this.audio = new Audio('assets/sounds/notification.wav');
    }
    this.audio.currentTime = 0;
    this.audio.play().catch(() => {});
  }
}
