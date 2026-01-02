"use client";

import { useEffect, useState } from "react";
import { Chat } from "../../components/chat";
import { ReactionBar } from "../../components/reaction-bar";
import { StreamPlayer } from "../../components/stream-player";
import { TokenContext } from "../../components/token-context";
import { LiveKitRoom } from "@livekit/components-react";
import { useAuthStore } from "@/components/auth/use-auth-store";

export default function HostPage({ eventId }: { eventId: string }) {
  const { user, getDisplayName } = useAuthStore();
  const [tokens, setTokens] = useState<{
    authToken: string;
    roomToken: string;
    serverUrl: string;
  } | null>(null);

  useEffect(() => {
    async function initStream() {
      if (!user || tokens) return;

      try {
        const res = await fetch("/api/stream/create_stream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            room_name: eventId,
            name: getDisplayName(),
            metadata: {
              creator_identity: user.id,
              enable_chat: true,
              allow_participation: true,
            },
          }),
        });

        if (!res.ok) {
          console.error("Failed to create stream");
          return;
        }

        const data = await res.json();
        setTokens({
          authToken: data.auth_token,
          roomToken: data.connection_details.token,
          serverUrl: data.connection_details.ws_url,
        });
      } catch (error) {
        console.error("Error creating stream:", error);
      }
    }

    initStream();
  }, [user, eventId, getDisplayName, tokens]);

  if (!tokens) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        Loading stream...
      </div>
    );
  }

  return (
    <TokenContext.Provider value={tokens.authToken}>
      <LiveKitRoom serverUrl={tokens.serverUrl} token={tokens.roomToken}>
        <div className="w-full h-screen flex">
          <div className="flex-1 flex flex-col">
            <div className="flex-1 bg-background">
              <StreamPlayer isHost />
            </div>
            <ReactionBar />
          </div>
          <div className="bg-muted min-w-[280px] border-l border-border hidden sm:block">
            <Chat />
          </div>
        </div>
      </LiveKitRoom>
    </TokenContext.Provider>
  );
}
