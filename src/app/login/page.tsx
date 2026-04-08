import { redirect } from "next/navigation";
import { SiteShell } from "@/components/site-shell";
import { getCurrentUser } from "@/lib/auth";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect(user.role === "seller" ? "/seller-dashboard" : "/shop");
  }

  return (
    <SiteShell currentPath="/login">
      <LoginForm />
    </SiteShell>
  );
}
