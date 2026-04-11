import { SiteShell } from "@/components/site-shell";
import { getCurrentUser } from "@/lib/auth";
import { getShopSellers } from "@/data/shop-data";
import { ShopBrowser } from "./shop-browser";

type ShopPageProps = {
  searchParams: Promise<{
    seller?: string;
  }>;
};

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const user = await getCurrentUser();
  const sellers = await getShopSellers(user?.id);
  const { seller } = await searchParams;

  return (
    <SiteShell currentPath="/shop">
      <ShopBrowser initialSellerFilter={seller} sellers={sellers} />
    </SiteShell>
  );
}
