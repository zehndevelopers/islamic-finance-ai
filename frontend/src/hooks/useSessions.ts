import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { Database } from "@/types/database";

type Session = Database["public"]["Tables"]["sessions"]["Row"];
type SessionInsert = Database["public"]["Tables"]["sessions"]["Insert"];

export function useSessions() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch sessions
  const {
    data: sessions = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["sessions", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("sessions")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      if (error) throw error;
      return data as Session[];
    },
    enabled: !!user,
  });

  // Create session mutation
  const createSessionMutation = useMutation({
    mutationFn: async (title: string = "New Chat") => {
      if (!user) throw new Error("User not authenticated");

      const sessionData: SessionInsert = {
        user_id: user.id,
        title,
      };

      const { data, error } = await supabase
        .from("sessions")
        .insert(sessionData)
        .select()
        .single();

      if (error) throw error;
      return data as Session;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions", user?.id] });
    },
  });

  // Update session mutation
  const updateSessionMutation = useMutation({
    mutationFn: async ({ id, title }: { id: string; title: string }) => {
      const { data, error } = await supabase
        .from("sessions")
        .update({ title })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Session;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions", user?.id] });
    },
  });

  // Delete session mutation
  const deleteSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const { error } = await supabase
        .from("sessions")
        .delete()
        .eq("id", sessionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions", user?.id] });
    },
  });

  return {
    sessions,
    isLoading,
    error,
    createSession: createSessionMutation.mutateAsync,
    updateSession: updateSessionMutation.mutateAsync,
    deleteSession: deleteSessionMutation.mutateAsync,
    isCreating: createSessionMutation.isPending,
    isUpdating: updateSessionMutation.isPending,
    isDeleting: deleteSessionMutation.isPending,
  };
}
