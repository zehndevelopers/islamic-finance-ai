#!/usr/bin/env deno run --allow-read --allow-write

// Model switching utility for Yurist AI
const MODELS = {
  "gemini-flash": "google/gemini-2.0-flash-exp",
  "gemini-pro": "google/gemini-pro-1.5",
  "claude": "anthropic/claude-3.5-sonnet",
  "gpt4": "openai/gpt-4o",
  "llama": "meta-llama/llama-3.1-70b-instruct",
};

const EMBEDDING_MODELS = {
  "small": "text-embedding-3-small",
  "large": "text-embedding-3-large",
  "ada": "text-embedding-ada-002",
};

async function switchModel(chatModel: string, embeddingModel?: string) {
  const chatModelId = MODELS[chatModel as keyof typeof MODELS];
  const embeddingModelId = embeddingModel
    ? EMBEDDING_MODELS[embeddingModel as keyof typeof EMBEDDING_MODELS]
    : null;

  if (!chatModelId) {
    console.error(`❌ Unknown chat model: ${chatModel}`);
    console.log("Available models:", Object.keys(MODELS).join(", "));
    return;
  }

  if (embeddingModel && !embeddingModelId) {
    console.error(`❌ Unknown embedding model: ${embeddingModel}`);
    console.log(
      "Available embedding models:",
      Object.keys(EMBEDDING_MODELS).join(", "),
    );
    return;
  }

  // Update telegram-bot function
  const telegramBotPath = "./supabase/functions/telegram-bot/index.ts";
  let telegramContent = await Deno.readTextFile(telegramBotPath);

  // Replace chat model
  telegramContent = telegramContent.replace(
    /model: '[^']+'/g,
    `model: '${chatModelId}'`,
  );

  // Replace embedding model if specified
  if (embeddingModelId) {
    telegramContent = telegramContent.replace(
      /model: 'text-embedding-[^']+'/g,
      `model: '${embeddingModelId}'`,
    );
  }

  await Deno.writeTextFile(telegramBotPath, telegramContent);

  // Update upload-doc function
  if (embeddingModelId) {
    const uploadDocPath = "./supabase/functions/upload-doc/index.ts";
    let uploadContent = await Deno.readTextFile(uploadDocPath);

    uploadContent = uploadContent.replace(
      /model: 'text-embedding-[^']+'/g,
      `model: '${embeddingModelId}'`,
    );

    await Deno.writeTextFile(uploadDocPath, uploadContent);
  }

  console.log(`✅ Switched to chat model: ${chatModel} (${chatModelId})`);
  if (embeddingModelId) {
    console.log(
      `✅ Switched to embedding model: ${embeddingModel} (${embeddingModelId})`,
    );
  }
  console.log("📦 Run deployment command to apply changes:");
  console.log("   supabase functions deploy telegram-bot");
  if (embeddingModelId) {
    console.log("   supabase functions deploy upload-doc");
  }
}

// CLI interface
if (import.meta.main) {
  const args = Deno.args;
  if (args.length === 0) {
    console.log("🤖 Yurist AI Model Switcher");
    console.log(
      "Usage: deno run --allow-read --allow-write switch-model.ts <chat-model> [embedding-model]",
    );
    console.log("");
    console.log("Chat models:", Object.keys(MODELS).join(", "));
    console.log("Embedding models:", Object.keys(EMBEDDING_MODELS).join(", "));
    console.log("");
    console.log("Examples:");
    console.log(
      "  deno run --allow-read --allow-write switch-model.ts gemini-flash",
    );
    console.log(
      "  deno run --allow-read --allow-write switch-model.ts claude large",
    );
    Deno.exit(1);
  }

  await switchModel(args[0], args[1]);
}
