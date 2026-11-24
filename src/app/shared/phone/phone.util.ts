/** Nombre de chiffres d'un numéro de téléphone (format tunisien, sans indicatif). */
export const PHONE_LENGTH = 8;

/**
 * Ne garde que les chiffres, retire un éventuel indicatif +216 / 00216
 * (anciens numéros saisis avant le masque) et tronque à 8 chiffres.
 */
export function normalizePhone(value: string | null | undefined): string {
  let digits = (value ?? '').replace(/\D/g, '');
  if (digits.length > PHONE_LENGTH) {
    if (digits.startsWith('00216')) {
      digits = digits.slice(5);
    } else if (digits.startsWith('216')) {
      digits = digits.slice(3);
    }
  }
  return digits.slice(0, PHONE_LENGTH);
}

/** Affichage avec le masque « XX XXX XXX ». */
export function formatPhone(value: string | null | undefined): string {
  const d = normalizePhone(value);
  return [d.slice(0, 2), d.slice(2, 5), d.slice(5, 8)].filter(Boolean).join(' ');
}

/** Vide (champ facultatif) ou exactement 8 chiffres. */
export function isValidPhone(value: string | null | undefined): boolean {
  const v = (value ?? '').trim();
  return v === '' || new RegExp(`^\\d{${PHONE_LENGTH}}$`).test(v);
}

/** Message d'erreur si l'un des numéros fournis est incomplet, sinon ''. */
export function phoneError(...values: (string | null | undefined)[]): string {
  return values.every(isValidPhone)
    ? ''
    : `Le numéro de téléphone doit contenir exactement ${PHONE_LENGTH} chiffres.`;
}
