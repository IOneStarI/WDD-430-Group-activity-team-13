import { SiteShell } from "@/components/site-shell";
import { getSellerDashboardData } from "@/data/account-data";
import { SellerDashboard } from "./seller-dashboard";

export default async function SellerDashboardPage() {
  const dashboard = await getSellerDashboardData();

  return (
    <SiteShell currentPath="/seller-dashboard">
      <SellerDashboard dashboard={dashboard} />
    </SiteShell>
  );
}
