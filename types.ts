export enum AppState {
  LANDING,
  DASHBOARD,
  PROFILE,
  CREATE_PROJECT,
  CHAT,
  SHOW_RESULT,
  SETTINGS
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AppSettings {
  apiKey: string;
  model: string;
}

export interface UserProfile {
  name: string;
  street: string;
  zipCode: string;
  city: string;
  email: string;
  phone: string;
  companyName: string;
  legalForm: string;
  representative: string;
  ustId: string;
  entityType?: 'private' | 'company'; // 'private' = Privatperson / Einzelunternehmer, 'company' = Unternehmen (z.B. GmbH, GbR)
}

export interface Project {
  id: string;
  name: string;
  url: string;
  projectTypes: string[];
  isCommercial?: boolean;
  impressum: string;
  datenschutzerklaerung: string;
  createdAt: string;
  projectPath?: string;
  detectedServices?: string[];
  codeAnalysisSummary?: string;
  iconDataUrl?: string;
}

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}
