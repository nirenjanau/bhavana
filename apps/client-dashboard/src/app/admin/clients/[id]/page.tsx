import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import { authOptions } from "@/lib/auth";
import ClientWorkspace from "@/components/admin/ClientWorkspace";

export const dynamic = "force-dynamic";
export const metadata = { title: "Client Workspace | Bhavana Studio" };

interface Props {
  params: { id: string };
  searchParams: { folder?: string };
}

export default async function AdminClientPage({ params, searchParams }: Props) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if (session.user.role !== "admin") redirect("/gallery");

  if (!params.id) notFound();

  return (
    <ClientWorkspace
      token={session.user.accessToken}
      clientId={params.id}
      folderId={searchParams.folder ?? null}
    />
  );
}
