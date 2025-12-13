
import { LiveClient } from "./components/live-client";

interface PageProps {
    params: Promise<{ username: string }>;
}

export default async function LivePage({ params }: PageProps) {
    const { username } = await params;

    return <LiveClient username={username} />;
}
