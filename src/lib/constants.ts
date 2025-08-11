import { QuickAction } from "@/types";

export const QUICK_ACTIONS: QuickAction[] = [
  {
    id: "1",
    title: "Qard Hasan",
    description: "Learn about interest-free loans in Islamic finance",
    prompt:
      "Explain the concept of Qard Hasan and its applications in modern Islamic banking",
    icon: "HelpingHand",
    category: "banking",
  },
  {
    id: "2",
    title: "Mudaraba Investment",
    description: "Profit-sharing investment partnerships",
    prompt: "What is Mudaraba and how does it work in Islamic investment?",
    icon: "TrendingUp",
    category: "investment",
  },
  {
    id: "3",
    title: "Musharaka Partnership",
    description: "Joint venture financing in Islamic finance",
    prompt:
      "Explain Musharaka partnership and its structure in Islamic finance",
    icon: "Users",
    category: "investment",
  },
  {
    id: "4",
    title: "Ijara Leasing",
    description: "Islamic leasing and rental agreements",
    prompt: "How does Ijara work in Islamic finance and what are its benefits?",
    icon: "Building",
    category: "contracts",
  },
  {
    id: "5",
    title: "Sukuk Bonds",
    description: "Islamic bonds and securities",
    prompt:
      "What are Sukuk bonds and how do they differ from conventional bonds?",
    icon: "FileText",
    category: "investment",
  },
  {
    id: "6",
    title: "Halal Investment",
    description: "Sharia-compliant investment guidelines",
    prompt: "What makes an investment halal according to Islamic principles?",
    icon: "Shield",
    category: "investment",
  },
];

export const WELCOME_MESSAGE = `Welcome to Islamic Finance AI! 🌙

I'm your expert consultant specializing in Islamic finance and Sharia principles. I can help you with:
• Islamic Banking - Qard Hasan, Mudaraba, Musharaka
• Halal Investments - Sukuk, Sharia-compliant portfolios
• Islamic Contracts - Ijara, Salam, Istisna
• Fiqh Guidance - Religious rulings on financial matters

How can I assist you today?`;

export const API_ENDPOINTS = {
  CHAT: "/api/chat",
  UPLOAD_DOCUMENT: "/api/upload-doc",
};

export const STORAGE_KEYS = {
  CURRENT_SESSION: "islamic-fin-ai-current-session",
  USER_PREFERENCES: "islamic-fin-ai-preferences",
  THEME: "islamic-fin-ai-theme",
} as const;
