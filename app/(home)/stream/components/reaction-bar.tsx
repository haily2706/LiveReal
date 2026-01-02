"use client";

import { useChat, useDataChannel } from "@livekit/components-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DataPacket_Kind } from "livekit-client";
import { useState } from "react";

export function ReactionBar() {
  const [encoder] = useState(() => new TextEncoder());
  const { send } = useDataChannel("reactions");
  const { send: sendChat } = useChat();

  const onSend = (emoji: string) => {
    send(encoder.encode(emoji), { kind: DataPacket_Kind.LOSSY });
    if (sendChat) {
      sendChat(emoji);
    }
  };

  return (
    <div
      className="flex gap-2 justify-center items-center border-t border-border bg-secondary/20 h-[100px] text-center"
    >
      <TooltipProvider>
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <Button size="icon" variant="outline" className="h-12 w-12 text-2xl" onClick={() => onSend("🔥")}>
              🔥
            </Button>
          </TooltipTrigger>
          <TooltipContent>Fire</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="icon" variant="outline" className="h-12 w-12 text-2xl" onClick={() => onSend("👏")}>
              👏
            </Button>
          </TooltipTrigger>
          <TooltipContent>Applause</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="icon" variant="outline" className="h-12 w-12 text-2xl" onClick={() => onSend("🤣")}>
              🤣
            </Button>
          </TooltipTrigger>
          <TooltipContent>LOL</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="icon" variant="outline" className="h-12 w-12 text-2xl" onClick={() => onSend("❤️")}>
              ❤️
            </Button>
          </TooltipTrigger>
          <TooltipContent>Love</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="icon" variant="outline" className="h-12 w-12 text-2xl" onClick={() => onSend("🎉")}>
              🎉
            </Button>
          </TooltipTrigger>
          <TooltipContent>Confetti</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
