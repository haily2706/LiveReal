import { redirect } from "next/navigation";
import WatchPageImpl from "./page.client";

interface PageProps {
  params: {
    eventId: string;
  };
}

export default async function WatchPage({ params }: PageProps) {
  const { eventId } = await params;
  if (!eventId) {
    redirect("/");
  }

  return <WatchPageImpl roomName={eventId} />;
}
