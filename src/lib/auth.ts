import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { sql } from "@/lib/db";
import { readSession } from "@/lib/session";

export type AuthUser = {
  id: string;
  email: string;
  fullName: string;
  role: "user" | "seller" | "admin";
  storeName: string | null;
  storeSlug: string | null;
};

export const getCurrentUser = cache(async (): Promise<AuthUser | null> => {
  const session = await readSession();

  if (!session?.userId) {
    return null;
  }

  const [user] = (await sql.query(
    `
      SELECT
        u.id,
        u.email,
        u.full_name,
        u.role,
        sp.store_name,
        sp.store_slug
      FROM users u
      LEFT JOIN seller_profiles sp ON sp.user_id = u.id
      WHERE u.id = $1
        AND u.is_active = TRUE
      LIMIT 1;
    `,
    [session.userId],
  )) as {
    id: string;
    email: string;
    full_name: string;
    role: "user" | "seller" | "admin";
    store_name: string | null;
    store_slug: string | null;
  }[];

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    fullName: user.full_name,
    role: user.role,
    storeName: user.store_name,
    storeSlug: user.store_slug,
  };
});

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function requireSeller() {
  const user = await requireUser();

  if (user.role !== "seller" && user.role !== "admin") {
    redirect("/login");
  }

  return user;
}
