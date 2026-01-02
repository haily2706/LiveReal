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
          variant={micEnabled ? "secondary" : "outline"}
          onClick={() => setMicEnabled(!micEnabled)}
          className="rounded-r-none border-r-0"
        >
          Mic {micEnabled ? "On" : "Off"}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild disabled={!micEnabled}>
            <Button variant="secondary" size="sm" className="rounded-l-none px-2">
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
          variant={camEnabled ? "secondary" : "outline"}
          onClick={() => setCamEnabled(!camEnabled)}
          className="rounded-r-none border-r-0"
        >
          Cam {camEnabled ? "On" : "Off"}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild disabled={!camEnabled}>
            <Button variant="secondary" size="sm" className="rounded-l-none px-2">
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
