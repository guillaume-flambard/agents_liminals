// Types pour la gestion des utilisateurs

export interface User {
  id: number;
  email: string;
  name: string;
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
  is_active: boolean;
}

export interface UserCreate {
  email: string;
  name: string;
  password: string;
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface UserSession {
  id: number;
  email: string;
  name: string;
  isAuthenticated: boolean;
}

export interface AuthResponse {
  success: boolean;
  data?: UserSession;
  error?: string;
}

export interface UserStats {
  totalConsultations: number;
  consultationsByAgent: Record<string, number>;
  recentConsultations: number;
  lastConsultation: string | null;
  joinDate: string;
  dailyLimits: Record<string, number>;
}