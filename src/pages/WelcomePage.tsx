import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { ChatInput } from "@/components/chat/ChatInput";
import { useSessions } from "@/hooks/useSessions";
import { useChatStore } from "@/stores/chatStore";
import { QUICK_ACTIONS } from "@/lib/constants";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { useChat } from "@/hooks/useChat";

export function WelcomePage() {
  const [inputValue, setInputValue] = useState("");
  const [isCreatingSession, setIsCreatingSession] = useState(false);

  const navigate = useNavigate();
  const { createSession } = useSessions();
  const { setCurrentSession } = useChatStore();
  const { sendMessage } = useChat();

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isCreatingSession) return;

    const content = inputValue.trim();
    setIsCreatingSession(true);

    try {
      // First create a new session
      const session = await createSession("New Chat");
      setCurrentSession(session.id);

      await sendMessage({ content, sessionId: session.id });

      // Navigate to chat page with the new session
      navigate(`/chat/${session.id}`, { state: { initialMessage: content } });
    } catch (error) {
      console.error("Failed to create session:", error);
      setIsCreatingSession(false);
    }
  };

  const handleQuickAction = (prompt: string) => {
    setInputValue(prompt);
  };

  return (
    <div className="h-screen flex space-x-3 p-3 bg-gradient-to-bl from-islamic-green-800 to-islamic-green-300 dark:from-islamic-green-900/10 dark:to-islamic-teal-900/10">
      <Sidebar />

      <div className="flex flex-col flex-1 p-4 bg-background rounded-2xl overflow-hidden">
        <Header />

        <div className="flex flex-col flex-1 items-center justify-center">
          <div className="h-full flex-1 flex flex-col items-center justify-center px-4 py-8">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-islamic-green-800 dark:text-islamic-green-500 mb-4">
                Islamic Finance AI
              </h1>
              <p className="text-lg md:text-xl text-islamic-green-600 dark:text-islamic-green-400/50 max-w-2xl">
                Your intelligent assistant for Islamic finance guidance,
                Sharia-compliant solutions, and financial wisdom.
              </p>
            </div>

            <div className="w-full max-w-4xl mb-12">
              <ChatInput
                value={inputValue}
                onChange={setInputValue}
                onSubmit={handleSendMessage}
                isLoading={isCreatingSession}
                disabled={isCreatingSession}
                placeholder="Ask about Islamic finance..."
                className="border rounded-xl"
              />
            </div>

            <div className="w-full max-w-4xl">
              <p className="text-center text-islamic-green-700 dark:text-islamic-green-400/80 mb-6 font-medium">
                Try asking about:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {QUICK_ACTIONS.map((action, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="h-auto p-4 text-left border-islamic-green-200 hover:border-islamic-green-400 hover:bg-islamic-green-50 dark:border-islamic-green-700/25 dark:hover:bg-islamic-green-900/25 dark:hover:border-islamic-green-700/25 transition-all duration-200"
                    onClick={() => handleQuickAction(action.prompt)}
                  >
                    {action.title}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <div className="text-center py-6 text-sm text-islamic-green-500 dark:text-islamic-green-700/80">
            <p>
              Built with Islamic principles • Sharia-compliant guidance •
              AI-powered insights
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
