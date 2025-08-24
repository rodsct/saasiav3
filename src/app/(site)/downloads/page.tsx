import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";
import { redirect } from "next/navigation";
import Downloads from "@/components/Downloads";

export const metadata: Metadata = {
  title: "Downloads | Play SaaS",
  description: "Access and manage your downloadable files",
};

export default async function DownloadsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/signin");
  }

  return (
    <section className="py-16">
      <div className="container px-4">
        <Downloads />
      </div>
    </section>
  );
}