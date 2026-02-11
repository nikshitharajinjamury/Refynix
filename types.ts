
export enum Language {
  Python = 'python',
  JavaScript = 'javascript',
  TypeScript = 'typescript',
  Java = 'java',
  CPP = 'cpp',
  Go = 'go',
  Rust = 'rust'
}

export enum Severity {
  Critical = 'Critical',
  High = 'High',
  Medium = 'Medium',
  Low = 'Low'
}

export enum Category {
  Security = 'Security',
  Performance = 'Performance',
  Maintainability = 'Maintainability',
  Bug = 'Bug',
  BestPractice = 'Best Practice'
}

export interface CodeIssue {
  id: string;
  category: Category;
  severity: Severity;
  title: string;
  description: string;
  line: number;
  suggestion: string;
}

export interface ImpactAssessment {
  metric: string;
  before: number;
  after: number;
  unit: string;
  improvement: string;
}

export interface ReviewResult {
  issues: CodeIssue[];
  optimizedCode: string;
  scores: {
    security: number;
    performance: number;
    maintainability: number;
    quality: number;
  };
  impacts: ImpactAssessment[];
  summary: string;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  code: string;
  language: Language;
  result: ReviewResult;
}

export interface UserRecord {
  email: string;
  name: string;
  verified: boolean;
}

export interface VirtualEmail {
  id: string;
  from: string;
  subject: string;
  body: string;
  time: string;
  code: string;
}

export interface UserSettings {
  displayName: string;
  preferredLanguages: Language[];
  codingStyle: 'Standard' | 'Airbnb' | 'Google' | 'Functional';
  aiProvider: 'Lovable AI (Gemini)' | 'OpenAI' | 'Anthropic';
  darkMode: boolean;
}

export type View = 'dashboard' | 'analytics' | 'settings';

export interface ReviewState {
  code: string;
  language: Language;
  isAnalyzing: boolean;
  result: ReviewResult | null;
  error: string | null;
  history: HistoryItem[];
  currentView: View;
  settings: UserSettings;
}
