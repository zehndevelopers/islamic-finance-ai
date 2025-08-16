import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";

import { useChatStore } from "@/stores/chatStore";
import { useChat } from "@/hooks/useChat";
import { useSessions } from "@/hooks/useSessions";
import { useMessages } from "@/hooks/useMessages";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { ChatMessages } from "@/components/chat/ChatMessages";
import { ChatInput } from "@/components/chat/ChatInput";

export function ChatMessagesPage() {
  const [inputValue, setInputValue] = useState("");

  const { sessionId } = useParams<{ sessionId: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const { currentSessionId, setCurrentSession } = useChatStore();
  const { sessions, isLoading: isSessionsLoading } = useSessions();
  const { messages, isLoading: isMessagesLoading } = useMessages(
    sessionId || null
  );
  const { sendMessage, isLoading: isSending } = useChat();

  // Set current session from URL parameter
  useEffect(() => {
    if (sessionId && sessionId !== currentSessionId) {
      setCurrentSession(sessionId);
    }
  }, [sessionId, currentSessionId, setCurrentSession]);

  // Handle initial message from welcome page
  useEffect(() => {
    const initialMessage = location.state?.initialMessage;
    if (initialMessage && sessionId) {
      // Send the initial message
      sendMessage({ content: initialMessage, sessionId }).catch((error) =>
        console.error("Failed to send initial message:", error)
      );

      // Clear the state to prevent resending on re-renders
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state?.initialMessage, sessionId, location.pathname]);

  // Redirect to welcome page if session doesn't exist
  useEffect(() => {
    if (
      sessionId &&
      sessions.length > 0 &&
      !sessions.find((s) => s.id === sessionId)
    ) {
      navigate("/");
    }
  }, [sessionId, sessions, navigate]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isSending || !sessionId) return;

    const content = inputValue.trim();
    setInputValue("");

    try {
      await sendMessage({ content, sessionId });
    } catch (error) {
      console.error("Failed to send message:", error);
      // Restore input value on error
      setInputValue(content);
    }
  };

  const handleQuickAction = (prompt: string) => {
    setInputValue(prompt);
  };

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content).then(() => {
      // Could show a toast notification here
      console.log("Message copied:", content);
    });
  };

  // Show loading state while session is being validated
  if (
    !sessionId ||
    (sessions.length > 0 && !sessions.find((s) => s.id === sessionId))
  ) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-islamic-green-600 mx-auto mb-4"></div>
          <p className="text-islamic-green-600">Loading chat session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar />

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-background">
          {/* Messages */}
          <ChatMessages
            messages={messages.map((msg) => ({
              id: msg.id,
              content: msg.content,
              role: msg.role,
              timestamp: new Date(msg.created_at),
              status: "sent" as const,
              citations:
                (msg.metadata as { citations?: any[] })?.citations || [],
            }))}
            isLoading={isSending || isMessagesLoading}
            onCopyMessage={handleCopyMessage}
            onQuickAction={handleQuickAction}
            showWelcome={false}
          />

          {/* Input */}
          <ChatInput
            value={inputValue}
            onChange={setInputValue}
            onSubmit={handleSendMessage}
            isLoading={isSending}
            disabled={isSending}
          />
        </div>
      </div>
    </div>
  );
}
