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
    <section className="pb-[120px] pt-[120px]">
      <div className="container">
        <Downloads />
      </div>
    </section>
  );
}