import { notFound } from "next/navigation";
import { SiteShell } from "@/components/site-shell";
import { addToCartAction } from "@/app/actions";
import { SubmitButton } from "@/components/submit-button";
import { getShopItemBySlug } from "@/data/shop-data";
import { formatUsd } from "@/data/shop-shared";
import styles from "./page.module.css";

type ProductPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = await getShopItemBySlug(id);

  if (!product) {
    notFound();
  }

  const addToCartWithItem = addToCartAction.bind(null, product.id);

  return (
    <SiteShell currentPath="/shop">
      <section className={styles.product}>
        <div className={styles.imageBox}>
          {product.image_url ? (
            <img
              alt={product.name}
              className={styles.productImage}
              src={product.image_url}
            />
          ) : (
            <span className={styles.imageLabel}>crafted item</span>
          )}
        </div>

        <div className={styles.details}>
          <h1>{product.name}</h1>
          <p className={styles.seller}>{product.seller_name}</p>
          <p>{product.description}</p>
          <div className={styles.priceBox}>{formatUsd(product.price_cents)}</div>
          <div className={styles.buyRow}>
            <form action={addToCartWithItem}>
              <SubmitButton className={styles.buyButton} pendingLabel="Adding...">
                Add to cart
              </SubmitButton>
            </form>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
