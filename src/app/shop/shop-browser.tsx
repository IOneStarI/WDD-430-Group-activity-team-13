"use client";

import Link from "next/link";
import { useState } from "react";
import { addToCartAction } from "@/app/actions";
import { SubmitButton } from "@/components/submit-button";
import { formatUsd, ShopSeller } from "@/data/shop-shared";
import styles from "./page.module.css";

type ShopBrowserProps = {
  sellers: ShopSeller[];
  initialSellerFilter?: string;
};

export function ShopBrowser({ sellers, initialSellerFilter = "all" }: ShopBrowserProps) {
  const [selectedSeller, setSelectedSeller] = useState(
    sellers.some((seller) => seller.storeSlug === initialSellerFilter)
      ? initialSellerFilter
      : "all",
  );
  const [itemNameQuery, setItemNameQuery] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const normalizedQuery = itemNameQuery.trim().toLowerCase();
  const maxPriceCents = maxPrice === "" ? Number.POSITIVE_INFINITY : Number(maxPrice) * 100;

  const filteredSellers = sellers
    .map((seller) => ({
      ...seller,
      items: seller.items.filter((item) => {
        const matchesSeller =
          selectedSeller === "all" || seller.storeSlug === selectedSeller;
        const matchesName =
          normalizedQuery === "" || item.name.toLowerCase().includes(normalizedQuery);
        const matchesPrice = Number.isNaN(maxPriceCents) || item.priceCents <= maxPriceCents;

        return matchesSeller && matchesName && matchesPrice;
      }),
    }))
    .filter((seller) => seller.items.length > 0);

  const visibleItemCount = filteredSellers.reduce(
    (count, seller) => count + seller.items.length,
    0,
  );

  return (
    <div className={styles.shop}>
      <section className={styles.heroPanel}>
        <div className={styles.metricRow}>
          <div className={styles.metricCard}>
            <span className={styles.metricValue}>{sellers.length}</span>
            <span className={styles.metricLabel}>artisan sellers</span>
          </div>
          <div className={styles.metricCard}>
            <span className={styles.metricValue}>{visibleItemCount}</span>
            <span className={styles.metricLabel}>matching items</span>
          </div>
          <div className={styles.metricCard}>
            <span className={styles.metricValue}>Live</span>
            <span className={styles.metricLabel}>database inventory</span>
          </div>
        </div>

        <div className={styles.filterPanel}>
          <div className={styles.filterHeader}>
            <div>
              <p className={styles.filterEyebrow}>Marketplace filters</p>
              <h2 className={styles.filterTitle}>Browse by seller, item name, and price.</h2>
            </div>
            <button
              className={styles.resetButton}
              type="button"
              onClick={() => {
                setSelectedSeller("all");
                setItemNameQuery("");
                setMaxPrice("");
              }}
            >
              Reset
            </button>
          </div>

          <div className={styles.filterGrid}>
            <label className={styles.filterField}>
              <span>Seller</span>
              <select
                value={selectedSeller}
                onChange={(event) => setSelectedSeller(event.target.value)}
              >
                <option value="all">All sellers</option>
                {sellers.map((seller) => (
                  <option key={seller.id} value={seller.storeSlug}>
                    {seller.storeName}
                  </option>
                ))}
              </select>
            </label>

            <label className={styles.filterField}>
              <span>Item name</span>
              <input
                type="text"
                placeholder="Search by item name"
                value={itemNameQuery}
                onChange={(event) => setItemNameQuery(event.target.value)}
              />
            </label>

            <label className={styles.filterField}>
              <span>Max price</span>
              <input
                type="number"
                min="0"
                step="1"
                placeholder="No limit"
                value={maxPrice}
                onChange={(event) => setMaxPrice(event.target.value)}
              />
            </label>
          </div>
        </div>
      </section>

      <div className={styles.grid}>
        {filteredSellers.length === 0 ? (
          <div className={styles.emptyState}>
            <p className={styles.emptyTitle}>No items match those filters.</p>
            <p className={styles.emptyCopy}>
              Try another seller, a broader item search, or a higher price.
            </p>
          </div>
        ) : (
          filteredSellers.map((seller) => (
            <section key={seller.id} className={styles.sellerSection}>
              <div className={styles.sellerHeading}>
                <p className={styles.sellerKicker}>Seller</p>
                <h3 className={styles.sellerName}>{seller.storeName}</h3>
                <p className={styles.sellerMeta}>
                  {seller.items.length} {seller.items.length === 1 ? "item" : "items"}
                </p>
                {seller.bio ? <p className={styles.sellerBio}>{seller.bio}</p> : null}
              </div>

              <div className={styles.itemGrid}>
                {seller.items.map((item) => {
                  const addToCartWithItem = addToCartAction.bind(null, item.id);

                  return (
                    <article key={item.id} className={styles.item}>
                      <Link href={`/shop/${item.slug}`} className={styles.itemLink}>
                        <div className={styles.itemBox}>
                          <span className={styles.itemBadge}>
                            {seller.storeName.split(" ")[0]}
                          </span>
                          {item.imageUrl ? (
                            <img
                              alt={item.name}
                              className={styles.itemImage}
                              src={item.imageUrl}
                            />
                          ) : (
                            <span className={styles.itemPlaceholder}>Handmade item</span>
                          )}
                        </div>
                        <div className={styles.itemContent}>
                          <p className={styles.itemName}>{item.name}</p>
                          <p className={styles.itemDescription}>{item.description}</p>
                        </div>
                      </Link>
                      <div className={styles.itemFooter}>
                        <p className={styles.itemPrice}>{formatUsd(item.priceCents)}</p>
                        <form action={addToCartWithItem}>
                          <SubmitButton
                            className={styles.addToCartButton}
                            pendingLabel="Adding..."
                          >
                            Add to cart
                          </SubmitButton>
                        </form>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          ))
        )}
      </div>
    </div>
  );
}
