"use client";

import { useActionState, useState } from "react";
import {
  createSellerItemAction,
  deleteSellerItemAction,
  SellerProfileActionState,
  SellerItemActionState,
  updateSellerProfileAction,
  updateSellerItemAction,
} from "@/app/actions";
import { SubmitButton } from "@/components/submit-button";
import { SellerDashboardData } from "@/data/account-data";
import styles from "./page.module.css";

const initialState: SellerItemActionState = {};
const initialProfileState: SellerProfileActionState = {};

type SellerDashboardProps = {
  dashboard: SellerDashboardData;
};

type InventoryItemCardProps = {
  item: SellerDashboardData["items"][number];
};

function InventoryItemCard({ item }: InventoryItemCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [state, formAction] = useActionState(updateSellerItemAction, initialState);
  const deleteItemAction = deleteSellerItemAction.bind(null, item.id);

  return (
    <article className={styles.itemCard}>
      <div className={styles.itemVisual}>
        {item.imageUrl ? (
          <img
            alt={item.name}
            className={styles.itemVisualImage}
            src={item.imageUrl}
          />
        ) : (
          <span className={styles.itemVisualLabel}>handmade listing</span>
        )}
      </div>

      <div className={styles.itemBody}>
        <div className={styles.itemHeader}>
          <div className={styles.itemTitleBlock}>
            <h2>{item.name}</h2>
            <p>{item.description}</p>
          </div>
          <div className={styles.itemPriceBlock}>
            <strong>{item.priceLabel}</strong>
            <div className={styles.cardActions}>
              <button
                className={styles.editToggle}
                type="button"
                onClick={() => setIsEditing((current) => !current)}
              >
                {isEditing ? "Close" : "Edit"}
              </button>
              <form action={deleteItemAction}>
                <button className={styles.deleteButton} type="submit">
                  Remove
                </button>
              </form>
            </div>
          </div>
        </div>

        {isEditing ? (
          <form className={styles.editForm} action={formAction}>
            <input name="itemId" type="hidden" value={item.id} />

            <div className={styles.formGrid}>
              <label className={styles.field}>
                <span>Item name</span>
                <input defaultValue={item.name} name="name" required type="text" />
              </label>

              <label className={styles.field}>
                <span>Price in USD</span>
                <input
                  defaultValue={item.price}
                  min="1"
                  name="price"
                  required
                  step="0.01"
                  type="number"
                />
              </label>
            </div>

            <label className={styles.field}>
              <span>Description</span>
              <textarea defaultValue={item.description} name="description" required rows={4} />
            </label>

            <label className={styles.field}>
              <span>Image URL</span>
              <input defaultValue={item.imageUrl ?? ""} name="imageUrl" type="url" />
            </label>

            <div className={styles.editActions}>
              <p aria-live="polite" className={styles.inlineMessage}>
                {state.message}
              </p>
              <SubmitButton className={styles.saveButton} pendingLabel="Saving...">
                Save changes
              </SubmitButton>
            </div>
          </form>
        ) : null}
      </div>
    </article>
  );
}

export function SellerDashboard({ dashboard }: SellerDashboardProps) {
  const [state, formAction] = useActionState(createSellerItemAction, initialState);
  const [profileState, profileFormAction] = useActionState(
    updateSellerProfileAction,
    initialProfileState,
  );

  return (
    <section className={styles.dashboard}>
      <div className={styles.panel}>
        <p className={styles.eyebrow}>Seller workspace</p>
        <h1>{dashboard.seller.storeName}</h1>
        <p>
          Store slug: @{dashboard.seller.storeSlug}. Publish at least one active item
          to stay visible in the live shop.
        </p>
        {dashboard.seller.bio ? <p>{dashboard.seller.bio}</p> : null}

        <div className={styles.metrics}>
          <div className={styles.metricCard}>
            <strong>{dashboard.seller.itemCount}</strong>
            <span>published items</span>
          </div>
          <div className={styles.metricCard}>
            <strong>Live</strong>
            <span>shop visibility</span>
          </div>
        </div>

        <form className={styles.profileForm} action={profileFormAction}>
          <div className={styles.profilePreview}>
            {dashboard.seller.avatarUrl ? (
              <img
                alt={dashboard.seller.storeName}
                className={styles.profileImage}
                src={dashboard.seller.avatarUrl}
              />
            ) : (
              <span className={styles.profileFallback}>
                {dashboard.seller.storeName.slice(0, 1)}
              </span>
            )}
          </div>

          <div className={styles.profileFields}>
            <label className={styles.field}>
              <span>Seller image URL</span>
              <input
                defaultValue={dashboard.seller.avatarUrl ?? ""}
                name="avatarUrl"
                placeholder="https://example.com/seller.jpg"
                type="url"
              />
            </label>

            <label className={styles.field}>
              <span>Seller bio</span>
              <textarea
                defaultValue={dashboard.seller.bio ?? ""}
                name="storeBio"
                rows={3}
              />
            </label>

            <div className={styles.editActions}>
              <p aria-live="polite" className={styles.inlineMessage}>
                {profileState.message}
              </p>
              <SubmitButton className={styles.saveButton} pendingLabel="Saving profile...">
                Save seller profile
              </SubmitButton>
            </div>
          </div>
        </form>

        <form className={styles.form} action={formAction}>
          <div className={styles.formGrid}>
            <label className={styles.field}>
              <span>Item name</span>
              <input name="name" placeholder="Handmade item name" required type="text" />
            </label>

            <label className={styles.field}>
              <span>Price in USD</span>
              <input
                min="1"
                name="price"
                placeholder="45"
                required
                step="0.01"
                type="number"
              />
            </label>
          </div>

          <label className={styles.field}>
            <span>Description</span>
            <textarea
              name="description"
              placeholder="Describe materials, finish, and why the item stands out."
              required
              rows={5}
            />
          </label>

          <label className={styles.field}>
            <span>Image URL</span>
            <input name="imageUrl" placeholder="https://example.com/product.jpg" type="url" />
          </label>

          <p aria-live="polite" className={styles.statusMessage}>
            {state.message}
          </p>

          <SubmitButton className={styles.submit} pendingLabel="Publishing item...">
            Add item
          </SubmitButton>
        </form>
      </div>

      <div className={styles.panel}>
        <p className={styles.eyebrow}>Published inventory</p>
        <div className={styles.items}>
          {dashboard.items.length === 0 ? (
            <p className={styles.empty}>
              No items added yet. Add your first listing and it will appear in the shop.
            </p>
          ) : (
            dashboard.items.map((item) => <InventoryItemCard key={item.id} item={item} />)
          )}
        </div>
      </div>
    </section>
  );
}
