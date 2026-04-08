"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { sql } from "@/lib/db";
import { requireSeller, requireUser } from "@/lib/auth";
import { hashPassword, verifyPassword } from "@/lib/password";
import { clearSession, createSession } from "@/lib/session";
import { createUniqueSlug, slugify } from "@/lib/slug";

export type AuthActionState = {
  success?: boolean;
  message?: string;
  redirectTo?: string;
};

export type SellerItemActionState = {
  success?: boolean;
  message?: string;
};

export type SellerProfileActionState = {
  success?: boolean;
  message?: string;
};

const defaultAddressLine = "Marketplace checkout";
const defaultAddressCity = "Provo";
const defaultAddressState = "UT";
const defaultAddressPostalCode = "84601";

function getField(formData: FormData, field: string) {
  return String(formData.get(field) ?? "").trim();
}

function parsePriceToCents(value: string) {
  const parsed = Number(value);

  if (Number.isNaN(parsed) || parsed <= 0) {
    return null;
  }

  return Math.round(parsed * 100);
}

export async function loginAction(
  _: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = getField(formData, "email").toLowerCase();
  const password = getField(formData, "password");

  if (!email || !password) {
    return { message: "Email and password are required." };
  }

  const [user] = (await sql.query(
    `
      SELECT id, password_hash, role
      FROM users
      WHERE email = $1
        AND is_active = TRUE
      LIMIT 1;
    `,
    [email],
  )) as {
    id: string;
    password_hash: string | null;
    role: "user" | "seller" | "admin";
  }[];

  if (!user || !(await verifyPassword(password, user.password_hash))) {
    return { message: "Invalid email or password." };
  }

  await createSession({ userId: user.id });

  return {
    success: true,
    redirectTo: user.role === "seller" ? "/seller-dashboard" : "/shop",
  };
}

export async function registerAction(
  _: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const fullName = getField(formData, "fullName");
  const email = getField(formData, "email").toLowerCase();
  const password = getField(formData, "password");
  const role = getField(formData, "role");
  const storeName = getField(formData, "storeName");
  const storeBio = getField(formData, "storeBio");

  if (!fullName || !email || !password) {
    return { message: "Name, email, and password are required." };
  }

  if (password.length < 8) {
    return { message: "Password must be at least 8 characters long." };
  }

  if (role !== "user" && role !== "seller") {
    return { message: "Choose whether you are registering as a user or seller." };
  }

  if (role === "seller" && !storeName) {
    return { message: "Store name is required for seller registration." };
  }

  const [existingUser] = (await sql.query(
    `
      SELECT id
      FROM users
      WHERE email = $1
      LIMIT 1;
    `,
    [email],
  )) as { id: string }[];

  if (existingUser) {
    return { message: "An account with that email already exists." };
  }

  const passwordHash = await hashPassword(password);
  const storeSlugBase = slugify(storeName);

  if (role === "seller" && !storeSlugBase) {
    return { message: "Store name must include letters or numbers." };
  }

  if (role === "seller") {
    const [existingStore] = (await sql.query(
      `
        SELECT id
        FROM seller_profiles
        WHERE store_slug = $1
        LIMIT 1;
      `,
      [storeSlugBase],
    )) as { id: string }[];

    if (existingStore) {
      return { message: "That store name is already taken. Choose another one." };
    }
  }

  const [user] = (await sql.query(
    `
      INSERT INTO users (email, password_hash, full_name, role)
      VALUES ($1, $2, $3, $4)
      RETURNING id;
    `,
    [email, passwordHash, fullName, role],
  )) as { id: string }[];

  if (!user) {
    return { message: "Unable to create the account right now." };
  }

  if (role === "seller") {
    await sql.query(
      `
        INSERT INTO seller_profiles (
          user_id,
          store_name,
          store_slug,
          bio,
          contact_email,
          status,
          rating
        )
        VALUES ($1, $2, $3, $4, $5, 'approved', 5);
      `,
      [user.id, storeName, storeSlugBase, storeBio || null, email],
    );
  }

  await createSession({ userId: user.id });
  revalidatePath("/shop");

  return {
    success: true,
    redirectTo: role === "seller" ? "/seller-dashboard" : "/shop",
  };
}

export async function logoutAction() {
  await clearSession();
  revalidatePath("/");
  redirect("/");
}

export async function createSellerItemAction(
  _: SellerItemActionState,
  formData: FormData,
): Promise<SellerItemActionState> {
  const user = await requireSeller();
  const name = getField(formData, "name");
  const description = getField(formData, "description");
  const imageUrl = getField(formData, "imageUrl");
  const priceCents = parsePriceToCents(getField(formData, "price"));

  if (!name || !description || !priceCents) {
    return { message: "Name, description, and a valid price are required." };
  }

  const [seller] = (await sql.query(
    `
      SELECT id
      FROM seller_profiles
      WHERE user_id = $1
      LIMIT 1;
    `,
    [user.id],
  )) as { id: string }[];

  if (!seller) {
    return { message: "Seller profile not found." };
  }

  await sql.query(
    `
      INSERT INTO items (
        seller_id,
        category_id,
        slug,
        name,
        description,
        price_cents,
        stock_quantity,
        status,
        image_url
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'active', $8);
    `,
    [
      seller.id,
      null,
      createUniqueSlug(name),
      name,
      description,
      priceCents,
      1,
      imageUrl || null,
    ],
  );

  revalidatePath("/shop");
  revalidatePath("/seller-dashboard");
  revalidatePath("/");

  return {
    success: true,
    message: "Item added. Your store is now live in the shop once it has active inventory.",
  };
}

export async function updateSellerProfileAction(
  _: SellerProfileActionState,
  formData: FormData,
): Promise<SellerProfileActionState> {
  const user = await requireSeller();
  const storeBio = getField(formData, "storeBio");
  const avatarUrl = getField(formData, "avatarUrl");

  await sql.query(
    `
      UPDATE users
      SET avatar_url = $2
      WHERE id = $1;
    `,
    [user.id, avatarUrl || null],
  );

  await sql.query(
    `
      UPDATE seller_profiles
      SET bio = $2
      WHERE user_id = $1;
    `,
    [user.id, storeBio || null],
  );

  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/seller-dashboard");

  return {
    success: true,
    message: "Seller profile updated.",
  };
}

export async function updateSellerItemAction(
  _: SellerItemActionState,
  formData: FormData,
): Promise<SellerItemActionState> {
  const user = await requireSeller();
  const itemId = getField(formData, "itemId");
  const name = getField(formData, "name");
  const description = getField(formData, "description");
  const imageUrl = getField(formData, "imageUrl");
  const priceCents = parsePriceToCents(getField(formData, "price"));

  if (!itemId || !name || !description || !priceCents) {
    return { message: "Name, description, and a valid price are required." };
  }

  const [seller] = (await sql.query(
    `
      SELECT id
      FROM seller_profiles
      WHERE user_id = $1
      LIMIT 1;
    `,
    [user.id],
  )) as { id: string }[];

  if (!seller) {
    return { message: "Seller profile not found." };
  }

  const [ownedItem] = (await sql.query(
    `
      SELECT id
      FROM items
      WHERE id = $1
        AND seller_id = $2
      LIMIT 1;
    `,
    [itemId, seller.id],
  )) as { id: string }[];

  if (!ownedItem) {
    return { message: "That item does not belong to this seller account." };
  }

  await sql.query(
    `
      UPDATE items
      SET
        name = $2,
        description = $3,
        price_cents = $4,
        image_url = $5
      WHERE id = $1;
    `,
    [itemId, name, description, priceCents, imageUrl || null],
  );

  revalidatePath("/shop");
  revalidatePath("/seller-dashboard");

  return {
    success: true,
    message: "Item updated.",
  };
}

export async function deleteSellerItemAction(itemId: string) {
  const user = await requireSeller();

  const [seller] = (await sql.query(
    `
      SELECT id
      FROM seller_profiles
      WHERE user_id = $1
      LIMIT 1;
    `,
    [user.id],
  )) as { id: string }[];

  if (!seller) {
    return;
  }

  await sql.query(
    `
      DELETE FROM items
      WHERE id = $1
        AND seller_id = $2;
    `,
    [itemId, seller.id],
  );

  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/seller-dashboard");
}

export async function addToCartAction(itemId: string) {
  const user = await requireUser();

  if (user.role !== "user") {
    return;
  }

  const [item] = (await sql.query(
    `
      SELECT id, price_cents
      FROM items
      WHERE id = $1
        AND status = 'active'
      LIMIT 1;
    `,
    [itemId],
  )) as { id: string; price_cents: number }[];

  if (!item) {
    return;
  }

  const [createdCart] = (await sql.query(
    `
      INSERT INTO carts (user_id, status)
      VALUES ($1, 'open')
      ON CONFLICT DO NOTHING
      RETURNING id;
    `,
    [user.id],
  )) as { id: string }[];

  const cartId =
    createdCart?.id ??
    (
      await sql.query(
        `
          SELECT id
          FROM carts
          WHERE user_id = $1
            AND status = 'open'
          LIMIT 1;
        `,
        [user.id],
      )
    )[0]?.id;

  if (!cartId) {
    return;
  }

  await sql.query(
    `
      INSERT INTO cart_items (cart_id, item_id, quantity, unit_price_cents)
      VALUES ($1, $2, 1, $3)
      ON CONFLICT (cart_id, item_id)
      DO UPDATE SET
        quantity = cart_items.quantity + 1,
        unit_price_cents = EXCLUDED.unit_price_cents,
        updated_at = NOW();
    `,
    [cartId, item.id, item.price_cents],
  );

  revalidatePath("/cart");
}

export async function checkoutAction() {
  const user = await requireUser();

  if (user.role !== "user") {
    return;
  }

  const cartItems = (await sql.query(
    `
      SELECT
        c.id AS cart_id,
        ci.item_id,
        ci.quantity,
        ci.unit_price_cents,
        i.name AS item_name,
        i.stock_quantity,
        i.seller_id
      FROM carts c
      INNER JOIN cart_items ci ON ci.cart_id = c.id
      INNER JOIN items i ON i.id = ci.item_id
      WHERE c.user_id = $1
        AND c.status = 'open';
    `,
    [user.id],
  )) as {
    cart_id: string;
    item_id: string;
    quantity: number;
    unit_price_cents: number;
    item_name: string;
    stock_quantity: number;
    seller_id: string;
  }[];

  if (cartItems.length === 0) {
    return;
  }

  const [address] = (await sql.query(
    `
      SELECT id
      FROM addresses
      WHERE user_id = $1
        AND is_default = TRUE
      ORDER BY created_at ASC
      LIMIT 1;
    `,
    [user.id],
  )) as { id: string }[];

  let shippingAddressId = address?.id;

  if (!shippingAddressId) {
    shippingAddressId = (
      await sql.query(
        `
          INSERT INTO addresses (
            user_id,
            label,
            recipient_name,
            line1,
            city,
            state,
            postal_code,
            country,
            is_default
          )
          VALUES ($1, 'Default', $2, $3, $4, $5, $6, 'US', TRUE)
          RETURNING id;
        `,
        [
          user.id,
          user.fullName,
          defaultAddressLine,
          defaultAddressCity,
          defaultAddressState,
          defaultAddressPostalCode,
        ],
      )
    )[0]?.id;
  }

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.quantity * item.unit_price_cents,
    0,
  );
  const cartId = cartItems[0]?.cart_id;

  const [order] = (await sql.query(
    `
      INSERT INTO orders (
        user_id,
        shipping_address_id,
        status,
        subtotal_cents,
        total_cents,
        notes
      )
      VALUES ($1, $2, 'paid', $3, $4, $5)
      RETURNING id;
    `,
    [user.id, shippingAddressId ?? null, subtotal, subtotal, "Placed through marketplace cart"],
  )) as { id: string }[];

  for (const item of cartItems) {
    const lineTotal = item.quantity * item.unit_price_cents;

    await sql.query(
      `
        INSERT INTO order_items (
          order_id,
          item_id,
          seller_id,
          item_name,
          quantity,
          unit_price_cents,
          line_total_cents
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7);
      `,
      [
        order.id,
        item.item_id,
        item.seller_id,
        item.item_name,
        item.quantity,
        item.unit_price_cents,
        lineTotal,
      ],
    );

    await sql.query(
      `
        UPDATE items
        SET
          stock_quantity = GREATEST(stock_quantity - $2, 0),
          status = CASE
            WHEN stock_quantity - $2 <= 0 THEN 'sold_out'
            ELSE status
          END
        WHERE id = $1;
      `,
      [item.item_id, item.quantity],
    );
  }

  await sql.query(
    `
      UPDATE carts
      SET status = 'ordered'
      WHERE id = $1;
    `,
    [cartId],
  );

  revalidatePath("/cart");
  revalidatePath("/orders");
  revalidatePath("/shop");
  redirect("/cart?success=1");
}
