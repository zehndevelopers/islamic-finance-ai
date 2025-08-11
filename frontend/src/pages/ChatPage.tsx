import React from "react";
import { useChatStore } from "@/stores/chatStore";
import { useChat } from "@/hooks/useChat";
import { useSessions } from "@/hooks/useSessions";
import { useMessages } from "@/hooks/useMessages";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { ChatMessages } from "@/components/chat/ChatMessages";
import { ChatInput } from "@/components/chat/ChatInput";
import { cn } from "@/lib/utils";

export function ChatPage() {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const [inputValue, setInputValue] = React.useState("");

  const { user } = useAuth();
  const { currentSessionId, setCurrentSession } = useChatStore();
  const {
    sessions,
    createSession,
    deleteSession,
    isLoading: isSessionsLoading
  } = useSessions();
  const { messages, isLoading: isMessagesLoading } = useMessages(currentSessionId);
  const { sendMessage, isLoading: isSending } = useChat();

  // Create initial session if none exists and user is authenticated
  React.useEffect(() => {
    if (user && sessions.length === 0 && !isSessionsLoading) {
      createSession("New Chat").then((session) => {
        setCurrentSession(session.id);
      });
    }
  }, [user, sessions.length, isSessionsLoading, createSession, setCurrentSession]);

  // Set current session to first available if none selected
  React.useEffect(() => {
    if (user && sessions.length > 0 && !currentSessionId) {
      setCurrentSession(sessions[0].id);
    }
  }, [user, sessions, currentSessionId, setCurrentSession]);

  const handleNewChat = async () => {
    try {
      const session = await createSession("New Chat");
      setCurrentSession(session.id);
    } catch (error) {
      console.error("Failed to create session:", error);
    }
  };

  const handleSelectSession = (sessionId: string) => {
    setCurrentSession(sessionId);
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      await deleteSession(sessionId);
      // If we deleted the current session, switch to another or create new
      if (sessionId === currentSessionId) {
        const remainingSessions = sessions.filter((s) => s.id !== sessionId);
        if (remainingSessions.length > 0) {
          setCurrentSession(remainingSessions[0].id);
        } else {
          setCurrentSession(null);
          await handleNewChat();
        }
      }
    } catch (error) {
      console.error("Failed to delete session:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isSending || !currentSessionId) return;

    const content = inputValue.trim();
    setInputValue("");

    try {
      await sendMessage({ content, sessionId: currentSessionId });
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleQuickAction = (prompt: string) => {
    setInputValue(prompt);
  };

  const handleCopyMessage = (content: string) => {
    // Could show a toast notification here
    console.log("Message copied:", content);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <Header
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
      />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div
          className={cn(
            "transition-all duration-300 ease-in-out",
            sidebarOpen ? "w-80" : "w-0"
          )}
        >
          <Sidebar
            sessions={sessions}
            currentSessionId={currentSessionId || ''}
            onNewChat={handleNewChat}
            onSelectSession={handleSelectSession}
            onDeleteSession={handleDeleteSession}
            className={cn(
              "transition-transform duration-300 ease-in-out",
              sidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}
          />
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-white">
          {/* Messages */}
          <ChatMessages
            messages={messages.map(msg => ({
              id: msg.id,
              content: msg.content,
              role: msg.role,
              timestamp: new Date(msg.created_at),
              status: 'sent' as const,
              citations: (msg.metadata as { citations?: any[] })?.citations || []
            }))}
            isLoading={isSending || isMessagesLoading}
            onCopyMessage={handleCopyMessage}
            onQuickAction={handleQuickAction}
            showWelcome={!messages.length}
          />

          {/* Input */}
          <ChatInput
            value={inputValue}
            onChange={setInputValue}
            onSubmit={handleSendMessage}
            isLoading={isSessionsLoading}
            disabled={!inputValue.trim() || isSending || !currentSessionId}
          />
        </div>
      </div>
    </div>
  );
}
