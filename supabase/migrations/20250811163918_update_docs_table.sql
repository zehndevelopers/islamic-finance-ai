-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_docs_title ON public.docs(title);
CREATE INDEX IF NOT EXISTS idx_docs_created_at ON public.docs(created_at DESC);

-- Create index for vector similarity search (if using pgvector)
-- CREATE INDEX IF NOT EXISTS idx_docs_embedding ON public.docs 
-- USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Enable Row Level Security (documents are public for reading)
ALTER TABLE public.docs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for documents
CREATE POLICY "Anyone can view documents" ON public.docs
    FOR SELECT USING (true);

-- Only authenticated users can manage documents (admin functionality)
CREATE POLICY "Authenticated users can insert documents" ON public.docs
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update documents" ON public.docs
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete documents" ON public.docs
    FOR DELETE USING (auth.role() = 'authenticated');
