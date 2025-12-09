export enum Subject {
  // Math
  CALCULUS = 'Calculus',
  LINEAR_ALGEBRA = 'Linear Algebra',
  PROB_STAT = 'Probability & Statistics',
  GEOMETRY = 'Geometry',
  
  // CS
  DLD = 'Digital Logic Design',
  AI_ALGO = 'AI & Algorithms',
  DATA_SCIENCE = 'Data Science',
  
  // General
  SCIENCE = 'General Science'
}

export type MessageRole = 'user' | 'model';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  imageUrl?: string;
  timestamp: Date;
  isThinking?: boolean;
}

export interface AnalysisState {
  isLoading: boolean;
  error: string | null;
}

export interface UploadFile {
  file: File;
  previewUrl: string;
}