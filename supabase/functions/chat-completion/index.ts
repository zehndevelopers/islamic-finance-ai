import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ChatRequest {
  sessionId: string;
  message: string;
  context?: string;
}

interface ChatMessage {
  id: string;
  session_id: string;
  user_id: string;
  content: string;
  role: "user" | "assistant";
  metadata: any;
  created_at: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // Get user from request
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: { user } } = await supabaseClient.auth.getUser(token);

    if (!user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const { sessionId, message }: ChatRequest = await req.json();

    // Validate session belongs to user
    const { data: session, error: sessionError } = await supabaseClient
      .from("sessions")
      .select("id, user_id")
      .eq("id", sessionId)
      .eq("user_id", user.id)
      .single();

    if (sessionError || !session) {
      return new Response(
        JSON.stringify({ error: "Session not found or unauthorized" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Save user message to database
    const { error: userMessageError } = await supabaseClient
      .from("messages")
      .insert({
        session_id: sessionId,
        user_id: user.id,
        content: message,
        role: "user",
        metadata: {},
      });

    if (userMessageError) {
      console.error("Error saving user message:", userMessageError);
      return new Response(
        JSON.stringify({ error: "Failed to save message" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Get recent messages for context
    const { data: recentMessages } = await supabaseClient
      .from("messages")
      .select("content, role, created_at")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true })
      .limit(10);

    // Find relevant documents for context
    const { data: relevantDocs } = await supabaseClient
      .from("docs")
      .select("title, content")
      .textSearch("content", message, { type: "websearch" })
      .limit(3);

    // Prepare context for AI
    const contextString = relevantDocs
      ?.map((doc) => `Document: ${doc.title}\n${doc.content}`)
      .join("\n\n") || "";

    const systemPrompt =
      `You are an expert Islamic finance and Sharia law consultant specializing in corporate and personal finance. Provide comprehensive, Sharia-compliant guidance on Islamic financial matters.

### Primary Guidelines:

**Content Priorities:**
- Base responses primarily on provided context when available
- Supplement with your Islamic finance knowledge as needed
- Never deviate from Islamic finance and Sharia law topics
- Maintain strict focus on financial and business matters only

**Response Style:**
- Use natural, conversational structure suited to the question
- Write in plain language, avoiding unnecessary jargon
- Provide brief explanations for Islamic/legal terminology
- Maintain professional yet accessible tone

### Expertise Coverage:
- Islamic financial instruments (mudaraba, musharaka, ijara, qard hasan)
- Halal investment screening and compliance assessment
- Islamic banking contracts and operational structures
- Sharia-compliant business practices and transactions

### Response Standards:
- Deliver precise, accurate Islamic finance guidance
- Include relevant Quranic verses, hadith, or fiqh sources when applicable
- State clearly if insufficient information exists for definitive ruling
- Refuse requests outside Islamic finance scope or violating Sharia principles

Context: ${contextString}`;

    // Prepare messages for OpenAI
    const messages = [
      { role: "system", content: systemPrompt },
      ...(recentMessages?.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })) || []),
      { role: "user", content: message },
    ];

    // Call OpenAI API
    const openAIResponse = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${Deno.env.get("OPENAI_API_KEY")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4",
          messages: messages,
          max_tokens: 1000,
          temperature: 0.7,
          stream: false,
        }),
      },
    );

    if (!openAIResponse.ok) {
      const error = await openAIResponse.text();
      console.error("OpenAI API error:", error);
      return new Response(
        JSON.stringify({ error: "AI service unavailable" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const aiResult = await openAIResponse.json();
    const aiMessage = aiResult.choices[0]?.message?.content ||
      "I apologize, but I could not generate a response.";

    // Save AI response to database
    const { data: assistantMessage, error: assistantMessageError } =
      await supabaseClient
        .from("messages")
        .insert({
          session_id: sessionId,
          user_id: user.id,
          content: aiMessage,
          role: "assistant",
          metadata: {
            model: "gpt-4",
            tokens: aiResult.usage?.total_tokens || 0,
            context_docs: relevantDocs?.length || 0,
          },
        })
        .select()
        .single();

    if (assistantMessageError) {
      console.error("Error saving assistant message:", assistantMessageError);
      return new Response(
        JSON.stringify({ error: "Failed to save AI response" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Extract citations from AI response (simple implementation)
    const citations = [];
    const quranMatch = aiMessage.match(/Quran[^,]*,[^""]*/gi);
    const hadithMatch = aiMessage.match(/Hadith[^,]*,[^""]*/gi);

    if (quranMatch) {
      citations.push(
        ...quranMatch.map((ref) => ({ type: "quran", reference: ref.trim() })),
      );
    }
    if (hadithMatch) {
      citations.push(
        ...hadithMatch.map((ref) => ({
          type: "hadith",
          reference: ref.trim(),
        })),
      );
    }

    return new Response(
      JSON.stringify({
        message: aiMessage,
        messageId: assistantMessage.id,
        citations: citations,
        confidence: 0.95,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Error in chat completion:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
