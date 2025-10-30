/**
 * File validation utilities for secure file uploads
 */

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_FILES = 10;

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate a single image file
 */
export const validateImageFile = (file: File): FileValidationResult => {
  // Check file type
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Type de fichier non autorisé. Formats acceptés: JPG, PNG, WEBP`,
    };
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `Fichier trop volumineux. Taille maximale: ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
    };
  }

  return { valid: true };
};

/**
 * Validate multiple image files
 */
export const validateImageFiles = (
  files: File[], 
  existingCount: number = 0
): FileValidationResult => {
  // Check total count
  if (existingCount + files.length > MAX_FILES) {
    return {
      valid: false,
      error: `Maximum ${MAX_FILES} images autorisées`,
    };
  }

  // Validate each file
  for (const file of files) {
    const result = validateImageFile(file);
    if (!result.valid) {
      return result;
    }
  }

  return { valid: true };
};

/**
 * Sanitize filename to prevent path traversal attacks
 */
export const sanitizeFileName = (fileName: string): string => {
  return fileName
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Remove special chars
    .replace(/\.{2,}/g, '.') // Remove multiple dots
    .substring(0, 100); // Limit length
};
