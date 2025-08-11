import React from "react";
import { Message } from "@/types";
import { MessageBubble } from "./MessageBubble";
import { ScrollArea } from "@/components/ui/scroll-area";
import { WelcomeMessage } from "./WelcomeMessage";
import { QuickActions } from "./QuickActions";
import { Loader2 } from "lucide-react";

interface ChatMessagesProps {
  messages: Message[];
  isLoading?: boolean;
  onCopyMessage?: (content: string) => void;
  onQuickAction?: (prompt: string) => void;
  showWelcome?: boolean;
}

export function ChatMessages({
  messages,
  isLoading = false,
  onCopyMessage,
  onQuickAction,
  showWelcome = false,
}: ChatMessagesProps) {
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    onCopyMessage?.(content);
  };

  if (showWelcome && messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col">
        <WelcomeMessage />
        <QuickActions
          onActionClick={onQuickAction || (() => {})}
          disabled={isLoading}
        />
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1">
      <div className="min-h-full">
        {/* Messages */}
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            onCopy={handleCopyMessage}
          />
        ))}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-center justify-center p-4">
            <div className="flex items-center gap-2 text-islamic-green-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">AI is thinking...</span>
            </div>
          </div>
        )}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
}
