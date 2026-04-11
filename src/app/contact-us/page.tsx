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
                  >
                    Instagram
                  </a>
                  <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.socialLink}
                  >
                    Twitter
                  </a>
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.socialLink}
                  >
                    Facebook
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
