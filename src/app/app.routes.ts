import { Routes } from '@angular/router';
import { AuthComponent } from './features/auth/auth.component';
import { SignupMedecinComponent } from './features/auth/signup-medecin/signup-medecin.component';
import { SignupDelegueComponent } from './features/auth/signup-delegue/signup-delegue.component';
import { SignupLaboComponent } from './features/auth/signup-labo/signup-labo.component';
import { VerifierEmailComponent } from './features/auth/verifier-email/verifier-email.component';
import { ChangerMotDePasseComponent } from './features/auth/changer-mot-de-passe/changer-mot-de-passe.component';
import { MedecinLayoutComponent } from './features/medecin/medecin-layout.component';
import { DelegueLayoutComponent } from './features/delegue/delegue-layout.component';
import { AdminLayoutComponent } from './features/admin/admin-layout.component';
import { LaboLayoutComponent } from './features/labo/labo-layout.component';
import { guestGuard, roleGuard, changePasswordGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: 'login', component: AuthComponent, canActivate: [guestGuard] },
  { path: 'inscription/medecin', component: SignupMedecinComponent, canActivate: [guestGuard] },
  { path: 'inscription/delegue', component: SignupDelegueComponent, canActivate: [guestGuard] },
  { path: 'inscription/labo', component: SignupLaboComponent, canActivate: [guestGuard] },
  { path: 'verifier-email', component: VerifierEmailComponent },
  { path: 'changer-mot-de-passe', component: ChangerMotDePasseComponent, canActivate: [changePasswordGuard] },
  { path: 'medecin', component: MedecinLayoutComponent, canActivate: [roleGuard(['MEDECIN'])] },
  { path: 'delegue', component: DelegueLayoutComponent, canActivate: [roleGuard(['DELEGUE'])] },
  { path: 'admin', component: AdminLayoutComponent, canActivate: [roleGuard(['ADMIN'])] },
  { path: 'labo', component: LaboLayoutComponent, canActivate: [roleGuard(['LABO'])] },
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: '**', redirectTo: 'login' },
];
