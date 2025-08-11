import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const telegramBotToken = Deno.env.get("TELEGRAM_BOT_TOKEN")!;
const openaiApiKey = Deno.env.get("OPENAI_API_KEY")!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface TelegramMessage {
  message_id: number;
  from: {
    id: number;
    first_name: string;
    username?: string;
  };
  chat: {
    id: number;
    type: string;
  };
  text: string;
}

interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
}

async function sendTelegramMessage(chatId: number, text: string) {
  const response = await fetch(
    `https://api.telegram.org/bot${telegramBotToken}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "Markdown",
      }),
    },
  );

  if (!response.ok) {
    console.error("Failed to send Telegram message:", await response.text());
  }
}

async function createEmbedding(text: string): Promise<number[]> {
  const response = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${openaiApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "text-embedding-3-small",
      input: text,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data[0].embedding;
}

async function findRelevantDocuments(query: string, limit = 5) {
  const queryEmbedding = await createEmbedding(query);

  const { data, error } = await supabase.rpc("match_docs", {
    query_embedding: queryEmbedding,
    match_threshold: 0.7,
    match_count: limit,
  });

  if (error) {
    console.error("Error finding relevant documents:", error);
    return [];
  }

  return data || [];
}

interface Doc {
  id: string;
  title: string;
  content: string;
  similarity: number;
}

async function generateResponse(
  question: string,
  relevantDocs: Doc[],
) {
  const context = relevantDocs
    .map((doc) => `Hujjat: ${doc.title}\n${doc.content}`)
    .join("\n\n");
  const systemPrompt =
    `You are an expert Islamic finance and Sharia law consultant specializing in corporate and personal finance. Based on the provided context, deliver **precise, clear, and Sharia-compliant responses**. Structure your response as follows:

## Always maintain this response format:

1. **Executive Summary** (main answer in 1-2 sentences)
2. **Details** (necessary Sharia and jurisprudential explanation when required)
3. **Sharia Foundation** (Quranic verse, hadith, or fiqh source reference, e.g., *"Quran, Surah Al-Baqarah, verse 275"* or *"Sahih Muslim, hadith 2212"*)
4. **Language** (respond in the same language as the question)

## Style Guidelines:

* **Write in plain language** - avoid jargon
* **Maintain professionalism** while being accessible
* **When using Islamic or legal terminology**, provide brief explanations

## Coverage Areas:

* Islamic financial products (qard hasan, mudaraba, musharaka, ijara, etc.)
* Halal investments and financing types
* Islamic banking practices and contract types
* Intellectual property and Sharia compliance

## Important Notes:

* If insufficient information is provided in context, state **"Based on the available information, I cannot provide a definitive answer"**
* **Do not respond to illegal, unethical, or Sharia-non-compliant questions**
* Responses must always be **based on the provided context**

Context:\n${context}`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${openaiApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: question },
      ],
      temperature: 0.3,
      max_tokens: 1500,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const update: TelegramUpdate = await req.json();

    if (!update.message?.text) {
      return new Response("OK", { status: 200 });
    }

    const { message } = update;
    const userQuestion = message.text;
    const chatId = message.chat.id;

    if (userQuestion === "/start") {
      await sendTelegramMessage(
        chatId,
        "Welcome! I am an expert legal consultant specializing in Islamic finance and Sharia principles for both corporate and personal matters. Please type your question.",
      );
      return new Response("OK", { status: 200 });
    }

    await sendTelegramMessage(chatId, "Analyzing your question...");

    const relevantDocs = await findRelevantDocuments(userQuestion);
    const response = await generateResponse(
      userQuestion,
      relevantDocs,
    );

    await sendTelegramMessage(chatId, response);

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("Error processing Telegram update:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
});
