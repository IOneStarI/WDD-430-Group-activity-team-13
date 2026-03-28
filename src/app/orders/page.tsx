import { SiteShell } from "@/components/site-shell";
import { getOrderHistory } from "@/data/account-data";
import styles from "./page.module.css";

export default async function OrdersPage() {
  const orders = await getOrderHistory();

  return (
    <SiteShell currentPath="/orders">
      <section className={styles.orders}>
        <div className={styles.header}>
          <p className={styles.eyebrow}>Order history</p>
          <h1>Your previous marketplace purchases.</h1>
        </div>

        <div className={styles.list}>
          {orders.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No orders yet. Place your first order from the shop.</p>
            </div>
          ) : (
            orders.map((order) => (
              <article key={order.id} className={styles.orderCard}>
                <div className={styles.orderHeader}>
                  <div>
                    <h2>Order {order.id.slice(0, 8)}</h2>
                    <p>{order.createdAtLabel}</p>
                  </div>
                  <div className={styles.orderMeta}>
                    <span>{order.status}</span>
                    <strong>{order.totalLabel}</strong>
                  </div>
                </div>

                <div className={styles.items}>
                  {order.items.map((item) => (
                    <div key={item.id} className={styles.itemRow}>
                      <div>
                        <p>{item.name}</p>
                        <small>
                          {item.sellerName ?? "Independent seller"} · Qty {item.quantity}
                        </small>
                      </div>
                      <span>{item.totalLabel}</span>
                    </div>
                  ))}
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </SiteShell>
  );
}
