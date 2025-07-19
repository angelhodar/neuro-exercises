import { getOrganizationById } from "@/app/actions/organizations";
import { notFound } from "next/navigation";
import EditOrganizationPage from "./page";

export default async function EditOrganizationLayout({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const organization = await getOrganizationById(resolvedParams.id);

  if (!organization) notFound();

  return <EditOrganizationPage organization={organization} />;
} 