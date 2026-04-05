import Link from "next/link";
import { checkoutAction } from "@/app/actions";
import { SiteShell } from "@/components/site-shell";
import { getCartPageData } from "@/data/account-data";
import { SubmitButton } from "@/components/submit-button";
import styles from "./page.module.css";

type CartPageProps = {
  searchParams: Promise<{
    success?: string;
  }>;
};

export default async function CartPage({ searchParams }: CartPageProps) {
  const cart = await getCartPageData();
  const { success } = await searchParams;
  const purchaseComplete = success === "1";
  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <SiteShell currentPath="/cart">
      <section className={styles.cart}>
        <div className={styles.hero}>
          <div className={styles.header}>
            <div>
              <p className={styles.title}>Current cart</p>
              <h1>{cart.userName}, review your order before checkout.</h1>
              <p className={styles.subtitle}>
                Keep track of each handmade item, confirm your total, and place the
                order when everything looks right.
              </p>
            </div>
            <Link className={styles.ordersLink} href="/orders">
              View past orders
            </Link>
          </div>
        </div>

        {purchaseComplete ? (
          <div className={styles.successBanner}>
            <div>
              <p className={styles.successLabel}>Purchase confirmed</p>
              <h2>Your order was placed successfully.</h2>
              <p>
                Your cart has been cleared and the new order is now available in your
                order history.
              </p>
            </div>
            <Link className={styles.successLink} href="/orders">
              View order history
            </Link>
          </div>
        ) : null}

        <div className={styles.content}>
          <div className={styles.list}>
            {cart.isEmpty ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon} aria-hidden="true">
                  Bag
                </div>
                <div className={styles.emptyCopy}>
                  <h2>Your cart is empty.</h2>
                  <p>
                    Explore the shop to add handmade goods from independent makers.
                  </p>
                </div>
                <Link className={styles.ordersLink} href="/shop">
                  Browse the shop
                </Link>
              </div>
            ) : (
              cart.items.map((item, index) => (
                <article key={item.id} className={styles.itemRow}>
                  <div className={styles.thumb}>
                    {item.imageUrl ? (
                      <img
                        alt={item.name}
                        className={styles.thumbImage}
                        src={item.imageUrl}
                      />
                    ) : (
                      <span>Item {index + 1}</span>
                    )}
                  </div>
                  <div className={styles.itemDetails}>
                    <Link href={`/shop/${item.slug}`}>{item.name}</Link>
                    <span>{item.sellerName}</span>
                    <small>Quantity {item.quantity}</small>
                  </div>
                  <div className={styles.priceBlock}>
                    <span>{item.priceLabel} each</span>
                    <strong className={styles.price}>{item.lineTotalLabel}</strong>
                  </div>
                </article>
              ))
            )}
          </div>

          <aside className={styles.summary}>
            <div className={styles.summaryHeader}>
              <p>Order summary</p>
              <h2>{cart.subtotalLabel}</h2>
            </div>
            <div className={styles.summaryRows}>
              <div className={styles.totals}>
                <span>Items</span>
                <span>{itemCount}</span>
              </div>
              <div className={styles.totals}>
                <span>Subtotal</span>
                <span>{cart.subtotalLabel}</span>
              </div>
            </div>
            <p className={styles.summaryNote}>
              Checkout will create your order immediately and move it into your order
              history.
            </p>
            <form action={checkoutAction}>
              <SubmitButton
                className={styles.checkout}
                disabled={cart.isEmpty}
                pendingLabel="Processing..."
              >
                Place order
              </SubmitButton>
            </form>
          </aside>
        </div>
      </section>
    </SiteShell>
  );
}
