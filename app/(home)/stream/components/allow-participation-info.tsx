"use client";

import { Info } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

export function AllowParticipationInfo() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className="h-6 w-6 text-muted-foreground"
          aria-label="Learn more about panel background options"
        >
          <Info className="h-4 w-4" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[360px] text-sm" side="top" align="center">
        <p>
          If enabled, viewers can <span className="font-semibold">raise their hand</span>. When
          accepted by the host, they can share their audio and video. The host
          can also <span className="font-semibold">invite</span> viewers to share their audio and
          video.
        </p>
      </PopoverContent>
    </Popover>
  );
}
