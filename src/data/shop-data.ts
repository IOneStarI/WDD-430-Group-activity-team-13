import "server-only";

import { sql } from "@/lib/db";
import { ShopSeller } from "@/data/shop-shared";

type ShopSellerRow = {
  seller_id: string;
  store_name: string;
  store_slug: string;
  bio: string | null;
  avatar_url: string | null;
  item_id: string | null;
  item_slug: string | null;
  item_name: string | null;
  item_description: string | null;
  price_cents: number | null;
  image_url: string | null;
};

export async function getShopSellers() {
  const rows = (await sql`
    SELECT
      sp.id AS seller_id,
      sp.store_name,
      sp.store_slug,
      sp.bio,
      u.avatar_url,
      i.id AS item_id,
      i.slug AS item_slug,
      i.name AS item_name,
      i.description AS item_description,
      i.price_cents,
      i.image_url
    FROM seller_profiles sp
    INNER JOIN users u ON u.id = sp.user_id
    LEFT JOIN items i
      ON i.seller_id = sp.id
      AND i.status = 'active'
    WHERE sp.status = 'approved'
    ORDER BY sp.store_name ASC, i.is_featured DESC, i.created_at DESC, i.name ASC
  `) as ShopSellerRow[];

  const sellers = new Map<string, ShopSeller>();

  for (const row of rows) {
    const existingSeller = sellers.get(row.seller_id);

    if (!existingSeller) {
      sellers.set(row.seller_id, {
        id: row.seller_id,
        storeName: row.store_name,
        storeSlug: row.store_slug,
        bio: row.bio,
        avatarUrl: row.avatar_url,
        items: [],
      });
    }

    if (!row.item_id) {
      continue;
    }

    sellers.get(row.seller_id)?.items.push({
      id: row.item_id,
      slug: row.item_slug ?? row.item_id,
      name: row.item_name ?? "Untitled item",
      description: row.item_description ?? "",
      priceCents: row.price_cents ?? 0,
      imageUrl: row.image_url,
    });
  }

  return Array.from(sellers.values());
}

export async function getShopItemBySlug(slug: string) {
  const [item] = (await sql`
    SELECT
      i.id,
      i.slug,
      i.name,
      i.description,
      i.price_cents,
      i.image_url,
      sp.store_name AS seller_name
    FROM items i
    INNER JOIN seller_profiles sp ON sp.id = i.seller_id
    WHERE i.slug = ${slug}
      AND i.status = 'active'
      AND sp.status = 'approved'
    LIMIT 1
  `) as {
    id: string;
    slug: string;
    name: string;
    description: string;
    price_cents: number;
    image_url: string | null;
    seller_name: string;
  }[];

  return item ?? null;
}
