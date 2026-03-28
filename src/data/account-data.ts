import "server-only";

import { redirect } from "next/navigation";
import { sql } from "@/lib/db";
import { requireSeller, requireUser } from "@/lib/auth";
import { formatUsd } from "@/data/shop-shared";

export type CategoryOption = {
  id: string;
  name: string;
  slug: string;
};

export type SellerDashboardData = {
  seller: {
    storeName: string;
    storeSlug: string;
    bio: string | null;
    avatarUrl: string | null;
    itemCount: number;
  };
  items: {
    id: string;
    name: string;
    description: string;
    imageUrl: string | null;
    price: string;
    priceLabel: string;
    status: string;
  }[];
};

export type CartPageData = {
  userName: string;
  items: {
    id: string;
    itemId: string;
    slug: string;
    name: string;
    sellerName: string;
    quantity: number;
    priceLabel: string;
    lineTotalLabel: string;
  }[];
  subtotalLabel: string;
  isEmpty: boolean;
};

export type OrderHistoryEntry = {
  id: string;
  createdAtLabel: string;
  status: string;
  totalLabel: string;
  items: {
    id: string;
    name: string;
    sellerName: string | null;
    quantity: number;
    totalLabel: string;
  }[];
};

export async function getCategories() {
  return (await sql.query(
    `
      SELECT id, name, slug
      FROM categories
      ORDER BY name ASC;
    `,
  )) as CategoryOption[];
}

export async function getSellerDashboardData(): Promise<SellerDashboardData> {
  const user = await requireSeller();

  const [seller] = (await sql.query(
    `
      SELECT
        sp.id,
        sp.store_name,
        sp.store_slug,
        sp.bio,
        u.avatar_url
      FROM seller_profiles sp
      INNER JOIN users u ON u.id = sp.user_id
      WHERE sp.user_id = $1
      LIMIT 1;
    `,
    [user.id],
  )) as {
    id: string;
    store_name: string;
    store_slug: string;
    bio: string | null;
    avatar_url: string | null;
  }[];

  if (!seller) {
    throw new Error("Seller profile not found for the current account.");
  }

  const rawItems = await sql.query(
    `
      SELECT id, name, description, price_cents, image_url, status
      FROM items
      WHERE seller_id = $1
      ORDER BY created_at DESC, name ASC;
    `,
    [seller.id],
  );

  const items = rawItems as {
    id: string;
    name: string;
    description: string;
    price_cents: number;
    image_url: string | null;
    status: string;
  }[];

  return {
    seller: {
      storeName: seller.store_name,
      storeSlug: seller.store_slug,
      bio: seller.bio,
      avatarUrl: seller.avatar_url,
      itemCount: items.length,
    },
    items: items.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      imageUrl: item.image_url,
      price: String(item.price_cents / 100),
      priceLabel: formatUsd(item.price_cents),
      status: item.status,
    })),
  };
}

export async function getCartPageData(): Promise<CartPageData> {
  const user = await requireUser();

  if (user.role !== "user") {
    redirect("/seller-dashboard");
  }

  const rows = (await sql.query(
    `
      SELECT
        ci.id,
        ci.item_id,
        ci.quantity,
        ci.unit_price_cents,
        i.slug,
        i.name,
        sp.store_name
      FROM carts c
      INNER JOIN cart_items ci ON ci.cart_id = c.id
      INNER JOIN items i ON i.id = ci.item_id
      LEFT JOIN seller_profiles sp ON sp.id = i.seller_id
      WHERE c.user_id = $1
        AND c.status = 'open'
      ORDER BY ci.created_at DESC;
    `,
    [user.id],
  )) as {
    id: string;
    item_id: string;
    quantity: number;
    unit_price_cents: number;
    slug: string;
    name: string;
    store_name: string | null;
  }[];

  const subtotal = rows.reduce(
    (sum, item) => sum + item.unit_price_cents * item.quantity,
    0,
  );

  return {
    userName: user.fullName,
    items: rows.map((item) => ({
      id: item.id,
      itemId: item.item_id,
      slug: item.slug,
      name: item.name,
      sellerName: item.store_name ?? "Independent seller",
      quantity: item.quantity,
      priceLabel: formatUsd(item.unit_price_cents),
      lineTotalLabel: formatUsd(item.unit_price_cents * item.quantity),
    })),
    subtotalLabel: formatUsd(subtotal),
    isEmpty: rows.length === 0,
  };
}

export async function getOrderHistory(): Promise<OrderHistoryEntry[]> {
  const user = await requireUser();

  if (user.role !== "user") {
    redirect("/seller-dashboard");
  }

  const rows = (await sql.query(
    `
      SELECT
        o.id AS order_id,
        o.status,
        o.total_cents,
        o.created_at,
        oi.id AS order_item_id,
        oi.item_name,
        oi.quantity,
        oi.line_total_cents,
        sp.store_name
      FROM orders o
      LEFT JOIN order_items oi ON oi.order_id = o.id
      LEFT JOIN seller_profiles sp ON sp.id = oi.seller_id
      WHERE o.user_id = $1
      ORDER BY o.created_at DESC, oi.created_at ASC;
    `,
    [user.id],
  )) as {
    order_id: string;
    status: string;
    total_cents: number;
    created_at: string;
    order_item_id: string | null;
    item_name: string | null;
    quantity: number | null;
    line_total_cents: number | null;
    store_name: string | null;
  }[];

  const orders = new Map<string, OrderHistoryEntry>();

  for (const row of rows) {
    const current = orders.get(row.order_id);

    if (!current) {
      orders.set(row.order_id, {
        id: row.order_id,
        createdAtLabel: new Intl.DateTimeFormat("en-US", {
          dateStyle: "medium",
          timeStyle: "short",
        }).format(new Date(row.created_at)),
        status: row.status,
        totalLabel: formatUsd(row.total_cents),
        items: [],
      });
    }

    if (!row.order_item_id || !row.item_name || row.quantity === null || row.line_total_cents === null) {
      continue;
    }

    orders.get(row.order_id)?.items.push({
      id: row.order_item_id,
      name: row.item_name,
      sellerName: row.store_name,
      quantity: row.quantity,
      totalLabel: formatUsd(row.line_total_cents),
    });
  }

  return Array.from(orders.values());
}
