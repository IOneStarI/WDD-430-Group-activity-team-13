import { neon } from "@neondatabase/serverless";
import { randomBytes, scryptSync } from "node:crypto";
import nextEnv from "@next/env";

const { loadEnvConfig } = nextEnv;

loadEnvConfig(process.cwd());

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set.");
}

const sql = neon(process.env.DATABASE_URL);
const demoPassword = "Marketplace123!";

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");

  return `${salt}:${hash}`;
}

const categories = [
  {
    name: "Home Decor",
    slug: "home-decor",
    description: "Handmade pieces for display, storage, and everyday home use.",
  },
  {
    name: "Accessories",
    slug: "accessories",
    description: "Small artisan accessories, pouches, and personal goods.",
  },
];

const sellers = [
  {
    email: "willow@handcraftedhaven.local",
    fullName: "Willow Craft",
    storeName: "Willow Craft",
    storeSlug: "willow-craft",
    bio: "Natural fiber baskets and wooden pieces made for daily living.",
  },
  {
    email: "oak@handcraftedhaven.local",
    fullName: "Oak & Thread",
    storeName: "Oak & Thread",
    storeSlug: "oak-thread",
    bio: "Textile goods stitched in small batches for practical use.",
  },
  {
    email: "river@handcraftedhaven.local",
    fullName: "River Clay",
    storeName: "River Clay",
    storeSlug: "river-clay",
    bio: "Ceramic homeware with soft finishes and handmade character.",
  },
];

const items = [
  {
    slug: "woven-basket",
    sellerSlug: "willow-craft",
    categorySlug: "home-decor",
    name: "Woven Basket",
    description:
      "Handwoven storage basket made for everyday use with natural fibers and durable construction.",
    priceCents: 4200,
    stockQuantity: 12,
    status: "active",
    isFeatured: true,
  },
  {
    slug: "ceramic-vase",
    sellerSlug: "river-clay",
    categorySlug: "home-decor",
    name: "Ceramic Vase",
    description:
      "A small-batch ceramic vase with a soft matte finish and a warm artisan character.",
    priceCents: 5800,
    stockQuantity: 8,
    status: "active",
    isFeatured: true,
  },
  {
    slug: "linen-pouch",
    sellerSlug: "oak-thread",
    categorySlug: "accessories",
    name: "Linen Pouch",
    description:
      "Minimal hand-stitched pouch designed for travel accessories, stationery, or keepsakes.",
    priceCents: 2400,
    stockQuantity: 20,
    status: "active",
    isFeatured: false,
  },
  {
    slug: "wooden-tray",
    sellerSlug: "willow-craft",
    categorySlug: "home-decor",
    name: "Wooden Tray",
    description:
      "A handcrafted tray with clean edges and a natural finish for display or serving.",
    priceCents: 3600,
    stockQuantity: 9,
    status: "active",
    isFeatured: false,
  },
  {
    slug: "macrame-wall-hanging",
    sellerSlug: "willow-craft",
    categorySlug: "home-decor",
    name: "Macrame Wall Hanging",
    description:
      "A hand-knotted wall piece with layered texture designed to warm up entryways, bedrooms, and studio corners.",
    priceCents: 6800,
    stockQuantity: 5,
    status: "active",
    isFeatured: false,
  },
  {
    slug: "cedar-serving-board",
    sellerSlug: "willow-craft",
    categorySlug: "home-decor",
    name: "Cedar Serving Board",
    description:
      "Solid cedar serving board finished with food-safe oil and a shaped grip for hosting or everyday kitchen use.",
    priceCents: 5400,
    stockQuantity: 7,
    status: "active",
    isFeatured: false,
  },
  {
    slug: "woven-laundry-hamper",
    sellerSlug: "willow-craft",
    categorySlug: "home-decor",
    name: "Woven Laundry Hamper",
    description:
      "Tall woven hamper with reinforced handles and a sturdy frame sized for blankets, laundry, or toy storage.",
    priceCents: 8200,
    stockQuantity: 4,
    status: "active",
    isFeatured: true,
  },
  {
    slug: "hand-carved-candle-holder",
    sellerSlug: "willow-craft",
    categorySlug: "home-decor",
    name: "Hand-Carved Candle Holder",
    description:
      "A sculpted wooden candle holder carved by hand to add a warm accent to tables, shelves, and mantel displays.",
    priceCents: 2900,
    stockQuantity: 11,
    status: "active",
    isFeatured: false,
  },
  {
    slug: "quilted-table-runner",
    sellerSlug: "oak-thread",
    categorySlug: "accessories",
    name: "Quilted Table Runner",
    description:
      "Soft quilted runner stitched with subtle contrast lines to bring texture and warmth to dining tables.",
    priceCents: 4700,
    stockQuantity: 8,
    status: "active",
    isFeatured: true,
  },
  {
    slug: "canvas-market-tote",
    sellerSlug: "oak-thread",
    categorySlug: "accessories",
    name: "Canvas Market Tote",
    description:
      "Durable carryall with reinforced handles and interior pockets for groceries, books, or a day around town.",
    priceCents: 3900,
    stockQuantity: 14,
    status: "active",
    isFeatured: false,
  },
  {
    slug: "stitched-journal-cover",
    sellerSlug: "oak-thread",
    categorySlug: "accessories",
    name: "Stitched Journal Cover",
    description:
      "A reusable fabric journal sleeve with a tie closure sized to hold notebooks, pens, and folded notes.",
    priceCents: 2600,
    stockQuantity: 13,
    status: "active",
    isFeatured: false,
  },
  {
    slug: "stoneware-mug",
    sellerSlug: "river-clay",
    categorySlug: "home-decor",
    name: "Stoneware Mug",
    description:
      "Wheel-thrown mug with a comfortable handle and speckled glaze made for slow mornings and hot drinks.",
    priceCents: 3400,
    stockQuantity: 16,
    status: "active",
    isFeatured: false,
  },
  {
    slug: "ceramic-planter",
    sellerSlug: "river-clay",
    categorySlug: "home-decor",
    name: "Ceramic Planter",
    description:
      "Hand-finished planter with drainage and a grounded silhouette for herbs, succulents, and windowsill greens.",
    priceCents: 4400,
    stockQuantity: 10,
    status: "active",
    isFeatured: true,
  },
];

const [shopper] = await sql.query(
  `
    INSERT INTO users (email, password_hash, full_name, role)
    VALUES ($1, $2, $3, 'user')
    ON CONFLICT (email)
    DO UPDATE SET
      password_hash = EXCLUDED.password_hash,
      full_name = EXCLUDED.full_name,
      role = EXCLUDED.role
    RETURNING id;
  `,
  ["shopper@handcraftedhaven.local", hashPassword(demoPassword), "Demo Shopper"],
);

for (const category of categories) {
  await sql.query(
    `
      INSERT INTO categories (name, slug, description)
      VALUES ($1, $2, $3)
      ON CONFLICT (slug)
      DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description;
    `,
    [category.name, category.slug, category.description],
  );
}

const sellerIdsBySlug = new Map();

for (const seller of sellers) {
  const [user] = await sql.query(
    `
      INSERT INTO users (email, password_hash, full_name, role)
      VALUES ($1, $2, $3, 'seller')
      ON CONFLICT (email)
      DO UPDATE SET
        password_hash = EXCLUDED.password_hash,
        full_name = EXCLUDED.full_name,
        role = EXCLUDED.role
      RETURNING id;
    `,
    [seller.email, hashPassword(demoPassword), seller.fullName],
  );

  const [profile] = await sql.query(
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
      VALUES ($1, $2, $3, $4, $5, 'approved', 5)
      ON CONFLICT (store_slug)
      DO UPDATE SET
        store_name = EXCLUDED.store_name,
        bio = EXCLUDED.bio,
        contact_email = EXCLUDED.contact_email,
        status = EXCLUDED.status,
        rating = EXCLUDED.rating
      RETURNING id;
    `,
    [user.id, seller.storeName, seller.storeSlug, seller.bio, seller.email],
  );

  sellerIdsBySlug.set(seller.storeSlug, profile.id);
}

const categoryIdsBySlug = new Map();

const categoryRows = await sql.query(`SELECT id, slug FROM categories;`);

for (const category of categoryRows) {
  categoryIdsBySlug.set(category.slug, category.id);
}

for (const item of items) {
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
        is_featured
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (slug)
      DO UPDATE SET
        seller_id = EXCLUDED.seller_id,
        category_id = EXCLUDED.category_id,
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        price_cents = EXCLUDED.price_cents,
        stock_quantity = EXCLUDED.stock_quantity,
        status = EXCLUDED.status,
        is_featured = EXCLUDED.is_featured;
    `,
    [
      sellerIdsBySlug.get(item.sellerSlug),
      categoryIdsBySlug.get(item.categorySlug) ?? null,
      item.slug,
      item.name,
      item.description,
      item.priceCents,
      item.stockQuantity,
      item.status,
      item.isFeatured,
    ],
  );
}

const [address] = await sql.query(
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
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, TRUE)
    ON CONFLICT DO NOTHING
    RETURNING id;
  `,
  [
    shopper.id,
    "Home",
    "Demo Shopper",
    "123 Artisan Way",
    "Provo",
    "UT",
    "84601",
    "US",
  ],
);

const [openCart] = await sql.query(
  `
    INSERT INTO carts (user_id, status)
    VALUES ($1, 'open')
    ON CONFLICT DO NOTHING
    RETURNING id;
  `,
  [shopper.id],
);

const cartId =
  openCart?.id ??
  (
    await sql.query(
      `
        SELECT id
        FROM carts
        WHERE user_id = $1 AND status = 'open'
        LIMIT 1;
      `,
      [shopper.id],
    )
  )[0]?.id;

const seededItems = await sql.query(
  `
    SELECT id, price_cents
    FROM items
    WHERE slug IN ('woven-basket', 'ceramic-vase')
    ORDER BY slug;
  `,
);

for (const item of seededItems) {
  await sql.query(
    `
      INSERT INTO cart_items (cart_id, item_id, quantity, unit_price_cents)
      VALUES ($1, $2, 1, $3)
      ON CONFLICT (cart_id, item_id)
      DO UPDATE SET
        quantity = EXCLUDED.quantity,
        unit_price_cents = EXCLUDED.unit_price_cents;
    `,
    [cartId, item.id, item.price_cents],
  );
}

if (address?.id) {
  await sql.query(
    `
      UPDATE orders
      SET shipping_address_id = $2
      WHERE user_id = $1 AND shipping_address_id IS NULL;
    `,
    [shopper.id, address.id],
  );
}

console.log(`Database seed data is ready. Demo password: ${demoPassword}`);
