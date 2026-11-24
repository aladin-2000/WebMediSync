/**
 * Politique de mot de passe (identique au backend, cf. StrongPasswordValidator) :
 * au moins 10 caractères (pas de maximum), une majuscule, une minuscule,
 * un chiffre et un caractère spécial.
 */
export const PASSWORD_MIN = 10;

export interface PasswordRule {
  cle: 'longueur' | 'majuscule' | 'minuscule' | 'chiffre' | 'special';
  libelle: string;
  /** Formulation pour le message d'erreur (« … doit contenir X »). */
  manque: string;
  ok: boolean;
}

export function passwordRules(password: string | null | undefined): PasswordRule[] {
  const pwd = password ?? '';
  return [
    { cle: 'longueur', libelle: `${PASSWORD_MIN} caractères minimum`, manque: `au moins ${PASSWORD_MIN} caractères`, ok: pwd.length >= PASSWORD_MIN },
    { cle: 'majuscule', libelle: 'Une majuscule (A-Z)', manque: 'une majuscule', ok: /\p{Lu}/u.test(pwd) },
    { cle: 'minuscule', libelle: 'Une minuscule (a-z)', manque: 'une minuscule', ok: /\p{Ll}/u.test(pwd) },
    { cle: 'chiffre', libelle: 'Un chiffre (0-9)', manque: 'un chiffre', ok: /\d/.test(pwd) },
    { cle: 'special', libelle: 'Un caractère spécial (! @ # $ % & * …)', manque: 'un caractère spécial', ok: /[^\p{L}\p{N}]/u.test(pwd) },
  ];
}

export function isStrongPassword(password: string | null | undefined): boolean {
  return passwordRules(password).every((r) => r.ok);
}

/** Message décrivant ce qui manque, ou '' si le mot de passe est conforme. */
export function passwordError(password: string | null | undefined): string {
  const manques = passwordRules(password).filter((r) => !r.ok).map((r) => r.manque);
  if (manques.length === 0) {
    return '';
  }
  const liste = manques.length === 1
    ? manques[0]
    : `${manques.slice(0, -1).join(', ')} et ${manques[manques.length - 1]}`;
  return `Le mot de passe doit contenir ${liste}.`;
}
