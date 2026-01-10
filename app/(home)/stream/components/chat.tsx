"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Crown, MoreVertical, X, Send, ChevronDown, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { cn, safeJsonParse } from "@/lib/utils";
import { useChat, useLocalParticipant, useRoomInfo, useDataChannel } from "@livekit/components-react";
import { RoomMetadata } from "../../../../lib/livekit";
import { ReactionPicker } from "./reaction-picker";
import { mediaClient } from "@/lib/media.client";
import { AnimatePresence, motion } from "framer-motion";



interface ChatProps {
  className?: string;
  onClose?: () => void;
}

// Configure the duration (in seconds) for which chat messages remain visible
const EPHEMERAL_MESSAGE_DURATION_SEC = 30;
// Configure the interval (in milliseconds) to check for expired messages
const EPHEMERAL_CHECK_INTERVAL_MS = 10000;

export function Chat({ className, onClose }: ChatProps) {
  const { chatMessages, send } = useChat();
  const { metadata, name } = useRoomInfo();
  const { localParticipant } = useLocalParticipant();
  const [encoder] = useState(() => new TextEncoder());
  const { send: sendReaction } = useDataChannel("reactions");
  const { send: sendGift } = useDataChannel("gifts");

  const [draft, setDraft] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const { enable_chat: chatEnabled } = safeJsonParse(metadata, {} as RoomMetadata);

  const [messages, setMessages] = useState<typeof chatMessages>([]);
  const latestChatMessages = useRef<typeof chatMessages>([]);

  const filterEphemeralMessages = (msgs: typeof chatMessages) => {
    // console.log("filterEphemeralMessages", msgs.length);
    const now = Date.now();
    const timestamps = msgs.map((msg) => msg.timestamp);
    return msgs.filter(
      (msg, i) =>
        !timestamps.includes(msg.timestamp, i + 1) &&
        now - msg.timestamp < EPHEMERAL_MESSAGE_DURATION_SEC * 1000
    );
  };

  const pruneMessages = useCallback(() => {

    const filtered = filterEphemeralMessages(latestChatMessages.current);

    setMessages((prev) => {
      if (prev.length !== filtered.length) return filtered;
      const isDifferent = prev.some(
        (p, i) => p.timestamp !== filtered[i].timestamp
      );
      return isDifferent ? filtered : prev;
    });
  }, []);

  // Update ref and trigger immediate update when new messages arrive
  useEffect(() => {

    const prevMsgs = latestChatMessages.current;

    // If messages added, just append them without re-filtering the old ones
    if (chatMessages.length > prevMsgs.length) {
      const newMsgs = chatMessages.slice(prevMsgs.length);
      setMessages((prev) => [...prev, ...newMsgs]);
    } else if (chatMessages.length < prevMsgs.length) {
      // If messages removed (cleared), re-run filter
      const filtered = filterEphemeralMessages(chatMessages);
      setMessages(filtered);
    }

    latestChatMessages.current = chatMessages;
  }, [chatMessages]);

  // Set up checking interval independent of message updates
  useEffect(() => {
    const interval = setInterval(pruneMessages, EPHEMERAL_CHECK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [pruneMessages]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (containerRef.current) {
      const viewport = containerRef.current.closest('[data-radix-scroll-area-viewport]') as HTMLElement;
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [messages]);

  const onSend = async () => {
    if (draft.trim().length && send) {
      try {
        await send(draft);
        setDraft("");
      } catch (error) {
        console.error("Failed to send message", error);
      }
    }
  };

  const onSendReaction = (emoji: string) => {
    if (sendReaction) {
      sendReaction(encoder.encode(emoji), { reliable: false });
    }
    if (send) {
      send(emoji);
    }
  };

  return (
    <div className={cn("flex flex-col h-full bg-white dark:bg-[#0f0f0f] text-zinc-950 dark:text-white rounded-xl border border-zinc-200 dark:border-zinc-800 w-full lg:w-[350px] shrink-0 relative overflow-hidden font-sans", className)}>

      {/* Header */}
      <div className="flex items-center justify-between px-2 py-2 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0f0f0f] relative z-10 shrink-0 h-14">
        <div className="flex items-center gap-1 px-2 py-1 rounded-lg transition-colors">
          <span className="text-base font-medium">Live chat</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-purple-100 dark:bg-[#2a1a45] hover:bg-purple-200 dark:hover:bg-[#352055] transition-colors rounded-full px-3 py-1.5 cursor-pointer">
            <Crown className="h-3.5 w-3.5 text-purple-600 dark:text-[#a855f7]" fill="currentColor" />
            <span className="text-xs font-semibold text-purple-700 dark:text-[#d8b4fe]">Top fans</span>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-black hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-white/10 rounded-full">
            <MoreVertical className="h-5 w-5" />
          </Button>
          {onClose && (
            <Button onClick={onClose} variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-black hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-white/10 rounded-full">
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 relative z-10 bg-white dark:bg-[#0f0f0f]">
        <div ref={containerRef} className="px-3 py-3 space-y-4">
          <AnimatePresence initial={false} mode="popLayout">
            {messages.map((message) => {
              const isLocal = localParticipant.identity === message.from?.identity;
              const displayName = message.from?.name || message.from?.identity || "Unknown";
              const nameColor = isLocal ? "text-zinc-900 dark:text-white" : "text-zinc-500 dark:text-zinc-400";

              return (
                <motion.div
                  key={message.timestamp}
                  layout
                  // Only animate the exit (ephemeral effect)
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                  className="flex gap-1 items-start group transition-colors"
                >
                  <Avatar className="h-6 w-6 rounded-full shrink-0 ring-0 ring-transparent">
                    <AvatarImage src={mediaClient.getAvatarUrl(message.from?.identity)} />
                    <AvatarFallback className={`text-[10px] font-bold ${nameColor} bg-zinc-100 dark:bg-zinc-800`}>
                      <User className="h-3.5 w-3.5" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 text-[13px] leading-relaxed pt-0.5">
                    <span className={`${nameColor} font-medium mr-2 hover:underline cursor-pointer`}>
                      {displayName}
                    </span>
                    <span className="text-zinc-800 dark:text-[#e2e2e2] wrap-break-word">
                      {message.message}
                    </span>
                  </div>
                  {/* Actions (hidden by default, show on hover) */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-zinc-600 dark:hover:text-white -mt-1 ml-1"
                  >
                    <MoreVertical className="h-3 w-3" />
                  </Button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </ScrollArea>

      {/* Footer / Input Area */}
      <div className="p-2 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0f0f0f] relative z-10 shrink-0">
        {chatEnabled === false ? (
          <div className="text-center text-zinc-500 text-sm py-2">
            Chat is disabled for this stream.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <ReactionPicker
              hostId={safeJsonParse(metadata, {} as RoomMetadata).creator_identity}
              roomId={name}
              onSelect={onSendReaction}
              onGiftSelect={(gift) => {
                // Server action now handles the data packet for gifts
                // if (sendGift) {
                //   sendGift(encoder.encode(JSON.stringify(gift)), { reliable: true });
                // }
                if (send) {
                  send(`Sent a ${gift.emoji} ${gift.name}!`);
                }
              }}
            />
            <div className="flex gap-2 items-center bg-zinc-100 dark:bg-[#1e1e1e] rounded-full px-2 py-1.5 focus-within:ring-1 focus-within:ring-black/20 dark:focus-within:ring-white/20 transition-all">
              <div className="h-8 w-8 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                <Avatar className="h-full w-full">
                  <AvatarImage src={mediaClient.getAvatarUrl(localParticipant.identity)} />
                  <AvatarFallback className="text-[10px] bg-zinc-300 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300">
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              </div>
              <Input
                placeholder="Chat as..."
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyUp={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    onSend();
                  }
                }}
                className="bg-transparent border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 px-2 h-9 text-sm placeholder:text-zinc-500 text-zinc-950 dark:text-white"
              />
              <Button
                size="icon"
                onClick={onSend}
                disabled={!draft.trim().length}
                variant="ghost"
                className={cn("rounded-full h-8 w-8 shrink-0 hover:bg-black/10 dark:hover:bg-white/10 transition-all", draft.trim().length ? "text-blue-500 dark:text-blue-400" : "text-zinc-400 dark:text-zinc-600")}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
