export type ShopItem = {
  id: string;
  slug: string;
  name: string;
  description: string;
  priceCents: number;
  imageUrl: string | null;
};

export type ShopSeller = {
  id: string;
  storeName: string;
  storeSlug: string;
  bio: string | null;
  avatarUrl: string | null;
  items: ShopItem[];
};

export function formatUsd(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}
