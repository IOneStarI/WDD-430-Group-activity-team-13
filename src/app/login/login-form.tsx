"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { loginAction, registerAction } from "@/app/actions";
import { SubmitButton } from "@/components/submit-button";
import styles from "./page.module.css";

export function LoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("register");
  const [accountRole, setAccountRole] = useState<"user" | "seller">("user");
  const [loginState, loginFormAction] = useActionState(loginAction, {});
  const [registerState, registerFormAction] = useActionState(registerAction, {});
  const loginFormRef = useRef<HTMLFormElement>(null);
  const registerFormRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const clearForm = (form: HTMLFormElement | null) => {
      if (!form) {
        return;
      }

      form.reset();

      for (const element of Array.from(form.elements)) {
        if (
          element instanceof HTMLInputElement ||
          element instanceof HTMLTextAreaElement
        ) {
          if (element.type !== "radio" && element.type !== "hidden") {
            element.value = "";
          }
        }
      }
    };

    const frame = window.requestAnimationFrame(() => {
      clearForm(loginFormRef.current);
      clearForm(registerFormRef.current);
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const redirectTo = registerState.redirectTo ?? loginState.redirectTo;

    if (redirectTo) {
      router.replace(redirectTo);
    }
  }, [loginState.redirectTo, registerState.redirectTo, router]);

  return (
    <section className={styles.login}>
      <div className={styles.panel}>
        <div className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Marketplace accounts</p>
            <h1>Register or sign in with a real marketplace account.</h1>
          </div>
          <div className={styles.modeSwitch}>
            <button
              className={styles.modeButton}
              data-active={mode === "register"}
              type="button"
              onClick={() => setMode("register")}
            >
              Register
            </button>
            <button
              className={styles.modeButton}
              data-active={mode === "login"}
              type="button"
              onClick={() => setMode("login")}
            >
              Login
            </button>
          </div>
        </div>

        <p className={styles.copy}>
          Users can shop, buy, and review order history. Sellers can create a store,
          add inventory, and appear in the marketplace as soon as they publish an item.
        </p>

        {mode === "register" ? (
          <form
            ref={registerFormRef}
            autoComplete="off"
            className={styles.form}
            action={registerFormAction}
          >
            <div className={styles.grid}>
              <label className={styles.field}>
                <span>Full name</span>
                <input
                  autoComplete="off"
                  name="fullName"
                  placeholder="Avery Carter"
                  required
                  type="text"
                />
              </label>
              <label className={styles.field}>
                <span>Email</span>
                <input
                  autoComplete="off"
                  name="email"
                  placeholder="you@example.com"
                  required
                  type="email"
                />
              </label>
            </div>

            <label className={styles.field}>
              <span>Password</span>
              <input
                autoComplete="new-password"
                minLength={8}
                name="password"
                placeholder="At least 8 characters"
                required
                type="password"
              />
            </label>

            <div className={styles.roleGrid}>
              <label className={styles.option} data-active={accountRole === "user"}>
                <input
                  checked={accountRole === "user"}
                  name="role"
                  type="radio"
                  value="user"
                  onChange={() => setAccountRole("user")}
                />
                <span>
                  <strong>User account</strong>
                  <small>Buy products, keep a cart, and review past orders.</small>
                </span>
              </label>

              <label className={styles.option} data-active={accountRole === "seller"}>
                <input
                  checked={accountRole === "seller"}
                  name="role"
                  type="radio"
                  value="seller"
                  onChange={() => setAccountRole("seller")}
                />
                <span>
                  <strong>Seller account</strong>
                  <small>Create a store profile and publish items to the live shop.</small>
                </span>
              </label>
            </div>

            {accountRole === "seller" ? (
              <div className={styles.grid}>
                <label className={styles.field}>
                  <span>Store name</span>
                  <input
                    autoComplete="off"
                    name="storeName"
                    placeholder="Juniper Studio"
                    required
                    type="text"
                  />
                </label>
                <label className={styles.field}>
                  <span>Store bio</span>
                  <textarea
                    autoComplete="off"
                    name="storeBio"
                    placeholder="What do you make and what makes the shop distinct?"
                    rows={4}
                  />
                </label>
              </div>
            ) : null}

            <p aria-live="polite" className={styles.message}>
              {registerState.message}
            </p>

            <SubmitButton className={styles.submit} pendingLabel="Creating account...">
              Create account
            </SubmitButton>
          </form>
        ) : (
          <form
            ref={loginFormRef}
            autoComplete="off"
            className={styles.form}
            action={loginFormAction}
          >
            <input
              aria-hidden="true"
              autoComplete="username"
              className={styles.trapField}
              tabIndex={-1}
              type="email"
            />
            <input
              aria-hidden="true"
              autoComplete="current-password"
              className={styles.trapField}
              tabIndex={-1}
              type="password"
            />

            <label className={styles.field}>
              <span>Email</span>
              <input
                autoComplete="off"
                name="email"
                placeholder="you@example.com"
                readOnly
                required
                type="email"
                onFocus={(event) => {
                  event.currentTarget.readOnly = false;
                }}
              />
            </label>

            <label className={styles.field}>
              <span>Password</span>
              <input
                autoComplete="off"
                name="password"
                placeholder="Your password"
                readOnly
                required
                type="password"
                onFocus={(event) => {
                  event.currentTarget.readOnly = false;
                }}
              />
            </label>

            <p aria-live="polite" className={styles.message}>
              {loginState.message}
            </p>

            <SubmitButton className={styles.submit} pendingLabel="Signing in...">
              Sign in
            </SubmitButton>
          </form>
        )}
      </div>
    </section>
  );
}
