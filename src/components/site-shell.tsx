import Link from "next/link";
import { ReactNode } from "react";
import { getCurrentUser } from "@/lib/auth";
import { logoutAction } from "@/app/actions";
import styles from "./site-shell.module.css";

type SiteShellProps = {
  children: ReactNode;
  currentPath:
    | "/"
    | "/shop"
    | "/contact-us"
    | "/cart"
    | "/login"
    | "/seller-dashboard"
    | "/orders";
};

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/contact-us", label: "contact us" },
] as const;

export async function SiteShell({ children, currentPath }: SiteShellProps) {
  const user = await getCurrentUser();

  return (
    <div className={styles.page}>
      <div className={styles.frame}>
        <header className={styles.header}>
          <Link className={styles.logo} href="/">
            handcrafted haven
          </Link>

          <nav className={styles.nav} aria-label="Primary">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                data-active={currentPath === link.href}
              >
                {link.label}
              </Link>
            ))}
            {user?.role === "seller" ? (
              <Link
                href="/seller-dashboard"
                data-active={currentPath === "/seller-dashboard"}
              >
                seller dashboard
              </Link>
            ) : null}
            {user?.role === "user" ? (
              <Link href="/orders" data-active={currentPath === "/orders"}>
                orders
              </Link>
            ) : null}
          </nav>

          <div className={styles.actions}>
            <Link className={styles.authButton} href="/login">
              {user ? user.fullName : "login"}
            </Link>
            {user?.role === "user" ? (
              <Link className={styles.cartButton} href="/cart">
                cart
              </Link>
            ) : null}
            {user ? (
              <form action={logoutAction}>
                <button className={styles.logoutButton} type="submit">
                  logout
                </button>
              </form>
            ) : null}
          </div>
        </header>

        <main className={styles.content}>{children}</main>

        <footer className={styles.footer}>
          <p className={styles.footerNote}>
            Handmade goods from independent makers, with seller and buyer accounts
            backed by the marketplace database.
          </p>
          <div className={styles.socials}>
            <a href="#">Instagram</a>
            <a href="#">Facebook</a>
            <a href="#">Makers</a>
          </div>
        </footer>
      </div>
    </div>
  );
}
