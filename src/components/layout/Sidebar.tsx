import React from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatSession } from "@/types";
import { formatTimestamp, truncateText } from "@/lib/utils";
import { Plus, MessageSquare, Trash2, Settings, MoonStar } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  sessions: ChatSession[];
  currentSessionId: string;
  onNewChat: () => void;
  onSelectSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
  className?: string;
  isLoading?: boolean;
}

export function Sidebar({
  sessions,
  currentSessionId,
  onNewChat,
  onSelectSession,
  onDeleteSession,
  className,
}: // isLoading = false,
SidebarProps) {
  const [hoveredSession, setHoveredSession] = React.useState<string | null>(
    null
  );

  return (
    <div
      className={cn(
        "h-full w-80 bg-white border-r border-islamic-green-200 flex flex-col",
        className
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-islamic-green-200">
        <Button onClick={onNewChat} className="w-full" variant="islamic">
          <Plus className="w-4 h-4 mr-2" />
          New Chat
        </Button>
      </div>

      {/* Chat Sessions */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {sessions.length === 0 ? (
            <div className="text-center py-8 text-islamic-green-500">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No conversations yet</p>
              <p className="text-xs opacity-75">Start a new chat to begin</p>
            </div>
          ) : (
            <div className="space-y-1">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className={cn(
                    "group relative rounded-lg p-3 cursor-pointer transition-all duration-200",
                    "hover:bg-islamic-green-50",
                    currentSessionId === session.id
                      ? "bg-islamic-green-100 border border-islamic-green-300"
                      : "hover:bg-islamic-green-50"
                  )}
                  onClick={() => onSelectSession(session.id)}
                  onMouseEnter={() => setHoveredSession(session.id)}
                  onMouseLeave={() => setHoveredSession(null)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3
                        className={cn(
                          "font-medium text-sm mb-1 truncate",
                          currentSessionId === session.id
                            ? "text-islamic-green-800"
                            : "text-gray-800"
                        )}
                      >
                        {truncateText(session.title, 30)}
                      </h3>
                      <div className="text-xs text-islamic-green-600">
                        {formatTimestamp(new Date(session.updated_at))}
                      </div>
                    </div>

                    {/* Actions */}
                    {(hoveredSession === session.id ||
                      currentSessionId === session.id) && (
                      <div className="flex items-center gap-1 ml-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteSession(session.id);
                          }}
                        >
                          <Trash2 className="w-3 h-3 text-red-500" />
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Message count indicator */}
                  {/* {session.messages.length > 0 && (
                    <div className="absolute top-2 right-2">
                      <span className="inline-flex items-center justify-center w-5 h-5 text-xs bg-islamic-green-200 text-islamic-green-700 rounded-full">
                        {session.messages.length}
                      </span>
                    </div>
                  )} */}
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-islamic-green-200">
        <Button
          variant="ghost"
          className="w-full justify-start text-islamic-green-600"
        >
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </Button>
      </div>
    </div>
  );
}
