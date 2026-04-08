"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { useAuth } from "./auth-provider";
import styles from "./site-shell.module.css";
import Image from "next/image";
import { FaInstagram, FaFacebook, FaXTwitter } from "react-icons/fa6";

type SiteShellProps = {
  children: ReactNode;
  currentPath:
    | "/"
    | "/shop"
    | "/contact-us"
    | "/cart"
    | "/login"
    | "/seller-dashboard";
};

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/contact-us", label: "Contact Us" },
] as const;

export function SiteShell({ children, currentPath }: SiteShellProps) {
  const { role, logout } = useAuth();

  return (
    <div className={styles.page}>
      <div className={styles.frame}>
        <header className={styles.header}>
          
          
          <Link className={styles.logo} href="/">
            <Image 
              src="/logo.png.jpeg" 
              alt="Handcrafted Haven Logo" 
              width={80}
              height={80}
            />
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
            {role === "seller" ? (
              <Link
                href="/seller-dashboard"
                data-active={currentPath === "/seller-dashboard"}
              >
                Seller
              </Link>
            ) : null}
          </nav>

          <div className={styles.actions}>
            <Link className={styles.authButton} href="/login">
              {role === "guest" ? "Login" : role}
            </Link>
            <Link className={styles.cartButton} href="/cart">
              Cart
            </Link>
            {role !== "guest" ? (
              <button
                className={styles.logoutButton}
                type="button"
                onClick={logout}
              >
                Logout
              </button>
            ) : null}
          </div>
        </header>

        <main className={styles.content}>{children}</main>

        <footer className={styles.footer}>
          <p className={styles.footerNote}>Footer info</p>
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