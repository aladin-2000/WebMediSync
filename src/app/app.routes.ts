import { Routes } from '@angular/router';
import { AuthComponent } from './features/auth/auth.component';
import { MedecinLayoutComponent } from './features/medecin/medecin-layout.component';
import { DelegueLayoutComponent } from './features/delegue/delegue-layout.component';
import { AdminLayoutComponent } from './features/admin/admin-layout.component';
import { LaboPlaceholderComponent } from './features/labo/labo-placeholder.component';
import { guestGuard, roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: 'login', component: AuthComponent, canActivate: [guestGuard] },
  { path: 'medecin', component: MedecinLayoutComponent, canActivate: [roleGuard(['MEDECIN'])] },
  { path: 'delegue', component: DelegueLayoutComponent, canActivate: [roleGuard(['DELEGUE'])] },
  { path: 'admin', component: AdminLayoutComponent, canActivate: [roleGuard(['ADMIN'])] },
  { path: 'labo', component: LaboPlaceholderComponent, canActivate: [roleGuard(['LABO'])] },
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: '**', redirectTo: 'login' },
];
