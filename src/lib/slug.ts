import { randomUUID } from "node:crypto";

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function createUniqueSlug(value: string) {
  const base = slugify(value) || "item";
  const suffix = randomUUID().slice(0, 8);

  return `${base}-${suffix}`;
}
