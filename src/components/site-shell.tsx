import { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { getCurrentUser } from "@/lib/auth";
import { logoutAction } from "@/app/actions";
import styles from "./site-shell.module.css";
import { FaInstagram, FaFacebook, FaXTwitter } from "react-icons/fa6";

type SiteShellProps = {
  children: ReactNode;
  currentPath: string;
};

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/contact-us", label: "Contact Us" },
] as const;

export async function SiteShell({ children, currentPath }: SiteShellProps) {
  const user = await getCurrentUser();

  return (
    <div className={styles.page}>
      <div className={styles.frame}>
        <header className={styles.header}>
          <Link className={styles.logo} href="/">
            <Image 
              src="/logo.png.jpeg" 
              alt="Handcrafted Haven Logo" 
              className={styles.logoImage}
              width={80}
              height={80}
            />
            <span className={styles.logoText}>
              <span>Handcrafted</span>
              <strong>Haven</strong>
            </span>
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
            
            {user?.role === "seller" && (
              <Link
                href="/seller-dashboard"
                data-active={currentPath === "/seller-dashboard"}
              >
                seller dashboard
              </Link>
            )}

            {user?.role === "user" && (
              <Link 
                href="/orders" 
                data-active={currentPath === "/orders"}
              >
                Orders
              </Link>
            )}
          </nav>

          <div className={styles.actions}>
            <Link className={styles.authButton} href="/login">
              {user ? user.fullName : "login"}
            </Link>
            
            {user?.role === "user" && (
              <Link className={styles.cartButton} href="/cart">
                Cart
              </Link>
            )}

            {user && (
              <form action={logoutAction}>
                <button className={styles.logoutButton} type="submit">
                  Log out
                </button>
              </form>
            )}
          </div>
        </header>

        <main className={styles.content}>{children}</main>

        <footer className={styles.footer}>
          <p>© 2026 Handcrafted Haven. Backed by the marketplace database.</p>
          <div className={styles.socials}>
            <a href="https://instagram.com/handcraftedhaven" target="_blank" rel="noopener noreferrer">
              <FaInstagram />
            </a>
            <a href="https://facebook.com/handcraftedhaven" target="_blank" rel="noopener noreferrer">
              <FaFacebook />
            </a>
            <a href="https://twitter.com/handcraftedhaven" target="_blank" rel="noopener noreferrer">
              <FaXTwitter />
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}
