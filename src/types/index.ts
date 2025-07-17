// User Types
export interface User {
  _id: string;
  username: string;
  email: string;
  profile: {
    firstName?: string;
    lastName?: string;
    bio?: string;
    preferences: {
      theme: 'dark' | 'light' | 'auto';
      language: 'fr' | 'en';
      notifications: {
        email: boolean;
        push: boolean;
      };
    };
  };
  subscription: {
    type: 'free' | 'premium';
    expiresAt?: Date;
    dailyConsultationLimit: number;
  };
  createdAt: string;
  updatedAt: string;
}

// Agent Types
export interface Agent {
  _id: string;
  name: 'accordeur' | 'peseur' | 'denoueur' | 'evideur' | 'habitant';
  displayName: string;
  description: string;
  territory: string;
  webhookUrl: string;
  config: {
    maxDailyConsultations: number;
    responseFormat: string;
    personality: string;
    isActive: boolean;
    temperature: number;
    maxTokens: number;
  };
  styling: {
    primaryColor: string;
    secondaryColor: string;
    backgroundGradient: string;
    icon: string;
    borderColor: string;
  };
  statistics: {
    totalConsultations: number;
    averageRating: number;
    totalRatings: number;
    lastUsed?: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Consultation Types
export interface ConsultationInput {
  situation: string;
  rituel: string;
}

export interface ConsultationOutput {
  consultation: string;
  signature: string;
  sessionId: string;
  n8nExecutionId?: string;
}

export interface ConsultationRating {
  score: number;
  feedback?: string;
  ratedAt: string;
}

export interface Consultation {
  _id: string;
  userId: string;
  agentType: Agent['name'];
  input: ConsultationInput;
  output?: ConsultationOutput;
  rating?: ConsultationRating;
  metadata: {
    ipAddress: string;
    userAgent: string;
    n8nWebhookUrl: string;
    processingTime?: number;
  };
  status: 'pending' | 'processing' | 'completed' | 'failed';
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

// Daily Limits
export interface DailyLimit {
  _id: string;
  userId: string;
  date: string;
  consultationCounts: {
    total: number;
    accordeur: number;
    peseur: number;
    denoueur: number;
    evideur: number;
    habitant: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ConsultationLimits {
  daily: {
    limit: number;
    used: number;
    remaining: number;
  };
  agents: {
    [key in Agent['name']]: {
      canConsult: boolean;
      remaining: number;
      used: number;
      message: string;
    };
  };
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  details?: any[];
}

export interface ConsultationResponse {
  consultation: Consultation;
  response: {
    consultation: string;
    signature: string;
    sessionId: string;
  };
}

// Form Types
export interface LoginForm {
  username: string;
  password: string;
}

export interface RegisterForm {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ConsultationForm {
  situation: string;
  rituel: string;
}

// Agent Configuration
export interface AgentConfig {
  name: Agent['name'];
  displayName: string;
  description: string;
  territory: string;
  symptom: string;
  ritualSteps: string[];
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    border: string;
  };
  icon: string;
  placeholder: string;
  maxLength: number;
}

// Consultation History
export interface ConsultationHistoryItem {
  id: string;
  agentType: Agent['name'];
  consultation: string;
  signature: string;
  timestamp: string;
  rating?: number;
}

// SWR Keys
export type SWRKey = 
  | '/api/agents'
  | '/api/consultations/limits'
  | '/api/auth/me'
  | `/api/agents/${string}`
  | `/api/consultations/${string}`;