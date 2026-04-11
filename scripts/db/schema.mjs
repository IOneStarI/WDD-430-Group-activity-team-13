export const marketplaceSchemaStatements = [
  `
    CREATE EXTENSION IF NOT EXISTS pgcrypto;
  `,
  `
    CREATE OR REPLACE FUNCTION set_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `,
  `
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT,
      full_name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'seller', 'admin')),
      avatar_url TEXT,
      phone TEXT,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `,
  `
    CREATE TABLE IF NOT EXISTS categories (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL UNIQUE,
      slug TEXT NOT NULL UNIQUE,
      description TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `,
  `
    CREATE TABLE IF NOT EXISTS seller_profiles (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      store_name TEXT NOT NULL UNIQUE,
      store_slug TEXT NOT NULL UNIQUE,
      bio TEXT,
      contact_email TEXT,
      contact_phone TEXT,
      status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'suspended')),
      rating NUMERIC(3, 2) NOT NULL DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `,
  `
    CREATE TABLE IF NOT EXISTS addresses (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      label TEXT,
      recipient_name TEXT NOT NULL,
      line1 TEXT NOT NULL,
      line2 TEXT,
      city TEXT NOT NULL,
      state TEXT,
      postal_code TEXT NOT NULL,
      country TEXT NOT NULL DEFAULT 'US',
      is_default BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `,
  `
    CREATE TABLE IF NOT EXISTS items (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      seller_id UUID NOT NULL REFERENCES seller_profiles(id) ON DELETE CASCADE,
      category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
      slug TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      price_cents INTEGER NOT NULL CHECK (price_cents >= 0),
      currency TEXT NOT NULL DEFAULT 'USD',
      stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
      status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived', 'sold_out')),
      image_url TEXT,
      is_featured BOOLEAN NOT NULL DEFAULT FALSE,
      rating NUMERIC(3, 2) NOT NULL DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `,
  `
    CREATE TABLE IF NOT EXISTS item_reviews (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (item_id, user_id)
    );
  `,
  `
    CREATE TABLE IF NOT EXISTS carts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'ordered', 'abandoned')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `,
  `
    CREATE TABLE IF NOT EXISTS cart_items (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      cart_id UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
      item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
      quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
      unit_price_cents INTEGER NOT NULL CHECK (unit_price_cents >= 0),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (cart_id, item_id)
    );
  `,
  `
    CREATE TABLE IF NOT EXISTS orders (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
      shipping_address_id UUID REFERENCES addresses(id) ON DELETE SET NULL,
      status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'shipped', 'completed', 'cancelled')),
      subtotal_cents INTEGER NOT NULL DEFAULT 0 CHECK (subtotal_cents >= 0),
      total_cents INTEGER NOT NULL DEFAULT 0 CHECK (total_cents >= 0),
      notes TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `,
  `
    CREATE TABLE IF NOT EXISTS order_items (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      item_id UUID REFERENCES items(id) ON DELETE SET NULL,
      seller_id UUID REFERENCES seller_profiles(id) ON DELETE SET NULL,
      item_name TEXT NOT NULL,
      quantity INTEGER NOT NULL CHECK (quantity > 0),
      unit_price_cents INTEGER NOT NULL CHECK (unit_price_cents >= 0),
      line_total_cents INTEGER NOT NULL CHECK (line_total_cents >= 0),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `,
  `
    CREATE TABLE IF NOT EXISTS contact_messages (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE SET NULL,
      order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      subject TEXT NOT NULL,
      message TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'closed')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `,
  `
    CREATE INDEX IF NOT EXISTS idx_items_seller_id ON items(seller_id);
  `,
  `
    CREATE INDEX IF NOT EXISTS idx_items_category_id ON items(category_id);
  `,
  `
    CREATE INDEX IF NOT EXISTS idx_items_status ON items(status);
  `,
  `
    CREATE INDEX IF NOT EXISTS idx_item_reviews_item_id ON item_reviews(item_id);
  `,
  `
    CREATE INDEX IF NOT EXISTS idx_carts_user_id ON carts(user_id);
  `,
  `
    CREATE UNIQUE INDEX IF NOT EXISTS idx_carts_one_open_cart_per_user
    ON carts(user_id)
    WHERE status = 'open';
  `,
  `
    CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
  `,
  `
    CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
  `,
  `
    CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON addresses(user_id);
  `,
  `
    CREATE UNIQUE INDEX IF NOT EXISTS idx_addresses_one_default_per_user
    ON addresses(user_id)
    WHERE is_default = TRUE;
  `,
  `
    DROP TRIGGER IF EXISTS set_users_updated_at ON users;
  `,
  `
    CREATE TRIGGER set_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();
  `,
  `
    DROP TRIGGER IF EXISTS set_seller_profiles_updated_at ON seller_profiles;
  `,
  `
    CREATE TRIGGER set_seller_profiles_updated_at
    BEFORE UPDATE ON seller_profiles
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();
  `,
  `
    DROP TRIGGER IF EXISTS set_addresses_updated_at ON addresses;
  `,
  `
    CREATE TRIGGER set_addresses_updated_at
    BEFORE UPDATE ON addresses
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();
  `,
  `
    DROP TRIGGER IF EXISTS set_items_updated_at ON items;
  `,
  `
    CREATE TRIGGER set_items_updated_at
    BEFORE UPDATE ON items
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();
  `,
  `
    DROP TRIGGER IF EXISTS set_item_reviews_updated_at ON item_reviews;
  `,
  `
    CREATE TRIGGER set_item_reviews_updated_at
    BEFORE UPDATE ON item_reviews
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();
  `,
  `
    DROP TRIGGER IF EXISTS set_carts_updated_at ON carts;
  `,
  `
    CREATE TRIGGER set_carts_updated_at
    BEFORE UPDATE ON carts
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();
  `,
  `
    DROP TRIGGER IF EXISTS set_cart_items_updated_at ON cart_items;
  `,
  `
    CREATE TRIGGER set_cart_items_updated_at
    BEFORE UPDATE ON cart_items
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();
  `,
  `
    DROP TRIGGER IF EXISTS set_orders_updated_at ON orders;
  `,
  `
    CREATE TRIGGER set_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();
  `,
  `
    DROP TRIGGER IF EXISTS set_contact_messages_updated_at ON contact_messages;
  `,
  `
    CREATE TRIGGER set_contact_messages_updated_at
    BEFORE UPDATE ON contact_messages
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();
  `,
];
