export enum InputMode {
  TEXT = 'TEXT',
  YOUTUBE = 'YOUTUBE'
}

export enum SummaryType {
  CONCISE = 'CONCISE',
  DETAILED = 'DETAILED'
}

export interface ProcessingOptions {
  translate: boolean;
  summarize: boolean;
  summaryType: SummaryType;
}

export interface ProcessingResult {
  translation?: string;
  summary?: string;
  error?: string;
}

export interface FileData {
  name: string;
  content: string;
  type: string;
}