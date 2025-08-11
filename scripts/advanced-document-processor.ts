#!/usr/bin/env deno run --allow-read --allow-net --allow-write --allow-run

// Advanced document processor with multiple format support
// Supports: .txt, .docx (via pandoc), .pdf (via pdftotext)

interface ProcessingOptions {
  chunkSize: number;
  overlap: number;
  minChunkSize: number;
  titlePrefix: string;
}

const DEFAULT_OPTIONS: ProcessingOptions = {
  chunkSize: 3000, // Maximum characters per chunk
  overlap: 200, // Overlap between chunks
  minChunkSize: 500, // Minimum chunk size
  titlePrefix: "Islamic Finance",
};

const SUPABASE_URL = "http://127.0.0.1:54321";
const SUPABASE_SERVICE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU";

async function convertDocxToText(docxPath: string): Promise<string> {
  console.log("🔄 Converting DOCX to text using pandoc...");

  try {
    const command = new Deno.Command("pandoc", {
      args: ["-t", "plain", docxPath],
      stdout: "piped",
      stderr: "piped",
    });

    const { code, stdout, stderr } = await command.output();

    if (code !== 0) {
      const error = new TextDecoder().decode(stderr);
      throw new Error(`Pandoc error: ${error}`);
    }

    return new TextDecoder().decode(stdout);
  } catch (error) {
    console.error("❌ Pandoc not found. Please install:");
    console.error("   macOS: brew install pandoc");
    console.error("   Ubuntu: sudo apt install pandoc");
    console.error("   Or convert manually to .txt");
    throw error;
  }
}

function smartChunking(
  text: string,
  options: ProcessingOptions,
): Array<{ title: string; content: string }> {
  const chunks: Array<{ title: string; content: string }> = [];

  // First, try to split by articles (modda)
  const articlePattern = /(\d+[-.]?\s*modda[.\s]*[–-]?\s*([^\n]+))/gi;
  const matches = [...text.matchAll(articlePattern)];

  if (matches.length > 5) {
    console.log(
      `📄 Found ${matches.length} articles, processing by articles...`,
    );

    for (let i = 0; i < matches.length; i++) {
      const match = matches[i];
      const nextMatch = matches[i + 1];

      const startIndex = match.index!;
      const endIndex = nextMatch ? nextMatch.index! : text.length;

      const articleContent = text.slice(startIndex, endIndex).trim();
      const articleNumber = match[1];
      const articleTitle = match[2] || "";

      if (articleContent.length >= options.minChunkSize) {
        chunks.push({
          title: `${options.titlePrefix} - ${articleNumber}${
            articleTitle ? " - " + articleTitle.trim() : ""
          }`,
          content: articleContent,
        });
      }
    }
  } else {
    console.log("📄 No clear article structure found, using smart chunking...");

    // Smart chunking by paragraphs and sentences
    const paragraphs = text.split(/\n\s*\n/).filter((p) =>
      p.trim().length > 50
    );

    let currentChunk = "";
    let chunkIndex = 1;

    for (const paragraph of paragraphs) {
      if (currentChunk.length + paragraph.length > options.chunkSize) {
        if (currentChunk.length >= options.minChunkSize) {
          const title = extractTitle(currentChunk) ||
            `${options.titlePrefix} - Chapter ${chunkIndex}`;
          chunks.push({
            title,
            content: currentChunk.trim(),
          });
          chunkIndex++;
        }

        // Start new chunk with overlap
        const overlapText = currentChunk.slice(-options.overlap);
        currentChunk = overlapText + "\n\n" + paragraph;
      } else {
        currentChunk += (currentChunk ? "\n\n" : "") + paragraph;
      }
    }

    // Add final chunk
    if (currentChunk.length >= options.minChunkSize) {
      const title = extractTitle(currentChunk) ||
        `${options.titlePrefix} - Chapter ${chunkIndex}`;
      chunks.push({
        title,
        content: currentChunk.trim(),
      });
    }
  }

  return chunks;
}

function extractTitle(text: string): string | null {
  const lines = text.split("\n").map((l) => l.trim()).filter((l) =>
    l.length > 0
  );

  // Look for article pattern
  const articleMatch = lines[0]?.match(
    /(\d+[-.]?\s*modda[.\s]*[–-]?\s*([^\n]+))/i,
  );
  if (articleMatch) {
    return `Islamic Finance - ${articleMatch[1]}${
      articleMatch[2] ? " - " + articleMatch[2].trim() : ""
    }`;
  }

  // Look for chapter/section pattern
  const chapterMatch = lines[0]?.match(
    /(Part\s*[A-Z]|Section\s*\d+|Chapter\s*[IVX0-9]+|\d+\.\s*[A-Za-z]|[IVX]+\s*\.|Applicable\s*to:|Introduction|Concept\s*Paper)/i,
  );
  if (chapterMatch) {
    return `Islamic Finance - ${chapterMatch[1]} - ${
      lines[0].substring(0, 50)
    }`;
  }

  // Use first meaningful line
  const firstLine = lines[0];
  if (firstLine && firstLine.length > 10 && firstLine.length < 100) {
    return `Islamic Finance - ${firstLine}`;
  }

  return null;
}

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

    return true;
  } catch (error) {
    console.error(`❌ Error uploading "${title}":`, error);
    return false;
  }
}

async function processDocument(
  filePath: string,
  options: ProcessingOptions = DEFAULT_OPTIONS,
) {
  console.log("📄 Advanced Document Processor");
  console.log("==============================");

  try {
    let text: string;

    if (filePath.endsWith(".docx")) {
      text = await convertDocxToText(filePath);
    } else if (filePath.endsWith(".txt")) {
      text = await Deno.readTextFile(filePath);
    } else {
      throw new Error("Unsupported file format. Use .txt or .docx");
    }

    console.log(`📖 Document loaded: ${text.length} characters`);

    const chunks = smartChunking(text, options);
    console.log(`📝 Created ${chunks.length} chunks`);

    if (chunks.length === 0) {
      console.error("❌ No chunks created. Check document format.");
      return;
    }

    // Show preview
    console.log("\n📋 Preview of chunks:");
    chunks.slice(0, 3).forEach((chunk, i) => {
      console.log(`${i + 1}. ${chunk.title}`);
      console.log(`   Content: ${chunk.content.substring(0, 100)}...`);
    });

    if (chunks.length > 3) {
      console.log(`   ... and ${chunks.length - 3} more chunks`);
    }

    console.log("");
    const confirm = prompt(
      `Upload ${chunks.length} chunks to database? (y/N): `,
    );
    if (confirm?.toLowerCase() !== "y") {
      console.log("❌ Upload cancelled");
      return;
    }

    console.log("🚀 Starting upload...");
    let successCount = 0;

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      process.stdout.write(
        `[${i + 1}/${chunks.length}] ${chunk.title.substring(0, 60)}... `,
      );

      const success = await uploadDocument(chunk.title, chunk.content);
      if (success) {
        console.log("✅");
        successCount++;
      } else {
        console.log("❌");
      }

      // Rate limiting
      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    console.log("");
    console.log("✨ Processing completed!");
    console.log(
      `✅ Successfully uploaded: ${successCount}/${chunks.length} documents`,
    );
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

// CLI interface
if (import.meta.main) {
  const args = Deno.args;

  if (args.length === 0) {
    console.log("📄 Advanced Document Processor for Islamic Finance AI");
    console.log("");
    console.log("Usage:");
    console.log(
      "  deno run --allow-read --allow-net --allow-write --allow-run scripts/advanced-document-processor.ts <file-path> [options]",
    );
    console.log("");
    console.log("Supported formats:");
    console.log("  .txt  - Plain text files");
    console.log("  .docx - Word documents (requires pandoc)");
    console.log("");
    console.log("Examples:");
    console.log(
      "  deno run --allow-read --allow-net --allow-write --allow-run scripts/advanced-document-processor.ts islamic-finance-doc.docx",
    );
    console.log(
      "  deno run --allow-read --allow-net --allow-write --allow-run scripts/advanced-document-processor.ts islamic-finance-doc.txt",
    );
    console.log("");
    console.log("Install pandoc for .docx support:");
    console.log("  macOS: brew install pandoc");
    console.log("  Ubuntu: sudo apt install pandoc");
    Deno.exit(1);
  }

  await processDocument(args[0]);
}
