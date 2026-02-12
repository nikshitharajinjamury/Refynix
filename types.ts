
export enum Language {
  Python = 'python',
  JavaScript = 'javascript',
  Java = 'java',
  CPP = 'cpp'
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
  timeComplexity?: string;
  spaceComplexity?: string;
  visualizations?: {
    metrics: any;
    flowchart: string;
    plotly: string;
    ast: any;
    efficiencyScore: number;
  };
}

export interface TestResult {
  description: string;
  passed: boolean;
  actual_output: string;
  error?: string;
}

export interface HistoryItem {
  id: number;
  timestamp: string;
  code: string;
  language: Language;
  result: ReviewResult;
}

export interface UserRecord {
  email: string;
  name: string;
  verified: boolean;
  token?: string;
}

export interface VirtualEmail {
  id: string;
  from: string;
  subject: string;
  body: string;
  time: string;
  code: string;
}

export interface TestCase {
  description: string;
  input: string;
  expected_output: string;
}

export interface InterviewQuestion {
  id: number;
  question: string;
  options?: string[];
  answer: string;
  explanation: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface UserSettings {
  displayName: string;
  preferredLanguages: Language[];
  codingStyle: 'Standard' | 'Airbnb' | 'Google';
  analysisDepth: 'Quick' | 'Detailed';
  emailReports: boolean;
  darkMode: boolean;
}

export type View = 'dashboard' | 'analytics' | 'settings' | 'history' | 'interview';

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
