import Link from "next/link";
import { SiteShell } from "@/components/site-shell";
import { getShopSellers } from "@/data/shop-data";
import styles from "./home.module.css";

export default async function Home() {
  const sellers = await getShopSellers();
  const featuredSellers = sellers.filter((seller) => seller.items.length > 0).slice(0, 4);

  return (
    <SiteShell currentPath="/">
      <div className={styles.home}>
        
        <div className={styles.heroBox}>curated handmade marketplace</div>

        <section className={styles.description}>
          <h1>Handcrafted Haven connects buyers with real seller storefronts.</h1>
          <p>
            Sellers register directly in the marketplace, publish products from their
            dashboard, and appear in the shop when inventory goes live. Buyers can
            place orders and review their order history from the same account.
          </p>
        </section>

        <section className={styles.sellerSection}>
          <p className={styles.sellerHeader}>Live sellers</p>
          <div className={styles.sellerCards}>
            {featuredSellers.map((seller) => (
              <Link
                key={seller.id}
                className={styles.sellerCard}
                href={`/shop?seller=${seller.storeSlug}`}
              >
                {seller.avatarUrl ? (
                  <img
                    alt={seller.storeName}
                    className={styles.sellerImage}
                    src={seller.avatarUrl}
                  />
                ) : (
                  <div className={styles.sellerFallback}>{seller.storeName.slice(0, 1)}</div>
                )}
                <div className={styles.sellerOverlay}>
                  <strong>{seller.storeName}</strong>
                  <span>
                    {seller.items.length} {seller.items.length === 1 ? "item" : "items"}
                  </span>
                </div>
              </Link>
            ))}
            <Link className={styles.sellerCard} href="/shop">
              <div className={styles.sellerFallback}>+</div>
              <div className={styles.sellerOverlay}>
                <strong>Browse more</strong>
                <span>Open all sellers</span>
              </div>
            </Link>
          </div>
        </section>
      </div>
    </SiteShell>
  );
}
