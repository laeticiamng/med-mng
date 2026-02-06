
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;

-- Create embeddings table for RAG
CREATE TABLE public.edn_embeddings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item_code TEXT NOT NULL,
  title TEXT NOT NULL,
  content_chunk TEXT NOT NULL,
  chunk_index INTEGER NOT NULL DEFAULT 0,
  embedding vector(1536),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index for fast vector similarity search
CREATE INDEX idx_edn_embeddings_embedding ON public.edn_embeddings 
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Index for item lookups
CREATE INDEX idx_edn_embeddings_item_code ON public.edn_embeddings (item_code);

-- Unique constraint to prevent duplicate chunks
CREATE UNIQUE INDEX idx_edn_embeddings_unique_chunk ON public.edn_embeddings (item_code, chunk_index);

-- Enable RLS
ALTER TABLE public.edn_embeddings ENABLE ROW LEVEL SECURITY;

-- Public read access (embeddings are derived from public EDN content)
CREATE POLICY "Embeddings are readable by authenticated users"
  ON public.edn_embeddings FOR SELECT
  USING (auth.role() = 'authenticated');

-- Only service role can insert/update (via edge function)
CREATE POLICY "Service role can manage embeddings"
  ON public.edn_embeddings FOR ALL
  USING (auth.role() = 'service_role');

-- Similarity search function
CREATE OR REPLACE FUNCTION public.match_edn_embeddings(
  query_embedding vector(1536),
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  item_code TEXT,
  title TEXT,
  content_chunk TEXT,
  chunk_index INTEGER,
  metadata JSONB,
  similarity FLOAT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.id,
    e.item_code,
    e.title,
    e.content_chunk,
    e.chunk_index,
    e.metadata,
    1 - (e.embedding <=> query_embedding) AS similarity
  FROM public.edn_embeddings e
  WHERE 1 - (e.embedding <=> query_embedding) > match_threshold
  ORDER BY e.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Trigger for updated_at
CREATE TRIGGER update_edn_embeddings_updated_at
  BEFORE UPDATE ON public.edn_embeddings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
