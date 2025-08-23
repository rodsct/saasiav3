import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";
import { redirect } from "next/navigation";
import { checkAdminAuth } from "@/utils/adminAuth";
import AdminDashboard from "@/components/Admin/AdminDashboard";

export const metadata: Metadata = {
  title: "Admin Panel | SaaS v3",
  description: "Admin panel for managing downloads and webhooks",
};

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/signin");
  }

  const admin = await checkAdminAuth();
  
  if (!admin) {
    redirect("/");
  }

  return (
    <section className="pb-[120px] pt-[120px]">
      <div className="container">
        <AdminDashboard />
      </div>
    </section>
  );
}