-- Create function for vector similarity search
CREATE OR REPLACE FUNCTION match_docs(
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id uuid,
  title text,
  content text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    docs.id,
    docs.title,
    docs.content,
    1 - (docs.embedding <=> query_embedding) AS similarity
  FROM docs
  WHERE 1 - (docs.embedding <=> query_embedding) > match_threshold
  ORDER BY docs.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
