import { SiteShell } from "@/components/site-shell";
import { ContactForm } from "./contact-form";
import styles from "./page.module.css";

export default function ContactPage() {
  return (
    <SiteShell currentPath="/contact-us">
      <div className={styles.page}>
        <div className={styles.header}>
          <p className={styles.eyebrow}>Get in touch</p>
          <h1 className={styles.title}>Contact Us</h1>
          <p className={styles.subtitle}>
            Have a question about an order or product? We would love to hear
            from you.
          </p>
        </div>

        <div className={styles.layout}>
          {/* Contact Info */}
          <aside className={styles.info}>
            <div className={styles.infoCard}>
              <h2 className={styles.infoTitle}>Contact Information</h2>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Email</span>
                <a
                  href="mailto:support@handcraftedhaven.com"
                  className={styles.infoValue}
                >
                  support@handcraftedhaven.com
                </a>
              </div>
              {/* <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Phone</span>
                <a href="tel:+18005551234" className={styles.infoValue}>
                  +1 (800) 555-1234
                </a>
              </div> */}
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Business Hours</span>
                <span className={styles.infoValue}>
                  Mon – Fri: 9am – 6pm EST
                </span>
                <span className={styles.infoValue}>Sat: 10am – 4pm EST</span>
                <span className={styles.infoValue}>Sun: Closed</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Follow Us</span>
                <div className={styles.socials}>
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.socialLink}
                    aria-label="Instagram"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                      <circle cx="12" cy="12" r="4" />
                      <circle
                        cx="17.5"
                        cy="6.5"
                        r="1"
                        fill="currentColor"
                        stroke="none"
                      />
                    </svg>
                  </a>
                  <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.socialLink}
                    aria-label="Twitter"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </a>
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.socialLink}
                    aria-label="Facebook"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </aside>

          {/* Contact Form — client component */}
          <ContactForm />
        </div>
      </div>
    </SiteShell>
  );
}
