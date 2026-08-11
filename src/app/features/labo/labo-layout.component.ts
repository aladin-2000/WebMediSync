import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from './shared/sidebar/sidebar.component';
import { HomeComponent } from './home/home.component';
import { DeleguesComponent } from './delegues/delegues.component';

export type LaboPageName = 'home' | 'delegues';

@Component({
  selector: 'app-labo-layout',
  standalone: true,
  imports: [CommonModule, SidebarComponent, HomeComponent, DeleguesComponent],
  templateUrl: './labo-layout.component.html',
  styleUrls: ['./labo-layout.component.css'],
})
export class LaboLayoutComponent {
  activePage: LaboPageName = 'home';

  onPageChange(page: string): void {
    this.activePage = page as LaboPageName;
  }
}
