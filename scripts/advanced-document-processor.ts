interface ProcessingOptions {
  chunkSize: number;
  overlap: number;
  minChunkSize: number;
  titlePrefix: string;
}

interface DocumentSection {
  level: number;
  title: string;
  content: string;
  startIndex: number;
  endIndex: number;
}

const DEFAULT_OPTIONS: ProcessingOptions = {
  chunkSize: 4000, // Maximum characters per chunk
  overlap: 300, // Overlap between chunks
  minChunkSize: 800, // Minimum chunk size
  titlePrefix: "Islamic Finance",
};

const SUPABASE_URL = "https://csmndybaxxoxqrcsbeqf.supabase.co";
const SUPABASE_SERVICE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzbW5keWJheHhveHFyY3NiZXFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5MTA0NTEsImV4cCI6MjA3MDQ4NjQ1MX0.y7Uz-yIo0x5GsMcdRxuGCEbjP1dr1tbAJekGEMoLR50";

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

async function convertPdfToText(pdfPath: string): Promise<string> {
  console.log("🔄 Converting PDF to text using pdf2txt...");

  try {
    // Try using pdf2txt (from pdfplumber/pdfminer)
    const command = new Deno.Command("pdf2txt", {
      args: [pdfPath],
      stdout: "piped",
      stderr: "piped",
    });

    const { code, stdout, stderr } = await command.output();

    if (code !== 0) {
      const error = new TextDecoder().decode(stderr);
      throw new Error(`pdf2txt error: ${error}`);
    }

    return new TextDecoder().decode(stdout);
  } catch (error) {
    console.error("❌ pdf2txt not found. Trying pdftotext...");

    try {
      // Fallback to pdftotext (from poppler-utils)
      const command = new Deno.Command("/opt/homebrew/bin/pdftotext", {
        args: ["-layout", pdfPath, "-"],
        stdout: "piped",
        stderr: "piped",
      });

      const { code, stdout, stderr } = await command.output();

      if (code !== 0) {
        const error = new TextDecoder().decode(stderr);
        throw new Error(`pdftotext error: ${error}`);
      }

      return new TextDecoder().decode(stdout);
    } catch (fallbackError) {
      console.error("❌ PDF conversion tools not found. Please install:");
      console.error("   macOS: brew install poppler");
      console.error("   Ubuntu: sudo apt install poppler-utils");
      console.error("   Or: pip install pdfplumber");
      throw fallbackError;
    }
  }
}

function parseDocumentStructure(text: string): DocumentSection[] {
  const sections: DocumentSection[] = [];
  const lines = text.split("\n");

  // Patterns for Islamic finance documents
  const patterns = {
    // Main sections: ## Title or numbered sections
    mainSection: /^(##\s+(.+)|\d+\.\s+(.+)|[A-Z][A-Za-z\s]+:$)/,
    // Subsections: ### Title or lettered subsections
    subSection: /^(###\s+(.+)|[a-z]\.\s+(.+)|\w+\s*[-–]\s*.+)/,
    // Paragraphs: numbered paragraphs (common in AAOIFI standards)
    paragraph: /^(\d+\.|[A-Z]{2}\d+|IN\d+|PR\d+)\s+(.+)/,
    // Articles (modda)
    article: /(\d+[-.]?\s*modda[.\s]*[–-]?\s*([^\n]+))/i,
  };

  let currentSection: DocumentSection | null = null;
  let currentContent = "";
  let startIndex = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (!line) continue;

    // Check for main sections
    const mainMatch = line.match(patterns.mainSection);
    if (mainMatch && line.length < 200) {
      // Save previous section
      if (currentSection && currentContent.trim()) {
        currentSection.content = currentContent.trim();
        currentSection.endIndex = i;
        sections.push(currentSection);
      }

      // Start new section
      currentSection = {
        level: 1,
        title: mainMatch[2] || mainMatch[3] || line,
        content: "",
        startIndex: i,
        endIndex: i,
      };
      currentContent = line + "\n";
      continue;
    }

    // Check for subsections
    const subMatch = line.match(patterns.subSection);
    if (subMatch && line.length < 150 && currentSection) {
      // For subsections, we continue adding to current section but note the structure
      currentContent += line + "\n";
      continue;
    }

    // Add content to current section
    if (currentSection) {
      currentContent += line + "\n";
    } else {
      // No section yet, start a default one
      currentSection = {
        level: 1,
        title: "Introduction",
        content: line + "\n",
        startIndex: i,
        endIndex: i,
      };
      currentContent = line + "\n";
    }
  }

  // Add final section
  if (currentSection && currentContent.trim()) {
    currentSection.content = currentContent.trim();
    currentSection.endIndex = lines.length;
    sections.push(currentSection);
  }

  return sections;
}

function smartChunking(
  text: string,
  options: ProcessingOptions,
): Array<{ title: string; content: string }> {
  const chunks: Array<{ title: string; content: string }> = [];

  // Parse document structure first
  const sections = parseDocumentStructure(text);

  if (sections.length > 3) {
    console.log(
      `📄 Found ${sections.length} structured sections, processing by sections...`,
    );

    for (const section of sections) {
      if (section.content.length <= options.chunkSize) {
        // Section fits in one chunk
        if (section.content.length >= options.minChunkSize) {
          chunks.push({
            title: `${options.titlePrefix} - ${section.title}`,
            content: section.content,
          });
        }
      } else {
        // Section too large, split into sub-chunks
        const subChunks = splitLargeSection(section, options);
        chunks.push(...subChunks);
      }
    }
  } else {
    console.log("📄 Using fallback chunking method...");
    // Fallback to paragraph-based chunking
    const fallbackChunks = fallbackChunking(text, options);
    chunks.push(...fallbackChunks);
  }

  return chunks;
}

function splitLargeSection(
  section: DocumentSection,
  options: ProcessingOptions,
): Array<{ title: string; content: string }> {
  const chunks: Array<{ title: string; content: string }> = [];

  // Try to split by numbered paragraphs first
  const paragraphPattern = /^(\d+\.|[A-Z]{2}\d+|IN\d+|PR\d+)\s+/gm;
  const paragraphMatches = [...section.content.matchAll(paragraphPattern)];

  if (paragraphMatches.length > 1) {
    // Split by paragraphs
    for (let i = 0; i < paragraphMatches.length; i++) {
      const match = paragraphMatches[i];
      const nextMatch = paragraphMatches[i + 1];

      const startIndex = match.index!;
      const endIndex = nextMatch ? nextMatch.index! : section.content.length;

      const paragraphContent = section.content.slice(startIndex, endIndex)
        .trim();

      if (paragraphContent.length >= options.minChunkSize) {
        chunks.push({
          title: `${options.titlePrefix} - ${section.title} - ${match[1]}`,
          content: paragraphContent,
        });
      }
    }
  } else {
    // Split by character limit with smart breaks
    const words = section.content.split(/\s+/);
    let currentChunk = "";
    let chunkIndex = 1;

    for (const word of words) {
      if (currentChunk.length + word.length > options.chunkSize) {
        if (currentChunk.length >= options.minChunkSize) {
          chunks.push({
            title:
              `${options.titlePrefix} - ${section.title} - Part ${chunkIndex}`,
            content: currentChunk.trim(),
          });
          chunkIndex++;
        }

        // Start new chunk with overlap
        const overlapWords = currentChunk.split(/\s+/).slice(-20).join(" ");
        currentChunk = overlapWords + " " + word;
      } else {
        currentChunk += (currentChunk ? " " : "") + word;
      }
    }

    // Add final chunk
    if (currentChunk.length >= options.minChunkSize) {
      chunks.push({
        title: `${options.titlePrefix} - ${section.title} - Part ${chunkIndex}`,
        content: currentChunk.trim(),
      });
    }
  }

  return chunks;
}

function fallbackChunking(
  text: string,
  options: ProcessingOptions,
): Array<{ title: string; content: string }> {
  const chunks: Array<{ title: string; content: string }> = [];

  // Smart chunking by paragraphs and sentences
  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 50);

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

  return chunks;
}

function extractTitle(text: string): string | null {
  const lines = text.split("\n").map((l) => l.trim()).filter((l) =>
    l.length > 0
  );

  // Enhanced patterns for Islamic finance documents
  const patterns = [
    // AAOIFI standards patterns
    /(AAOIFI\s+[^\n]+Standard[^\n]*)/i,
    // Numbered paragraphs (PR1, IN1, etc.)
    /^([A-Z]{2}\d+|\d+\.)\s+(.+)/,
    // Article pattern (modda)
    /(\d+[-.]?\s*modda[.\s]*[–-]?\s*([^\n]+))/i,
    // Section headers
    /(##\s+(.+)|###\s+(.+))/,
    // Definitions and scope
    /(Definitions|Scope|Objective|Introduction|Preface|Contents)/i,
    // General patterns
    /(Part\s*[A-Z]|Section\s*\d+|Chapter\s*[IVX0-9]+|\d+\.\s*[A-Za-z]|[IVX]+\s*\.|Applicable\s*to:|Concept\s*Paper)/i,
  ];

  for (const line of lines.slice(0, 3)) {
    for (const pattern of patterns) {
      const match = line.match(pattern);
      if (match) {
        let title = match[1] || match[2] || match[3] || match[0];
        title = title.replace(/^#+\s*/, "").trim();

        if (title.length > 5 && title.length < 120) {
          return `Islamic Finance - ${title}`;
        }
      }
    }
  }

  // Use first meaningful line as fallback
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

async function getSupportedFiles(folderPath: string): Promise<string[]> {
  const supportedExtensions = [".txt", ".pdf", ".docx"];
  const files: string[] = [];

  try {
    for await (const entry of Deno.readDir(folderPath)) {
      if (entry.isFile) {
        const fileName = entry.name;
        const hasSupported = supportedExtensions.some((ext) =>
          fileName.toLowerCase().endsWith(ext)
        );
        if (hasSupported) {
          files.push(`${folderPath}/${fileName}`);
        }
      }
    }
  } catch (error) {
    throw new Error(`Cannot read folder: ${error.message}`);
  }

  return files.sort();
}

async function processDocument(
  filePath: string,
  options: ProcessingOptions = DEFAULT_OPTIONS,
) {
  console.log(`📄 Processing: ${filePath.split("/").pop()}`);

  try {
    let text: string;

    if (filePath.endsWith(".docx")) {
      text = await convertDocxToText(filePath);
    } else if (filePath.endsWith(".pdf")) {
      text = await convertPdfToText(filePath);
    } else if (filePath.endsWith(".txt")) {
      text = await Deno.readTextFile(filePath);
    } else {
      throw new Error("Unsupported file format. Use .txt, .pdf, or .docx");
    }

    console.log(`📖 Document loaded: ${text.length} characters`);

    const chunks = smartChunking(text, options);
    console.log(`📝 Created ${chunks.length} chunks`);

    return chunks;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return [];
  }
}

async function processFolder(
  folderPath: string,
  options: ProcessingOptions = DEFAULT_OPTIONS,
) {
  console.log("📁 Advanced Document Processor - Folder Mode");
  console.log("============================================");
  console.log(`📂 Processing folder: ${folderPath}`);

  try {
    const files = await getSupportedFiles(folderPath);

    if (files.length === 0) {
      console.log("❌ No supported files found in folder (.txt, .pdf, .docx)");
      return;
    }

    console.log(`📋 Found ${files.length} supported files:`);
    files.forEach((file, i) => {
      console.log(`  ${i + 1}. ${file.split("/").pop()}`);
    });

    const allChunks: Array<
      { title: string; content: string; sourceFile: string }
    > = [];

    for (const file of files) {
      console.log(`\n🔄 Processing ${file.split("/").pop()}...`);
      const chunks = await processDocument(file, options);

      // Add source file info to chunks
      const chunksWithSource = chunks.map((chunk) => ({
        ...chunk,
        sourceFile: file.split("/").pop() || file,
      }));

      allChunks.push(...chunksWithSource);
    }

    console.log(`\n📊 Total chunks created: ${allChunks.length}`);

    if (allChunks.length === 0) {
      console.error("❌ No chunks created from any files.");
      return;
    }

    // Show preview
    console.log("\n📋 Preview of chunks:");
    allChunks.slice(0, 5).forEach((chunk, i) => {
      console.log(`${i + 1}. [${chunk.sourceFile}] ${chunk.title}`);
      console.log(`   Content: ${chunk.content.substring(0, 80)}...`);
    });

    if (allChunks.length > 5) {
      console.log(`   ... and ${allChunks.length - 5} more chunks`);
    }

    console.log("");
    const confirm = prompt(
      `Upload ${allChunks.length} chunks from ${files.length} files to database? (y/N): `,
    );
    if (confirm?.toLowerCase() !== "y") {
      console.log("❌ Upload cancelled");
      return;
    }

    console.log("🚀 Starting batch upload...");
    let successCount = 0;

    for (let i = 0; i < allChunks.length; i++) {
      if (i < 1169) continue;

      const chunk = allChunks[i];
      process.stdout.write(
        `[${i + 1}/${allChunks.length}] [${chunk.sourceFile}] ${
          chunk.title.substring(0, 50)
        }... `,
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
    console.log("✨ Folder processing completed!");
    console.log(
      `✅ Successfully uploaded: ${successCount}/${allChunks.length} documents from ${files.length} files`,
    );
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

async function processSingleFile(
  filePath: string,
  options: ProcessingOptions = DEFAULT_OPTIONS,
) {
  console.log("📄 Advanced Document Processor - Single File Mode");
  console.log("================================================");

  try {
    const chunks = await processDocument(filePath, options);

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
    console.log("  Single file:");
    console.log(
      "    deno run --allow-read --allow-net --allow-write --allow-run scripts/advanced-document-processor.ts <file-path>",
    );
    console.log("  Folder processing:");
    console.log(
      "    deno run --allow-read --allow-net --allow-write --allow-run scripts/advanced-document-processor.ts --folder <folder-path>",
    );
    console.log("");
    console.log("Supported formats:");
    console.log("  .txt  - Plain text files");
    console.log(
      "  .pdf  - PDF documents (requires poppler-utils or pdfplumber)",
    );
    console.log("  .docx - Word documents (requires pandoc)");
    console.log("");
    console.log("Examples:");
    console.log("  Single file:");
    console.log(
      "    deno run --allow-read --allow-net --allow-write --allow-run scripts/advanced-document-processor.ts islamic-finance-doc.pdf",
    );
    console.log("  Folder processing:");
    console.log(
      "    deno run --allow-read --allow-net --allow-write --allow-run scripts/advanced-document-processor.ts --folder scripts/data/",
    );
    console.log("");
    console.log("Install dependencies:");
    console.log(
      "  PDF support: brew install poppler (or pip install pdfplumber)",
    );
    console.log("  DOCX support: brew install pandoc");
    Deno.exit(1);
  }

  // Check for folder flag
  if (args[0] === "--folder" && args[1]) {
    await processFolder(args[1]);
  } else if (args[0] && !args[0].startsWith("--")) {
    await processSingleFile(args[0]);
  } else {
    console.error("❌ Invalid arguments. Use --folder <path> or <file-path>");
    Deno.exit(1);
  }
}
