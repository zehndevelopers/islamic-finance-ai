import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ChevronDown,
  Folder,
  MessageSquare,
  Settings,
  Trash,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { truncateText } from "@/lib/utils";
import { cn } from "@/lib/utils";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { useChatStore } from "@/stores/chatStore";
import { useSessions } from "@/hooks/useSessions";
import LogoImage from "@/assets/images/logo.png";

export function Sidebar() {
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({
    today: true,
    yesterday: true,
    older: true,
  });

  const navigate = useNavigate();
  const { currentSessionId, setCurrentSession } = useChatStore();
  const { sessions, deleteSession } = useSessions();

  // Group sessions by date
  const groupedSessions = sessions.reduce<Record<string, typeof sessions>>(
    (groups, session) => {
      const date = new Date(session.updated_at);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      let group = "older";

      if (date.toDateString() === today.toDateString()) {
        group = "today";
      } else if (date.toDateString() === yesterday.toDateString()) {
        group = "yesterday";
      }

      if (!groups[group]) groups[group] = [];
      groups[group].push(session);
      return groups;
    },
    {}
  );

  const handleNewChat = () => {
    navigate("/");
  };

  const handleSelectSession = (selectedSessionId: string) => {
    setCurrentSession(selectedSessionId);
    navigate(`/chat/${selectedSessionId}`);
  };

  const handleDeleteSession = async (sessionIdToDelete: string) => {
    try {
      await deleteSession(sessionIdToDelete);

      // If we deleted the current session, redirect appropriately
      if (sessionIdToDelete === sessionId) {
        const remainingSessions = sessions.filter(
          (s) => s.id !== sessionIdToDelete
        );
        if (remainingSessions.length > 0) {
          navigate(`/chat/${remainingSessions[0].id}`);
        } else {
          navigate("/");
        }
      }
    } catch (error) {
      console.error("Failed to delete session:", error);
    }
  };

  return (
    <div className="h-full w-[18rem] flex bg-background rounded-3xl shadow-sm overflow-hidden">
      {/* Navigation */}
      <div className="pb-4 px-1 border-r border-gray-100 flex flex-col items-center">
        <div className="w-full h-fit flex justify-center items-center">
          <img src={LogoImage} alt="Logo" className="h-16 object-cover" />
        </div>
        <div className="flex flex-col flex-1 items-center">
          <Button
            variant="ghost"
            className="w-full h-fit flex-col items-center p-2 text-gray-500 hover:text-islamic-green-500 hidden"
          >
            <Folder className="h-5 w-5" />
            <span className="text-xs mt-1">Project</span>
          </Button>

          <Button
            variant="ghost"
            className="w-full h-fit flex flex-col items-center p-2 text-islamic-green-500 bg-transparent hover:bg-transparent"
          >
            <MessageSquare className="h-5 w-5" />
            <span className="text-xs mt-1">Chat</span>
          </Button>
        </div>

        <Button
          variant="ghost"
          className="flex flex-col items-center p-2 text-gray-500 hover:text-islamic-green-500"
        >
          <Settings className="h-5 w-5" />
          <span className="text-xs mt-1"></span>
        </Button>
      </div>

      <div className="w-full h-full flex flex-col">
        {/* Header with Logo */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-b from-primary/50 to-primary">
              IMF AI
            </span>
          </div>
          <div className="h-6 w-6 rounded-md border border-gray-200 flex items-center justify-center">
            {/* Toggle button icon */}
          </div>
        </div>

        {/* New Chat Button */}
        <div className="px-4 pt-4 pb-2">
          <Button
            onClick={handleNewChat}
            className="w-full bg-islamic-green-500 hover:bg-islamic-green-600 text-white rounded-xl h-10"
          >
            <span className="flex-1 text-center">New chat</span>
            <div className="flex bg-islamic-green-600/50 py-0.5 px-2 rounded text-xs">
              <span>Ctrl</span>
              <span className="ml-1">i</span>
            </div>
          </Button>
        </div>

        {/* Chat Sessions */}
        <ScrollArea className="flex-1">
          <div className="px-4 py-2">
            {sessions.length === 0 ? (
              <div className="text-center py-8 text-islamic-green-500">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No conversations yet</p>
                <p className="text-xs opacity-75">Start a new chat to begin</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Today's chats */}
                {groupedSessions.today?.length > 0 && (
                  <div>
                    <div
                      className="flex items-center justify-between mb-2 cursor-pointer"
                      onClick={() =>
                        setExpandedSections((prev) => ({
                          ...prev,
                          today: !prev.today,
                        }))
                      }
                    >
                      <h3 className="font-medium text-base text-gray-800">
                        Today
                      </h3>
                      <div className="flex items-center">
                        <span className="text-sm text-gray-500 mr-1">
                          12 Total
                        </span>
                        <ChevronDown
                          className={`h-4 w-4 text-gray-500 transform transition-transform ${
                            expandedSections.today ? "" : "-rotate-90"
                          }`}
                        />
                      </div>
                    </div>

                    {expandedSections.today && (
                      <div className="space-y-1">
                        {groupedSessions.today.map((session) => (
                          <ContextMenu key={session.id}>
                            <ContextMenuTrigger>
                              <div
                                className={cn(
                                  "py-2 px-2 cursor-pointer rounded-md",
                                  currentSessionId === session.id
                                    ? "bg-islamic-green-100"
                                    : ""
                                )}
                                onClick={() => handleSelectSession(session.id)}
                              >
                                <div className="text-sm text-gray-700">
                                  {truncateText(session.title, 30)}
                                </div>
                              </div>
                            </ContextMenuTrigger>
                            <ContextMenuContent className="w-48">
                              <ContextMenuItem
                                className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleDeleteSession(session.id);
                                }}
                              >
                                <Trash className="h-4 w-4 mr-2" />
                                Delete
                              </ContextMenuItem>
                            </ContextMenuContent>
                          </ContextMenu>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Yesterday's chats */}
                {groupedSessions.yesterday?.length > 0 && (
                  <div>
                    <div
                      className="flex items-center justify-between mb-2 cursor-pointer"
                      onClick={() =>
                        setExpandedSections((prev) => ({
                          ...prev,
                          yesterday: !prev.yesterday,
                        }))
                      }
                    >
                      <h3 className="font-medium text-base text-gray-800">
                        Yesterday
                      </h3>
                      <div className="flex items-center">
                        <span className="text-sm text-gray-500 mr-1">
                          12 Total
                        </span>
                        <ChevronDown
                          className={`h-4 w-4 text-gray-500 transform transition-transform ${
                            expandedSections.yesterday ? "" : "-rotate-90"
                          }`}
                        />
                      </div>
                    </div>

                    {expandedSections.yesterday && (
                      <div className="space-y-1">
                        {groupedSessions.yesterday.map((session) => (
                          <ContextMenu key={session.id}>
                            <ContextMenuTrigger>
                              <div
                                className={cn(
                                  "py-2 px-2 cursor-pointer rounded-md",
                                  currentSessionId === session.id
                                    ? "bg-islamic-green-100"
                                    : ""
                                )}
                                onClick={() => handleSelectSession(session.id)}
                              >
                                <div className="text-sm text-gray-700">
                                  {truncateText(session.title, 30)}
                                </div>
                              </div>
                            </ContextMenuTrigger>
                            <ContextMenuContent className="w-48">
                              <ContextMenuItem
                                className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleDeleteSession(session.id);
                                }}
                              >
                                <Trash className="h-4 w-4 mr-2" />
                                Delete
                              </ContextMenuItem>
                            </ContextMenuContent>
                          </ContextMenu>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Older chats with specific date */}
                {groupedSessions.older?.length > 0 && (
                  <div>
                    <div
                      className="flex items-center justify-between mb-2 cursor-pointer"
                      onClick={() =>
                        setExpandedSections((prev) => ({
                          ...prev,
                          older: !prev.older,
                        }))
                      }
                    >
                      <h3 className="font-medium text-base text-gray-800">
                        12.08.2025
                      </h3>
                      <div className="flex items-center">
                        <span className="text-sm text-gray-500 mr-1">
                          12 Total
                        </span>
                        <ChevronDown
                          className={`h-4 w-4 text-gray-500 transform transition-transform ${
                            expandedSections.older ? "" : "-rotate-90"
                          }`}
                        />
                      </div>
                    </div>

                    {expandedSections.older && (
                      <div className="space-y-1">
                        {groupedSessions.older.map((session) => (
                          <ContextMenu key={session.id}>
                            <ContextMenuTrigger>
                              <div
                                className={cn(
                                  "py-2 px-2 cursor-pointer rounded-md",
                                  currentSessionId === session.id
                                    ? "bg-islamic-green-100"
                                    : ""
                                )}
                                onClick={() => handleSelectSession(session.id)}
                              >
                                <div className="text-sm text-gray-700">
                                  {truncateText(session.title, 30)}
                                </div>
                              </div>
                            </ContextMenuTrigger>
                            <ContextMenuContent className="w-48">
                              <ContextMenuItem
                                className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleDeleteSession(session.id);
                                }}
                              >
                                <Trash className="h-4 w-4 mr-2" />
                                Delete
                              </ContextMenuItem>
                            </ContextMenuContent>
                          </ContextMenu>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
