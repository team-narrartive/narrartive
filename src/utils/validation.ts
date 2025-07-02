
import DOMPurify from 'dompurify';

// Input validation schemas
export const VALIDATION_RULES = {
  story: {
    title: { minLength: 1, maxLength: 100 },
    description: { minLength: 1, maxLength: 500 },
    content: { minLength: 10, maxLength: 50000 }
  },
  character: {
    name: { minLength: 1, maxLength: 50 },
    attribute: { minLength: 1, maxLength: 200 }
  },
  user: {
    firstName: { minLength: 1, maxLength: 50 },
    lastName: { minLength: 1, maxLength: 50 },
    email: { minLength: 5, maxLength: 254 }
  }
};

// Password validation rules
export const PASSWORD_RULES = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true
};

// Common password blacklist
const COMMON_PASSWORDS = [
  'password', '123456', '123456789', 'qwerty', 'abc123', 'password123',
  'admin', 'letmein', 'welcome', 'monkey', '1234567890'
];

export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (password.length < PASSWORD_RULES.minLength) {
    errors.push(`Password must be at least ${PASSWORD_RULES.minLength} characters long`);
  }

  if (PASSWORD_RULES.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (PASSWORD_RULES.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (PASSWORD_RULES.requireNumbers && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (PASSWORD_RULES.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  if (COMMON_PASSWORDS.includes(password.toLowerCase())) {
    errors.push('This password is too common. Please choose a stronger password');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const getPasswordStrength = (password: string): 'weak' | 'medium' | 'strong' => {
  let score = 0;
  
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;
  if (password.length >= 16) score++;

  if (score <= 3) return 'weak';
  if (score <= 5) return 'medium';
  return 'strong';
};

export const sanitizeHtml = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
    ALLOWED_ATTR: []
  });
};

export const validateInput = (
  value: string,
  rules: { minLength: number; maxLength: number },
  fieldName: string
): { isValid: boolean; error?: string } => {
  if (value.length < rules.minLength) {
    return {
      isValid: false,
      error: `${fieldName} must be at least ${rules.minLength} characters long`
    };
  }

  if (value.length > rules.maxLength) {
    return {
      isValid: false,
      error: `${fieldName} must be no more than ${rules.maxLength} characters long`
    };
  }

  return { isValid: true };
};

export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};
