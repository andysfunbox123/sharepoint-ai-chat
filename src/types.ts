export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface SharePointDocument {
  id: string;
  name: string;
  content: string;
  lastModified: string;
}