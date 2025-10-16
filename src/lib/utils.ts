import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  // Pour les millions (>= 1 000 000)
  if (price >= 1000000) {
    const millions = price / 1000000;
    // Si c'est un nombre rond de millions, pas de décimales
    if (millions % 1 === 0) {
      return `${millions.toLocaleString('fr-FR')} millions XOF`;
    }
    // Sinon, 1 décimale maximum
    return `${millions.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} millions XOF`;
  }
  
  // Pour les milliers (>= 10 000)
  if (price >= 10000) {
    const thousands = price / 1000;
    return `${Math.round(thousands)}K XOF`;
  }
  
  // Pour les petits montants
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}
