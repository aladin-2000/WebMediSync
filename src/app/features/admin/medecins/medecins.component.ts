import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../../medecin/shared/modal/modal.component';
import { PaginationComponent } from '../shared/pagination/pagination.component';
import { MedecinService } from '../services/medecin.service';
import { EtablissementService } from '../services/etablissement.service';
import { FonctionOption, MedecinResponse, RegionOption, SpecialiteOption } from '../models/medecin.model';
import { EtablissementResponse } from '../models/etablissement.model';
import { PhoneMaskDirective } from '../../../shared/phone/phone-mask.directive';
import { PhonePipe } from '../../../shared/phone/phone.pipe';
import { phoneError } from '../../../shared/phone/phone.util';
import { EtablissementComboboxComponent } from '../../../shared/etablissement-combobox/etablissement-combobox.component';
import { UserAdminService } from '../services/user.service';
import { PasswordStrengthComponent } from '../../../shared/password/password-strength.component';
import { passwordError } from '../../../shared/password/password-policy';

/** Mot de passe proposé par défaut à la création (modifiable par l'admin). */
const DEFAULT_PASSWORD = 'Medisync@2027';

interface MedecinFormState {
  email: string;
  password: string;
  nom: string;
  prenom: string;
  specialite: string;
  adresseCabinet: string;
  regionId: string;
  telephone: string;
  telephone2: string;
  fonction: string;
  etablissementId: string;
}

type SortKey = 'nom' | 'prenom' | 'email' | 'specialite' | 'fonction' | 'etablissement' | 'adresse' | 'telephone' | 'region' | 'statut';
type FiltreStatut = '' | 'actif' | 'inactif';

/** Valeur spéciale du filtre établissement : médecins sans établissement. */
export const SANS_ETABLISSEMENT = '__aucun__';

function normaliser(s: string | null | undefined): string {
  return (s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

const EMPTY_FORM: MedecinFormState = {
  email: '',
  password: '',
  nom: '',
  prenom: '',
  specialite: '',
  adresseCabinet: '',
  regionId: '',
  telephone: '',
  telephone2: '',
  fonction: '',
  etablissementId: '',
};

@Component({
  selector: 'app-admin-medecins',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent, PaginationComponent, PhoneMaskDirective, PhonePipe, EtablissementComboboxComponent, PasswordStrengthComponent],
  templateUrl: './medecins.component.html',
  styleUrls: ['./medecins.component.css', '../shared/admin-modal-form.css'],
})
export class MedecinsComponent implements OnInit {
  medecins: MedecinResponse[] = [];
  specialites: SpecialiteOption[] = [];
  regions: RegionOption[] = [];
  fonctions: FonctionOption[] = [];
  etablissements: EtablissementResponse[] = [];
  isLoading = false;
  errorMessage = '';
  currentPage = 0;
  pageSize = 10;
  readonly pageSizeOptions = [10, 25, 50];

  // ── Recherche, filtres, tri ──
  readonly sansEtablissement = SANS_ETABLISSEMENT;
  recherche = '';
  filtreSpecialite = '';
  filtreFonction = '';
  filtreRegion = '';
  filtreEtablissement = '';
  filtreStatut: FiltreStatut = '';
  sortKey: SortKey = 'nom';
  sortDir: 'asc' | 'desc' = 'asc';

  showModal = false;
  editingMedecin: MedecinResponse | null = null;
  form: MedecinFormState = { ...EMPTY_FORM };
  formError = '';
  isSaving = false;
  /** Médecin dont le statut actif est en cours de modification. */
  togglingId: string | null = null;
  isLoadingEmail = false;
  /** Création : mot de passe affiché en clair par défaut pour que l'admin le voie bien. */
  showPassword = true;
  /** Email du compte au moment de l'ouverture de la popup (pour ne l'envoyer que s'il change). */
  private emailInitial = '';

  constructor(
    private medecinService: MedecinService,
    private etablissementService: EtablissementService,
    private userAdminService: UserAdminService
  ) {}

  ngOnInit(): void {
    this.loadMedecins();
    this.medecinService.getSpecialites().subscribe({
      next: (response) => {
        if (response.success) {
          this.specialites = response.data;
        }
      },
    });
    this.medecinService.getRegions().subscribe({
      next: (response) => {
        if (response.success) {
          this.regions = response.data;
        }
      },
    });
    this.medecinService.getFonctions().subscribe({
      next: (response) => {
        if (response.success) {
          this.fonctions = response.data;
        }
      },
    });
    this.etablissementService.getAll().subscribe({
      next: (response) => {
        if (response.success) {
          this.etablissements = response.data;
        }
      },
    });
  }

  // ── Recherche / filtres / tri ──

  get filtresActifs(): boolean {
    return !!(this.recherche.trim() || this.filtreSpecialite || this.filtreFonction
      || this.filtreRegion || this.filtreEtablissement || this.filtreStatut);
  }

  get medecinsFiltres(): MedecinResponse[] {
    const mots = normaliser(this.recherche).split(/\s+/).filter(Boolean);

    const liste = this.medecins.filter((m) => {
      if (this.filtreSpecialite && m.specialite !== this.filtreSpecialite) return false;
      if (this.filtreFonction && m.fonction !== this.filtreFonction) return false;
      if (this.filtreRegion && m.regionId !== this.filtreRegion) return false;
      if (this.filtreEtablissement === SANS_ETABLISSEMENT) {
        if (m.etablissementId) return false;
      } else if (this.filtreEtablissement && m.etablissementId !== this.filtreEtablissement) {
        return false;
      }
      if (this.filtreStatut === 'actif' && !m.actif) return false;
      if (this.filtreStatut === 'inactif' && m.actif) return false;

      if (mots.length) {
        const texte = normaliser([
          m.nom, m.prenom, m.email, this.specialiteLibelle(m.specialite), m.fonctionLibelle,
          m.etablissementNom, m.adresseCabinet, m.regionNom, m.telephone, m.telephone2,
        ].filter(Boolean).join(' '));
        if (!mots.every((mot) => texte.includes(mot))) return false;
      }
      return true;
    });

    const dir = this.sortDir === 'asc' ? 1 : -1;
    const cmp = (a: string, b: string) => a.localeCompare(b, 'fr', { sensitivity: 'base', numeric: true });
    return liste.sort((a, b) => {
      const va = this.valeurTri(a);
      const vb = this.valeurTri(b);
      // Les valeurs vides restent toujours en fin de liste
      if (!va && vb) return 1;
      if (va && !vb) return -1;
      return (cmp(va, vb) * dir) || cmp(a.nom, b.nom) || cmp(a.prenom, b.prenom);
    });
  }

  private valeurTri(m: MedecinResponse): string {
    switch (this.sortKey) {
      case 'nom': return m.nom ?? '';
      case 'prenom': return m.prenom ?? '';
      case 'email': return m.email ?? '';
      case 'specialite': return this.specialiteLibelle(m.specialite) ?? '';
      case 'fonction': return m.fonctionLibelle ?? '';
      case 'etablissement': return m.etablissementNom ?? '';
      case 'adresse': return m.adresseCabinet ?? '';
      case 'telephone': return m.telephone ?? '';
      case 'region': return m.regionNom ?? '';
      case 'statut': return m.actif ? 'Actif' : 'Inactif';
    }
  }

  get paginatedMedecins(): MedecinResponse[] {
    const start = this.currentPage * this.pageSize;
    return this.medecinsFiltres.slice(start, start + this.pageSize);
  }

  trierPar(key: SortKey): void {
    if (this.sortKey === key) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortKey = key;
      this.sortDir = 'asc';
    }
    this.currentPage = 0;
  }

  ariaSort(key: SortKey): 'ascending' | 'descending' | 'none' {
    if (this.sortKey !== key) return 'none';
    return this.sortDir === 'asc' ? 'ascending' : 'descending';
  }

  onFiltresChange(): void {
    this.currentPage = 0;
  }

  reinitialiserFiltres(): void {
    this.recherche = '';
    this.filtreSpecialite = '';
    this.filtreFonction = '';
    this.filtreRegion = '';
    this.filtreEtablissement = '';
    this.filtreStatut = '';
    this.currentPage = 0;
  }

  onPageChange(page: number): void {
    this.currentPage = page;
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.currentPage = 0;
  }

  specialiteLibelle(valeur: string): string {
    return this.specialites.find((s) => s.valeur === valeur)?.libelle ?? valeur;
  }

  loadMedecins(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.medecinService.getAdminListe().subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success && response.data) {
          this.medecins = response.data;
          this.currentPage = 0;
        }
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = "Impossible de charger la liste des médecins.";
      },
    });
  }

  openAddModal(): void {
    this.editingMedecin = null;
    this.form = { ...EMPTY_FORM, password: DEFAULT_PASSWORD };
    this.emailInitial = '';
    this.showPassword = true;
    this.formError = '';
    this.showModal = true;
  }

  openEditModal(medecin: MedecinResponse): void {
    this.editingMedecin = medecin;
    this.form = {
      email: '',
      password: '',
      nom: medecin.nom,
      prenom: medecin.prenom,
      specialite: medecin.specialite,
      adresseCabinet: medecin.adresseCabinet ?? '',
      regionId: medecin.regionId ?? '',
      telephone: medecin.telephone ?? '',
      telephone2: medecin.telephone2 ?? '',
      fonction: medecin.fonction ?? '',
      etablissementId: medecin.etablissementId ?? '',
    };
    this.emailInitial = '';
    this.formError = '';
    this.showModal = true;

    // L'email est porté par le compte utilisateur, pas par le profil médecin
    this.isLoadingEmail = true;
    this.userAdminService.getById(medecin.userId).subscribe({
      next: (response) => {
        this.isLoadingEmail = false;
        if (response.success && this.editingMedecin?.id === medecin.id) {
          this.emailInitial = response.data.email;
          if (!this.form.email) {
            this.form.email = response.data.email;
          }
        }
      },
      error: () => {
        this.isLoadingEmail = false;
        this.formError = "Impossible de charger l'email du médecin.";
      },
    });
  }

  closeModal(): void {
    this.showModal = false;
  }

  onSubmit(): void {
    const telError = phoneError(this.form.telephone, this.form.telephone2);
    if (telError) {
      this.formError = telError;
      return;
    }

    this.formError = '';

    if (!this.form.nom || !this.form.prenom || !this.form.specialite || !this.form.fonction || !this.form.telephone) {
      this.formError = 'Nom, prénom, spécialité, fonction et le numéro de téléphone sont obligatoires.';
      return;
    }

    this.form.email = this.form.email.trim();
    if (!this.form.email) {
      this.formError = "L'email est obligatoire.";
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.form.email)) {
      this.formError = "L'adresse email est invalide.";
      return;
    }
    const pwdError = this.editingMedecin ? '' : passwordError(this.form.password);
    if (pwdError) {
      this.formError = pwdError;
      return;
    }

    if (this.editingMedecin) {
      this.updateMedecin(this.editingMedecin.id);
    } else {
      this.createMedecin();
    }
  }

  private createMedecin(): void {
    this.isSaving = true;
    this.medecinService
      .create({
        email: this.form.email,
        password: this.form.password,
        nom: this.form.nom,
        prenom: this.form.prenom,
        specialite: this.form.specialite,
        adresseCabinet: this.form.adresseCabinet || undefined,
        regionId: this.form.regionId || undefined,
        telephone: this.form.telephone,
        telephone2: this.form.telephone2.trim() || undefined,
        fonction: this.form.fonction,
        etablissementId: this.form.etablissementId || undefined,
      })
      .subscribe({
        next: (response) => {
          this.isSaving = false;
          if (response.success && response.data) {
            // La réponse de création ne contient pas les infos du compte : on les complète
            this.medecins.push({ ...response.data, email: this.form.email, actif: true });
            this.showModal = false;
          } else {
            this.formError = response.message;
          }
        },
        error: (err) => {
          this.isSaving = false;
          this.formError = err?.error?.message ?? 'Erreur lors de la création.';
        },
      });
  }

  private updateMedecin(id: string): void {
    this.isSaving = true;
    this.medecinService
      .update(id, {
        email: this.form.email !== this.emailInitial ? this.form.email : undefined,
        nom: this.form.nom,
        prenom: this.form.prenom,
        specialite: this.form.specialite,
        adresseCabinet: this.form.adresseCabinet || undefined,
        regionId: this.form.regionId || undefined,
        telephone: this.form.telephone,
        // '' envoyé explicitement pour permettre d'effacer ces champs facultatifs
        telephone2: this.form.telephone2.trim(),
        fonction: this.form.fonction,
        etablissementId: this.form.etablissementId,
      })
      .subscribe({
        next: (response) => {
          this.isSaving = false;
          if (response.success && response.data) {
            const updated = response.data;
            const index = this.medecins.findIndex((m) => m.id === id);
            if (index !== -1) {
              // Conserve le statut du compte, met à jour l'email saisi
              this.medecins[index] = { ...updated, email: this.form.email, actif: this.medecins[index].actif };
            }
            this.showModal = false;
          } else {
            this.formError = response.message;
          }
        },
        error: (err) => {
          this.isSaving = false;
          this.formError = err?.error?.message ?? 'Erreur lors de la modification.';
        },
      });
  }

  deleteMedecin(medecin: MedecinResponse): void {
    const confirmed = confirm(`Supprimer le profil de ${medecin.prenom} ${medecin.nom} ?`);
    if (!confirmed) {
      return;
    }

    this.medecinService.delete(medecin.id).subscribe({
      next: (response) => {
        if (response.success) {
          this.medecins = this.medecins.filter((m) => m.id !== medecin.id);
        }
      },
      error: () => {
        this.errorMessage = 'Erreur lors de la suppression.';
      },
    });
  }

  /** Active / désactive le compte utilisateur du médecin (attribut isActive du User). */
  basculerActif(medecin: MedecinResponse): void {
    const activer = !medecin.actif;
    const action = activer ? 'Activer' : 'Désactiver';
    if (!confirm(`${action} le compte de Dr. ${medecin.prenom} ${medecin.nom} ?`
      + (activer ? '' : '\n\nLe médecin ne pourra plus se connecter.'))) {
      return;
    }
    this.togglingId = medecin.id;
    this.errorMessage = '';
    const appel = activer
      ? this.userAdminService.activer(medecin.userId)
      : this.userAdminService.desactiver(medecin.userId);
    appel.subscribe({
      next: (response) => {
        this.togglingId = null;
        if (response.success) {
          medecin.actif = response.data.isActive;
        } else {
          this.errorMessage = response.message;
        }
      },
      error: (err) => {
        this.togglingId = null;
        this.errorMessage = err?.error?.message ?? `Erreur lors de l'action « ${action} ».`;
      },
    });
  }

  hardDeleteMedecin(medecin: MedecinResponse): void {
    const confirmed = confirm(
      `⚠️ SUPPRESSION DÉFINITIVE ⚠️\n\nSupprimer définitivement ${medecin.prenom} ${medecin.nom} ?\n\nCette action est irréversible : le compte, les créneaux et tous les rendez-vous seront supprimés.`
    );
    if (!confirmed) {
      return;
    }

    this.medecinService.hardDelete(medecin.id).subscribe({
      next: (response) => {
        if (response.success) {
          this.medecins = this.medecins.filter((m) => m.id !== medecin.id);
        }
      },
      error: () => {
        this.errorMessage = 'Erreur lors de la suppression définitive.';
      },
    });
  }
}
