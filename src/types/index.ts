export interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  status: "sending" | "sent" | "error";
  citations?: Citation[];
}

export interface Citation {
  type: "quran" | "hadith" | "fiqh" | "document";
  reference: string;
  text?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

// Legacy interface for backward compatibility
export interface LegacyChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export interface QuickAction {
  id: string;
  title: string;
  description: string;
  prompt: string;
  icon: React.ComponentType<{ className?: string }>;
  category: "banking" | "investment" | "contracts" | "general";
}

export interface ApiResponse {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
}

export interface ChatResponse {
  message: string;
  citations?: Citation[];
  confidence?: number;
}
