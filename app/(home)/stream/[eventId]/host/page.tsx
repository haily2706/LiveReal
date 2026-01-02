import { redirect } from "next/navigation";
import HostPageImpl from "./page.client";

interface PageProps {
  params: Promise<{
    eventId: string;
  }>;
}

export default async function HostPage({ params }: PageProps) {
  const { eventId } = await params;

  if (!eventId) {
    redirect("/");
  }

  return <HostPageImpl eventId={eventId} />;
}
