import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useChatStore } from "@/stores/chatStore";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { ChatResponse } from "@/types";

interface SendMessageParams {
  content: string;
  sessionId: string;
}

interface UseChatReturn {
  sendMessage: (params: SendMessageParams) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

// Supabase API call for chat completion
const sendChatMessage = async (
  content: string,
  sessionId: string,
): Promise<ChatResponse> => {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("Authentication required");
  }

  const response = await supabase.functions.invoke("chat-completion", {
    body: {
      sessionId,
      message: content,
    },
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  if (response.error) {
    throw new Error(response.error.message || "Failed to get AI response");
  }

  return response.data;
};

export function useChat(): UseChatReturn {
  const { setLoading, setError } = useChatStore();
  const queryClient = useQueryClient();

  const { user } = useAuth();

  const mutation = useMutation({
    mutationFn: (
      { content, sessionId }: { content: string; sessionId: string },
    ) => sendChatMessage(content, sessionId),
    onSuccess: (_response, variables) => {
      // The AI response is already saved to the database by the edge function
      // We just need to trigger a refetch of messages
      queryClient.invalidateQueries({
        queryKey: ["messages", variables.sessionId],
      });
      setLoading(false);
    },
    onError: (error) => {
      console.error("Chat error:", error);
      setError(error.message);
      setLoading(false);
    },
  });

  const sendMessage = useCallback(
    async ({ content, sessionId }: SendMessageParams) => {
      if (!user) {
        setError("Please sign in to send messages");
        return;
      }

      try {
        setError(null);
        setLoading(true);

        // Send to API (user message will be saved by the edge function)
        await mutation.mutateAsync({ content, sessionId });
      } catch (error) {
        console.error("Error sending message:", error);
        setError("Failed to send message");
        setLoading(false);
      }
    },
    [user, setLoading, setError, mutation],
  );

  return {
    sendMessage,
    isLoading: mutation.isPending,
    error: mutation.error?.message || null,
  };
}
