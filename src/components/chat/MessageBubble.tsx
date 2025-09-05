import React from "react";
import { Message } from "@/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatTimestamp, isRTL, formatCitation } from "@/lib/utils";
import { Copy, User, Bot, Check, AlertCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import AIAvatar from "@/assets/images/ai-avatar.png";

interface MessageBubbleProps {
  message: Message;
  onCopy?: (content: string) => void;
}

export function MessageBubble({ message, onCopy }: MessageBubbleProps) {
  const [copied, setCopied] = React.useState(false);
  const isUser = message.role === "user";
  const isRtl = isRTL(message.content);

  const handleCopy = () => {
    if (onCopy) {
      onCopy(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getStatusIcon = () => {
    switch (message.status) {
      case "sending":
        return <Clock className="w-3 h-3 text-islamic-gold-500 animate-spin" />;
      case "sent":
        return <Check className="w-3 h-3 text-islamic-green-500" />;
      case "error":
        return <AlertCircle className="w-3 h-3 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div
      className={cn(
        "flex gap-3 p-4 pb-8 group transition-colors",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      <Avatar className={cn("w-8 h-8 shrink-0")}>
        <AvatarFallback
          className={cn(
            "bg-gradient-to-b from-islamic-green-600 to-islamic-green-800 text-islamic-green-100"
          )}
        >
          {isUser ? (
            <User className="w-4 h-4" />
          ) : (
            <img src={AIAvatar} className="w-4 h-4" />
          )}
        </AvatarFallback>
      </Avatar>

      {/* Message Content */}
      <div
        className={cn("flex-1 min-w-0", isUser ? "text-right" : "text-left")}
      >
        {/* Message Header */}
        <div
          className={cn(
            "flex items-center gap-2 mb-1",
            isUser ? "justify-end" : "justify-start"
          )}
        >
          <span
            className={cn(
              "text-sm font-medium text-islamic-green-800 dark:text-islamic-green-50",
              isUser ? "" : "text-gray-800 dark:text-gray-200"
            )}
          >
            {isUser ? "You" : "IMF AI"}
          </span>
          <span className="text-xs text-gray-400 dark:text-gray-600">
            {formatTimestamp(message.timestamp)}
          </span>
          {getStatusIcon()}
        </div>

        {/* Message Bubble */}
        <div
          className={cn(
            "relative inline-block max-w-3xl rounded-2xl px-4 py-3",
            isUser
              ? "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 ml-auto"
              : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 ml-auto",
            isRtl && "text-right font-arabic"
          )}
        >
          {/* Message Text */}
          <div
            className={cn(
              "prose prose-sm max-w-none",
              isUser
                ? "prose-invert"
                : "prose-islamic-green prose-headings:text-islamic-green-800"
            )}
          >
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>

          {/* Citations */}
          {message.citations && message.citations.length > 0 && (
            <div className="mt-3 pt-3 border-t border-islamic-green-100">
              <div className="text-xs font-medium text-islamic-green-700 mb-2">
                References:
              </div>
              <div className="space-y-1">
                {message.citations.map((citation, index) => (
                  <div
                    key={index}
                    className="text-xs text-islamic-green-600 bg-islamic-green-50 rounded px-2 py-1"
                  >
                    {formatCitation(citation)}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Copy Button */}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "absolute -bottom-7 w-6 h-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-islamic-green-700/10",
              isUser ? "right-0" : "left-0"
            )}
            onClick={handleCopy}
          >
            {copied ? (
              <Check className="w-3 h-3" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
