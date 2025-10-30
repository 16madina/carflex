/**
 * Password validation utilities
 */

export interface PasswordValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validate password strength
 * Requirements:
 * - Minimum 8 characters
 * - At least 1 uppercase letter
 * - At least 1 lowercase letter
 * - At least 1 number
 */
export const validatePassword = (password: string): PasswordValidationResult => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Le mot de passe doit contenir au moins 8 caractères");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Le mot de passe doit contenir au moins une majuscule");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Le mot de passe doit contenir au moins une minuscule");
  }

  if (!/[0-9]/.test(password)) {
    errors.push("Le mot de passe doit contenir au moins un chiffre");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Get password strength level (0-4)
 */
export const getPasswordStrength = (password: string): number => {
  let strength = 0;

  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++; // Special chars

  return Math.min(strength, 4);
};

/**
 * Get password strength label
 */
export const getPasswordStrengthLabel = (strength: number): string => {
  const labels = ["Très faible", "Faible", "Moyen", "Fort", "Très fort"];
  return labels[strength] || "Très faible";
};

/**
 * Get password strength color
 */
export const getPasswordStrengthColor = (strength: number): string => {
  const colors = ["#dc2626", "#ea580c", "#eab308", "#22c55e", "#16a34a"];
  return colors[strength] || "#dc2626";
};
