export interface Config {
  app_name: string;
  language: 'hinglish' | 'english' | 'hindi';
  theme: 'dark';
  voice_enabled: boolean;
  memory_enabled: boolean;
  personality: string;
}

export interface Message {
  id: string;
  sender: 'user' | 'cyber';
  text: string;
  timestamp: string;
  isVoiceInput?: boolean;
}

export interface Memory {
  id?: number;
  user_input: string;
  ai_response: string;
  created_at?: string;
}
