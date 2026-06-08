import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import GalleryClient from "@/components/gallery/GalleryClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "My Gallery | Bhavana Studio" };

export default async function GalleryPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen bg-stone-50">
      <GalleryClient
        userName={session.user.name ?? ""}
        token={session.user.accessToken}
      />
    </div>
  );
}
