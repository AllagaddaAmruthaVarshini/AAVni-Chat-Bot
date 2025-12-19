
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isNews?: boolean;
  links?: Array<{ title: string; uri: string }>;
}

export interface NewsHeadline {
  title: string;
  description: string;
  source?: string;
}
