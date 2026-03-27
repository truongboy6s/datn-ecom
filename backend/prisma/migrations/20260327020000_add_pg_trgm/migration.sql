-- Enable pg_trgm extension for fuzzy search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create GIN index on product name for fast trigram matching
CREATE INDEX IF NOT EXISTS idx_product_name_trgm ON "Product" USING GIN (name gin_trgm_ops);
