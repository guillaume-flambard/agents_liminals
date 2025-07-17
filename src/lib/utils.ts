import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatTime(date: string | Date): string {
  return new Date(date).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export function getAgentColors(agentType: string) {
  const colors = {
    accordeur: {
      primary: '#5dade2',
      secondary: '#bb8fce',
      background: '#0c1426',
      surface: '#1a252f',
      border: 'rgba(93, 173, 226, 0.6)',
    },
    peseur: {
      primary: '#e67e22',
      secondary: '#f39c12',
      background: '#2c1810',
      surface: '#3d2817',
      border: 'rgba(230, 126, 34, 0.6)',
    },
    denoueur: {
      primary: '#e74c3c',
      secondary: '#c0392b',
      background: '#2c1618',
      surface: '#3d1f21',
      border: 'rgba(231, 76, 60, 0.6)',
    },
    evideur: {
      primary: '#f1c40f',
      secondary: '#f39c12',
      background: '#2c2416',
      surface: '#3d3120',
      border: 'rgba(241, 196, 15, 0.6)',
    },
    habitant: {
      primary: '#9b59b6',
      secondary: '#8e44ad',
      background: '#1f1626',
      surface: '#2b1f33',
      border: 'rgba(155, 89, 182, 0.6)',
    },
  };

  return colors[agentType as keyof typeof colors] || colors.accordeur;
}

export function getAgentIcon(agentType: string): string {
  const icons = {
    accordeur: '🎵',
    peseur: '⚖️',
    denoueur: '🔗',
    evideur: '💡',
    habitant: '🕳️',
  };

  return icons[agentType as keyof typeof icons] || '🎭';
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Le mot de passe doit contenir au moins 8 caractères');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une majuscule');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une minuscule');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins un chiffre');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function generateSessionId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}