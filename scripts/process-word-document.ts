#!/usr/bin/env deno run --allow-read --allow-net --allow-write

// Word document processor for Yurist AI
// Processes .docx files and uploads to docs table

interface DocumentChunk {
  title: string;
  content: string;
  chapter?: string;
  article?: string;
}

const SUPABASE_URL = "https://csmndybaxxoxqrcsbeqf.supabase.co";
const SUPABASE_SERVICE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzbW5keWJheHhveHFyY3NiZXFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5MTA0NTEsImV4cCI6MjA3MDQ4NjQ1MX0.y7Uz-yIo0x5GsMcdRxuGCEbjP1dr1tbAJekGEMoLR50";

async function uploadDocument(
  title: string,
  content: string,
): Promise<boolean> {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/upload-doc`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
      body: JSON.stringify({ title, content }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`❌ Failed to upload "${title}": ${error}`);
      return false;
    }

    console.log(`✅ Uploaded: ${title}`);
    return true;
  } catch (error) {
    console.error(`❌ Error uploading "${title}":`, error);
    return false;
  }
}

function parseTextToChunks(text: string): DocumentChunk[] {
  const chunks: DocumentChunk[] = [];

  // Split by articles (modda)
  const articlePattern = /(\d+[-.]?\s*modda[.\s]*[–-]?\s*([^\n]+))/gi;
  const articles = text.split(articlePattern);

  let currentChapter = "";

  for (let i = 0; i < articles.length; i++) {
    const section = articles[i]?.trim();
    if (!section) continue;

    // Check if this is a chapter heading
    if (
      section.toLowerCase().includes("bob") ||
      section.toLowerCase().includes("qism") ||
      section.toLowerCase().includes("bo'lim")
    ) {
      currentChapter = section;
      continue;
    }

    // Check if this looks like an article
    const articleMatch = section.match(/^(\d+[-.]?\s*modda)/i);
    if (articleMatch && i + 1 < articles.length) {
      const articleTitle = section;
      const articleContent = articles[i + 1]?.trim();

      if (articleContent && articleContent.length > 50) {
        chunks.push({
          title: `Mehnat kodeksi - ${articleTitle}`,
          content: `${
            currentChapter ? currentChapter + "\n\n" : ""
          }${articleTitle}\n\n${articleContent}`,
          chapter: currentChapter,
          article: articleTitle,
        });
      }
      i++; // Skip the content part since we've processed it
    }
  }

  // If no articles found, try splitting by paragraphs
  if (chunks.length === 0) {
    const paragraphs = text.split(/\n\s*\n/).filter((p) =>
      p.trim().length > 100
    );

    paragraphs.forEach((paragraph, index) => {
      const lines = paragraph.trim().split("\n");
      const title = lines[0].substring(0, 100) +
        (lines[0].length > 100 ? "..." : "");

      chunks.push({
        title: `Mehnat kodeksi - Bo'lim ${index + 1}: ${title}`,
        content: paragraph.trim(),
      });
    });
  }

  return chunks;
}

async function processWordDocument(filePath: string) {
  console.log("📄 Processing Word document...");
  console.log("⚠️  Note: Please convert .docx to .txt first using:");
  console.log("   - Microsoft Word: Save As -> Plain Text");
  console.log("   - Google Docs: File -> Download -> Plain text");
  console.log("   - Online converter: https://convertio.co/docx-txt/");
  console.log("");

  try {
    // Check if file exists and is .txt
    const fileInfo = await Deno.stat(filePath);
    if (!fileInfo.isFile) {
      throw new Error("File not found");
    }

    if (!filePath.endsWith(".txt")) {
      console.error("❌ Please provide a .txt file (converted from Word)");
      console.log("💡 Convert your .docx file to .txt first, then run:");
      console.log(
        `   deno run --allow-read --allow-net --allow-write scripts/process-word-document.ts "${
          filePath.replace(".docx", ".txt")
        }"`,
      );
      return;
    }

    const text = await Deno.readTextFile(filePath);
    console.log(`📖 File loaded: ${text.length} characters`);

    const chunks = parseTextToChunks(text);
    console.log(`📝 Parsed into ${chunks.length} chunks`);

    if (chunks.length === 0) {
      console.error(
        "❌ No content chunks found. Please check the file format.",
      );
      return;
    }

    // Show preview of first chunk
    console.log("\n📋 Preview of first chunk:");
    console.log("Title:", chunks[0].title);
    console.log(
      "Content preview:",
      chunks[0].content.substring(0, 200) + "...",
    );
    console.log("");

    // Confirm before uploading
    const confirm = prompt("Continue with upload? (y/N): ");
    if (confirm?.toLowerCase() !== "y") {
      console.log("❌ Upload cancelled");
      return;
    }

    console.log("🚀 Starting upload...");
    let successCount = 0;

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      console.log(
        `[${i + 1}/${chunks.length}] Uploading: ${
          chunk.title.substring(0, 50)
        }...`,
      );

      const success = await uploadDocument(chunk.title, chunk.content);
      if (success) successCount++;

      // Small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    console.log("");
    console.log("✨ Upload completed!");
    console.log(
      `✅ Successfully uploaded: ${successCount}/${chunks.length} documents`,
    );

    if (successCount < chunks.length) {
      console.log("⚠️  Some uploads failed. Check the logs above for details.");
    }
  } catch (error) {
    console.error("❌ Error processing document:", error.message);
  }
}

// CLI interface
if (import.meta.main) {
  const args = Deno.args;

  if (args.length === 0) {
    console.log("📄 Yurist AI - Word Document Processor");
    console.log("");
    console.log("Usage:");
    console.log(
      "  deno run --allow-read --allow-net --allow-write scripts/process-word-document.ts <file-path>",
    );
    console.log("");
    console.log("Steps:");
    console.log("  1. Convert your .docx file to .txt format");
    console.log("  2. Run this script with the .txt file path");
    console.log("");
    console.log("Example:");
    console.log(
      "  deno run --allow-read --allow-net --allow-write scripts/process-word-document.ts mehnat-kodeksi.txt",
    );
    Deno.exit(1);
  }

  await processWordDocument(args[0]);
}
