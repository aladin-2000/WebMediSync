export function toISODate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function lundiDeLaSemaine(d: Date): Date {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  const jour = date.getDay();
  const decalage = jour === 0 ? -6 : 1 - jour;
  date.setDate(date.getDate() + decalage);
  return date;
}

export function dimancheDeLaSemaine(d: Date): Date {
  const lundi = lundiDeLaSemaine(d);
  const dimanche = new Date(lundi);
  dimanche.setDate(dimanche.getDate() + 6);
  return dimanche;
}
