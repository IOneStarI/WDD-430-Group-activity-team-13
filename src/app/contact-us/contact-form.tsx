"use client";

import { useState } from "react";
import styles from "./page.module.css";

type FormState = {
  name: string;
  email: string;
  subject: string;
  message: string;
  orderNumber: string;
};

type Status = "idle" | "loading" | "success" | "error";

export function ContactForm() {
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    subject: "",
    message: "",
    orderNumber: "",
  });
  const [status, setStatus] = useState<Status>("idle");

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Failed");
      setStatus("success");
      setForm({
        name: "",
        email: "",
        subject: "",
        message: "",
        orderNumber: "",
      });
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className={styles.formWrap}>
      {status === "success" ? (
        <div className={styles.successBox}>
          <p className={styles.successTitle}>Message sent!</p>
          <p className={styles.successText}>
            Thanks for reaching out. We wll get back to you within 1–2 business
            days.
          </p>
          <button className={styles.resetBtn} onClick={() => setStatus("idle")}>
            Send another message
          </button>
        </div>
      ) : (
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.row}>
            <div className={styles.field}>
              <label htmlFor="name">Name</label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="Your full name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label htmlFor="subject">Subject</label>
              <select
                id="subject"
                name="subject"
                value={form.subject}
                onChange={handleChange}
                required
              >
                <option value="">Select a subject</option>
                <option value="Order issue">Order issue</option>
                <option value="Product question">Product question</option>
                <option value="Seller enquiry">Seller enquiry</option>
                <option value="Returns & refunds">Returns & refunds</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className={styles.field}>
              <label htmlFor="orderNumber">Order Number (optional)</label>
              <input
                id="orderNumber"
                name="orderNumber"
                type="text"
                placeholder="e.g. ORD-12345"
                value={form.orderNumber}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className={styles.field}>
            <label htmlFor="message">Message</label>
            <textarea
              id="message"
              name="message"
              rows={5}
              placeholder="Tell us how we can help..."
              value={form.message}
              onChange={handleChange}
              required
            />
          </div>

          {status === "error" && (
            <p className={styles.errorText}>
              Something went wrong. Please try again.
            </p>
          )}

          <button
            className={styles.submitBtn}
            type="submit"
            disabled={status === "loading"}
          >
            {status === "loading" ? "Sending..." : "Send Message"}
          </button>
        </form>
      )}
    </div>
  );
}
