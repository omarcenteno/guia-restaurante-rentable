import { AppShell } from "../../../AppShell";

export default async function StudioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AppShell initialView="production" initialProductionMode="studio" initialProductionId={id} />;
}
