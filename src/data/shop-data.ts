import "server-only";

import { sql } from "@/lib/db";
import { ShopSeller } from "@/data/shop-shared";
import { ensureItemReviewsSchema } from "@/data/review-data";

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
  rating: number | null;
  review_count: number | null;
  user_rating: number | null;
};

export async function getShopSellers(currentUserId?: string) {
  await ensureItemReviewsSchema();

  const rows = (await sql.query(
    `
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
      i.image_url,
      COALESCE(review_stats.average_rating, i.rating, 0) AS rating,
      COALESCE(review_stats.review_count, 0) AS review_count,
      user_review.rating AS user_rating
    FROM seller_profiles sp
    INNER JOIN users u ON u.id = sp.user_id
    LEFT JOIN items i
      ON i.seller_id = sp.id
      AND i.status = 'active'
    LEFT JOIN (
      SELECT
        item_id,
        ROUND(AVG(rating)::numeric, 1) AS average_rating,
        COUNT(*)::integer AS review_count
      FROM item_reviews
      GROUP BY item_id
    ) review_stats ON review_stats.item_id = i.id
    LEFT JOIN item_reviews user_review
      ON user_review.item_id = i.id
      AND user_review.user_id = $1
    WHERE sp.status = 'approved'
    ORDER BY sp.store_name ASC, i.is_featured DESC, i.created_at DESC, i.name ASC
  `,
    [currentUserId ?? null],
  )) as ShopSellerRow[];

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
      rating: Number(row.rating ?? 0),
      reviewCount: row.review_count ?? 0,
      userRating: row.user_rating,
    });
  }

  return Array.from(sellers.values());
}

export async function getShopItemBySlug(slug: string, currentUserId?: string) {
  await ensureItemReviewsSchema();

  const [item] = (await sql.query(
    `
    SELECT
      i.id,
      i.slug,
      i.name,
      i.description,
      i.price_cents,
      i.image_url,
      COALESCE(review_stats.average_rating, i.rating, 0) AS rating,
      COALESCE(review_stats.review_count, 0) AS review_count,
      user_review.rating AS user_rating,
      sp.store_name AS seller_name
    FROM items i
    INNER JOIN seller_profiles sp ON sp.id = i.seller_id
    LEFT JOIN (
      SELECT
        item_id,
        ROUND(AVG(rating)::numeric, 1) AS average_rating,
        COUNT(*)::integer AS review_count
      FROM item_reviews
      GROUP BY item_id
    ) review_stats ON review_stats.item_id = i.id
    LEFT JOIN item_reviews user_review
      ON user_review.item_id = i.id
      AND user_review.user_id = $2
    WHERE i.slug = $1
      AND i.status = 'active'
      AND sp.status = 'approved'
    LIMIT 1
  `,
    [slug, currentUserId ?? null],
  )) as {
    id: string;
    slug: string;
    name: string;
    description: string;
    price_cents: number;
    image_url: string | null;
    rating: number | null;
    review_count: number | null;
    user_rating: number | null;
    seller_name: string;
  }[];

  return item ?? null;
}
