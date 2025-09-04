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

      <div className="flex flex-col flex-1 p-4 bg-background rounded-xl overflow-hidden">
        <Header />

        <div className="flex flex-col flex-1 items-center justify-center">
          <div className="h-full flex-1 flex flex-col items-center justify-center px-4 py-8">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-medium text-gray-900 dark:text-gray-100 mb-4">
                How Can I help you Today?
              </h1>
            </div>

            <div className="w-full max-w-4xl mb-6">
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
              <div className="flex justify-center space-x-2">
                {QUICK_ACTIONS.map(({ prompt, title, icon: Icon }, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="p-3 text-primary bg-background border border-gray-100 rounded-lg shadow-lg"
                    onClick={() => handleQuickAction(prompt)}
                  >
                    <Icon className="w-4 h-4 mr-2" /> {title}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
