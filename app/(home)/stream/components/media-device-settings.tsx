"use client";

import { cn } from "@/lib/utils";
import {
  useLocalParticipant,
  useMediaDeviceSelect,
  useRoomContext,
} from "@livekit/components-react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConnectionState } from "livekit-client";
import { useEffect, useState } from "react";

export function MediaDeviceSettings() {
  const [micEnabled, setMicEnabled] = useState(true);
  const [camEnabled, setCamEnabled] = useState(true);

  const { state: roomState } = useRoomContext();
  const { localParticipant } = useLocalParticipant();

  useEffect(() => {
    if (roomState === ConnectionState.Connected) {
      void localParticipant.setMicrophoneEnabled(micEnabled);
      void localParticipant.setCameraEnabled(camEnabled);
    }
  }, [micEnabled, camEnabled, localParticipant, roomState]);

  const {
    devices: microphoneDevices,
    activeDeviceId: activeMicrophoneDeviceId,
    setActiveMediaDevice: setActiveMicrophoneDevice,
  } = useMediaDeviceSelect({
    kind: "audioinput",
  });

  const {
    devices: cameraDevices,
    activeDeviceId: activeCameraDeviceId,
    setActiveMediaDevice: setActiveCameraDevice,
  } = useMediaDeviceSelect({
    kind: "videoinput",
  });

  return (
    <>
      <div className="flex">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setMicEnabled(!micEnabled)}
          className={cn(
            "rounded-r-none border border-r-0 border-white/10 backdrop-blur-md transition-all px-3 min-w-[50px]",
            micEnabled
              ? "bg-black/40 hover:bg-black/60 text-white"
              : "bg-red-500/80 hover:bg-red-600/80 text-white border-red-500/50"
          )}
        >
          Mic {micEnabled ? "On" : "Off"}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild disabled={!micEnabled}>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "rounded-l-none px-2 border border-l-0 border-white/10 backdrop-blur-md transition-all",
                micEnabled
                  ? "bg-black/40 hover:bg-black/60 text-white"
                  : "bg-red-500/80 hover:bg-red-600/80 text-white border-red-500/50"
              )}
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {microphoneDevices.map((d) => (
              <DropdownMenuItem
                key={d.deviceId}
                onClick={() => setActiveMicrophoneDevice(d.deviceId)}
                className={cn(
                  d.deviceId === activeMicrophoneDeviceId && "text-primary font-medium"
                )}
              >
                {d.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="flex">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setCamEnabled(!camEnabled)}
          className={cn(
            "rounded-r-none border border-r-0 border-white/10 backdrop-blur-md transition-all px-3 min-w-[50px]",
            camEnabled
              ? "bg-black/40 hover:bg-black/60 text-white"
              : "bg-red-500/80 hover:bg-red-600/80 text-white border-red-500/50"
          )}
        >
          Cam {camEnabled ? "On" : "Off"}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild disabled={!camEnabled}>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "rounded-l-none px-2 border border-l-0 border-white/10 backdrop-blur-md transition-all",
                camEnabled
                  ? "bg-black/40 hover:bg-black/60 text-white"
                  : "bg-red-500/80 hover:bg-red-600/80 text-white border-red-500/50"
              )}
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {cameraDevices.map((d) => (
              <DropdownMenuItem
                key={d.deviceId}
                onClick={() => setActiveCameraDevice(d.deviceId)}
                className={cn(
                  d.deviceId === activeCameraDeviceId && "text-primary font-medium"
                )}
              >
                {d.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
}
