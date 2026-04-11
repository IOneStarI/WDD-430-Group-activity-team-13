import { notFound } from "next/navigation";
import { SiteShell } from "@/components/site-shell";
import { addToCartAction, reviewItemAction } from "@/app/actions";
import { SubmitButton } from "@/components/submit-button";
import { getCurrentUser } from "@/lib/auth";
import { getShopItemBySlug } from "@/data/shop-data";
import { formatUsd } from "@/data/shop-shared";
import styles from "./page.module.css";

type ProductPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function RatingSummary({
  rating,
  reviewCount,
}: {
  rating: number;
  reviewCount: number;
}) {
  return (
    <div className={styles.ratingSummary}>
      <div className={styles.ratingStars} aria-hidden="true">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} data-active={rating >= star}>
            &#9733;
          </span>
        ))}
      </div>
      <span>
        {rating.toFixed(1)} ·{" "}
        {reviewCount > 0
          ? `${reviewCount} ${reviewCount === 1 ? "review" : "reviews"}`
          : "No reviews yet"}
      </span>
    </div>
  );
}

function ReviewForm({
  itemId,
  userRating,
}: {
  itemId: string;
  userRating: number | null;
}) {
  return (
    <form action={reviewItemAction} className={styles.reviewForm}>
      <input name="itemId" type="hidden" value={itemId} />
      <p>{userRating ? "Update your rating" : "Leave a star review"}</p>
      <div className={styles.reviewStars}>
        {[5, 4, 3, 2, 1].map((rating) => (
          <button
            key={rating}
            aria-label={`Rate ${rating} star${rating === 1 ? "" : "s"}`}
            className={styles.reviewStar}
            data-active={userRating !== null && rating <= userRating}
            name="rating"
            title={`Rate ${rating} star${rating === 1 ? "" : "s"}`}
            type="submit"
            value={rating}
          >
            &#9733;
          </button>
        ))}
      </div>
    </form>
  );
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const user = await getCurrentUser();
  const product = await getShopItemBySlug(id, user?.id);

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
          <section className={styles.reviewPanel} aria-label="Item rating">
            <RatingSummary
              rating={Number(product.rating ?? 0)}
              reviewCount={product.review_count ?? 0}
            />
            {user?.role === "user" ? (
              <ReviewForm itemId={product.id} userRating={product.user_rating} />
            ) : (
              <p className={styles.reviewHint}>Log in as a shopper to leave a rating.</p>
            )}
          </section>
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
