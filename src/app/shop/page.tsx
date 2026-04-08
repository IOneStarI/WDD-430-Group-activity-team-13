import { SiteShell } from "@/components/site-shell";
import { getShopSellers } from "@/data/shop-data";
import { ShopBrowser } from "./shop-browser";

type ShopPageProps = {
  searchParams: Promise<{
    seller?: string;
  }>;
};

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const sellers = await getShopSellers();
  const { seller } = await searchParams;

  return (
    <SiteShell currentPath="/shop">
      <ShopBrowser initialSellerFilter={seller} sellers={sellers} />
    </SiteShell>
  );
}
