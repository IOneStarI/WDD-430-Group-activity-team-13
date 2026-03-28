import Link from "next/link";
import { checkoutAction } from "@/app/actions";
import { SiteShell } from "@/components/site-shell";
import { getCartPageData } from "@/data/account-data";
import { SubmitButton } from "@/components/submit-button";
import styles from "./page.module.css";

export default async function CartPage() {
  const cart = await getCartPageData();

  return (
    <SiteShell currentPath="/cart">
      <div className={styles.cart}>
        <div className={styles.header}>
          <div>
            <p className={styles.title}>Current cart</p>
            <h1>{cart.userName}, review your order before checkout.</h1>
          </div>
          <Link className={styles.ordersLink} href="/orders">
            View past orders
          </Link>
        </div>

        <div className={styles.list}>
          {cart.isEmpty ? (
            <div className={styles.emptyState}>
              <p>Your cart is empty.</p>
              <Link className={styles.ordersLink} href="/shop">
                Browse the shop
              </Link>
            </div>
          ) : (
            cart.items.map((item, index) => (
              <div key={item.id} className={styles.itemRow}>
                <div className={styles.thumb}>item {index + 1}</div>
                <div className={styles.itemDetails}>
                  <Link href={`/shop/${item.slug}`}>{item.name}</Link>
                  <span>{item.sellerName}</span>
                  <small>Qty {item.quantity}</small>
                </div>
                <div className={styles.priceBlock}>
                  <span>{item.priceLabel} each</span>
                  <strong className={styles.price}>{item.lineTotalLabel}</strong>
                </div>
              </div>
            ))
          )}
        </div>

        <div className={styles.summary}>
          <div className={styles.totals}>
            <span>Total</span>
            <span>{cart.subtotalLabel}</span>
          </div>
          <form action={checkoutAction}>
            <SubmitButton
              className={styles.checkout}
              disabled={cart.isEmpty}
              pendingLabel="Processing..."
            >
              Checkout
            </SubmitButton>
          </form>
        </div>
      </div>
    </SiteShell>
  );
}
