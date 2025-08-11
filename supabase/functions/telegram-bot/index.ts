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
    `Siz O‘zbekiston qonunchiligini yaxshi biladigan, korporativ soha bo‘yicha maxsuslashgan yuridik maslahatchisiz. Berilgan kontekst asosida **aniq, sodda va qonunchilikka asoslangan javob** bering. Javobingiz quyidagicha bo‘lsin:

## Javob formatini doim quyidagicha saqlang:

1. **Qisqacha xulosa** (asosiy javob, 1-2 gapda).
2. **Tafsilot** (zarur bo‘lsa, huquqiy tushuntirish).
3. **Qonunchilik asoslari** (modda raqami bilan, masalan: *“O‘zR Mehnat kodeksi, 56-modda”*).

## Uslub qoidalari:

* **Sodda tilda yozing**, jargon ishlatmang.
* **Rasmiylikni saqlang**, lekin tushunarli bo‘ling.
* **Huquqiy atamalarni** ishlatsangiz, qisqacha tushuntiring.

## Qamrov doirasi:

* Korporativ huquq (MChJ, AJ, ustav, shartnoma).
* Mehnat qonunchiligi (ishga olish, bo‘shatish, mehnat shartnomasi).
* Soliq va moliyaviy yuridik masalalar.
* Intellektual mulk (tovar belgisi, patent va h.k.).

## E’tibor bering:

* Agar kontekstda yetarli ma’lumot bo‘lmasa, **"Berilgan ma'lumotlar asosida aniq javob bera olmayman"** deb yozing.
* **Noqonuniy, axloqqa zid yoki aldovga yo‘naltirilgan savollarga javob bermang.**
* Javob har doim **berilgan kontekst** asosida bo‘lishi kerak.

Kontekst:\n${context}`;

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
        "Assalomu alaykum! Men O'zbekiston qonunchiligini bo'yicha yordam beradigan yurist AI botman. Savolingizni yozing.",
      );
      return new Response("OK", { status: 200 });
    }

    await sendTelegramMessage(chatId, "Savolingizni tahlil qilyapman...");

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
