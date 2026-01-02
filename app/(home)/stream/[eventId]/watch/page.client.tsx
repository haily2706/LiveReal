"use client";

import { Chat } from "../../components/chat";
import { ReactionBar } from "../../components/reaction-bar";
import { Spinner } from "../../components/spinner";
import { StreamPlayer } from "../../components/stream-player";
import { TokenContext } from "../../components/token-context";
import { JoinStreamResponse } from "../../lib/controller";
import { LiveKitRoom } from "@livekit/components-react";
import { useAuthStore } from "@/components/auth/use-auth-store";
import { useEffect, useState, useRef } from "react";

export default function WatchPage({
  roomName
}: {
  roomName: string;
}) {
  const { user, isLoading, getDisplayName } = useAuthStore();
  const [name, setName] = useState(getDisplayName());
  const [authToken, setAuthToken] = useState("");
  const [roomToken, setRoomToken] = useState("");
  const [wsUrl, setWsUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const hasJoined = useRef(false);

  const onJoin = async (identityOverride?: string, nameOverride?: string) => {
    if (authToken && roomToken) return;

    setLoading(true);
    const identity = identityOverride || user?.id || `viewer-${crypto.randomUUID()}`;
    const displayName = nameOverride ?? name;

    try {
      const res = await fetch("/api/stream/join_stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          room_name: roomName,
          identity: identity,
          name: displayName,
        }),
      });
      const {
        auth_token,
        connection_details: { token, ws_url },
      } = (await res.json()) as JoinStreamResponse;

      setAuthToken(auth_token);
      setRoomToken(token);
      setWsUrl(ws_url);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoading && !hasJoined.current) {
      hasJoined.current = true;
      onJoin(
        user?.id,
        getDisplayName()
      );
    }
  }, [isLoading, user]);

  if (!authToken || !roomToken) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  return (
    <TokenContext.Provider value={authToken}>
      <LiveKitRoom serverUrl={wsUrl} token={roomToken}>
        <div className="w-full h-screen flex">
          <div className="flex-1 flex flex-col">
            <div className="flex-1 bg-background">
              <StreamPlayer />
            </div>
            <ReactionBar />
          </div>
          <div className="bg-muted min-w-[280px] border-l border-border">
            <Chat />
          </div>
        </div>
      </LiveKitRoom>
    </TokenContext.Provider>
  );
}
