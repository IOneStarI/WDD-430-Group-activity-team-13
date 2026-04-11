import "server-only";

import { sql } from "@/lib/db";

let schemaReady = false;

export async function ensureItemReviewsSchema() {
  if (schemaReady) {
    return;
  }

  await sql.query(`
    CREATE EXTENSION IF NOT EXISTS pgcrypto;
  `);

  await sql.query(`
    CREATE OR REPLACE FUNCTION set_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  await sql.query(`
    CREATE TABLE IF NOT EXISTS item_reviews (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (item_id, user_id)
    );
  `);

  await sql.query(`
    CREATE INDEX IF NOT EXISTS idx_item_reviews_item_id ON item_reviews(item_id);
  `);

  await sql.query(`
    DROP TRIGGER IF EXISTS set_item_reviews_updated_at ON item_reviews;
  `);

  await sql.query(`
    CREATE TRIGGER set_item_reviews_updated_at
    BEFORE UPDATE ON item_reviews
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();
  `);

  schemaReady = true;
}
