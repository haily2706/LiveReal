"use client";

import { RoomMetadata } from "../lib/controller";
import { safeJsonParse } from "../lib/utils";
import {
  ReceivedChatMessage,
  useChat,
  useLocalParticipant,
  useRoomInfo,
} from "@livekit/components-react";
import { Send, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useMemo, useState } from "react";

export function ChatMessage({ message }: { message: ReceivedChatMessage }) {
  const { localParticipant } = useLocalParticipant();

  return (
    <div className="flex gap-2 items-start break-words w-[220px]">
      <Avatar className="h-6 w-6">
        <AvatarFallback>
          {message.from?.name?.[0] ??
            message.from?.identity?.[0] ?? (
              <User className="h-4 w-4" />
            )}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col">
        <span
          className={`text-xs font-bold ${localParticipant.identity === message.from?.identity
            ? "text-primary"
            : "text-muted-foreground"
            }`}
        >
          {message.from?.name ?? message.from?.identity ?? "Unknown"}
        </span>
        <span className="text-xs">{message.message}</span>
      </div>
    </div>
  );
}

export function Chat() {
  const [draft, setDraft] = useState("");
  const { chatMessages, send } = useChat();
  const { metadata } = useRoomInfo();

  const { enable_chat: chatEnabled } = safeJsonParse(metadata, {} as RoomMetadata);

  const messages = useMemo(() => {
    const timestamps = chatMessages.map((msg) => msg.timestamp);
    const filtered = chatMessages.filter(
      (msg, i) => !timestamps.includes(msg.timestamp, i + 1)
    );

    return filtered;
  }, [chatMessages]);

  const onSend = async () => {
    if (draft.trim().length && send) {
      setDraft("");
      await send(draft);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="text-center p-2 border-b border-border">
        <span className="text-sm font-mono text-primary">
          Live Chat
        </span>
      </div>
      <div className="flex flex-col justify-end flex-1 h-full px-2 overflow-y-auto gap-2 py-2">
        {messages.map((msg) => (
          <ChatMessage message={msg} key={msg.timestamp} />
        ))}
      </div>
      <div>
        <div className="flex gap-2 py-2 px-4 mt-4 border-t border-border">
          <div className="flex-1">
            <Input
              disabled={!chatEnabled}
              placeholder={
                chatEnabled ? "Say something..." : "Chat is disabled"
              }
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyUp={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  onSend();
                }
              }}
            />
          </div>
          <Button size="icon" onClick={onSend} disabled={!draft.trim().length}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
