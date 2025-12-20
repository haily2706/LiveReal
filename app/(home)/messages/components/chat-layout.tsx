import { createClient } from "@/lib/supabase/server";
import { ChatLayoutClient } from "./chat-layout-client";
import { redirect } from "next/navigation";

interface ChatLayoutProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function ChatLayout({ searchParams }: ChatLayoutProps) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/");
    }

    const params = await searchParams;
    const conversationId = typeof params.id === "string" ? params.id : undefined;

    return (
        <ChatLayoutClient
            conversationId={conversationId}
            userId={user.id}
        />
    );
}
