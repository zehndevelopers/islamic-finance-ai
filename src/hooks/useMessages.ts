import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { Database } from "@/types/database";

type Message = Database["public"]["Tables"]["messages"]["Row"];

export function useMessages(sessionId: string | null) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch messages for a session
  const {
    data: messages = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["messages", sessionId],
    queryFn: async () => {
      if (!sessionId || !user) return [];

      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as Message[];
    },
    enabled: !!sessionId && !!user,
  });

  // Set up real-time subscription for messages
  useEffect(() => {
    if (!sessionId || !user) return;

    const channel = supabase
      .channel(`messages:${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
          filter: `session_id=eq.${sessionId}`,
        },
        () => {
          // Invalidate and refetch messages when changes occur
          queryClient.invalidateQueries({ queryKey: ["messages", sessionId] });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId, user, queryClient]);

  return {
    messages,
    isLoading,
    error,
  };
}
