"use client";

import { useCopyToClipboard } from "../lib/clipboard";
import { ParticipantMetadata, RoomMetadata } from "../lib/controller";
import { safeJsonParse } from "../lib/utils";
import {
  VideoTrack,
  AudioTrack,
  useDataChannel,
  useLocalParticipant,
  useMediaDeviceSelect,
  useParticipants,
  useRoomContext,
  useTracks,
  StartAudio,
} from "@livekit/components-react";
import { Copy, Eye, EyeOff } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Confetti from "js-confetti";
import {
  ConnectionState,
  LocalVideoTrack,
  Track,
  createLocalTracks,
  RoomEvent,
  LocalParticipant,
} from "livekit-client";
import { useEffect, useRef, useState } from "react";
import { MediaDeviceSettings } from "./media-device-settings";
import { PresenceDialog } from "./presence-dialog";
import { useAuthToken } from "./token-context";

function ConfettiCanvas() {
  const [confetti, setConfetti] = useState<Confetti>();
  const [decoder] = useState(() => new TextDecoder());
  const canvasEl = useRef<HTMLCanvasElement>(null);
  useDataChannel("reactions", (data) => {
    const options: { emojis?: string[]; confettiNumber?: number } = {};

    if (decoder.decode(data.payload) !== "🎉") {
      options.emojis = [decoder.decode(data.payload)];
      options.confettiNumber = 12;
    }

    confetti?.addConfetti(options);
  });

  useEffect(() => {
    setConfetti(new Confetti({ canvas: canvasEl?.current ?? undefined }));
  }, []);

  return <canvas ref={canvasEl} className="absolute h-full w-full" />;
}

function ActiveStagePlayer({
  localParticipant,
  localMetadata,
}: {
  localParticipant: LocalParticipant;
  localMetadata: ParticipantMetadata;
}) {
  const [localVideoTrack, setLocalVideoTrack] = useState<LocalVideoTrack>();
  const localVideoEl = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const createTracks = async () => {
      const tracks = await createLocalTracks({ audio: true, video: true });
      const camTrack = tracks.find((t) => t.kind === Track.Kind.Video);
      if (camTrack && localVideoEl?.current) {
        camTrack.attach(localVideoEl.current);
      }
      setLocalVideoTrack(camTrack as LocalVideoTrack);
    };
    void createTracks();
  }, []);

  const { activeDeviceId: activeCameraDeviceId } = useMediaDeviceSelect({
    kind: "videoinput",
  });

  useEffect(() => {
    if (localVideoTrack) {
      void localVideoTrack.setDeviceId(activeCameraDeviceId);
    }
  }, [localVideoTrack, activeCameraDeviceId]);

  return (
    <div className="relative">
      <div className="absolute w-full h-full flex items-center justify-center">
        <Avatar className="h-32 w-32">
          <AvatarImage src={localMetadata?.avatar_image} />
          <AvatarFallback>
            {localParticipant.name?.[0] ?? localParticipant.identity?.[0] ?? "?"}
          </AvatarFallback>
        </Avatar>
      </div>
      <video
        ref={localVideoEl}
        className="absolute w-full h-full object-contain -scale-x-100 bg-transparent"
      />
      <div className="absolute w-full h-full">
        <Badge variant="outline" className="absolute bottom-2 right-2">
          {localParticipant.name ?? localParticipant.identity} (you)
        </Badge>
      </div>
    </div>
  );
}

export function StreamPlayer({ isHost = false }) {
  const [_, copy] = useCopyToClipboard();

  const room = useRoomContext();
  const { metadata, name: roomName, state: roomState } = room;
  const [ticker, setTicker] = useState(0);

  useEffect(() => {
    const handleParticipantMetadataChanged = () => {
      setTicker((prev) => prev + 1);
    };
    room.on(RoomEvent.ParticipantMetadataChanged, handleParticipantMetadataChanged);
    return () => {
      room.off(
        RoomEvent.ParticipantMetadataChanged,
        handleParticipantMetadataChanged
      );
    };
  }, [room]);
  const roomMetadata = safeJsonParse(metadata, {} as RoomMetadata);
  const { localParticipant } = useLocalParticipant();
  const localMetadata = safeJsonParse(localParticipant.metadata, {} as ParticipantMetadata);
  const canHost =
    isHost || (localMetadata?.invited_to_stage && localMetadata?.hand_raised);
  const participants = useParticipants();
  const showNotification = isHost
    ? Array.from(room.remoteParticipants.values()).some((p) => {
      const metadata = safeJsonParse(p.metadata, {} as ParticipantMetadata);
      return metadata?.hand_raised && !metadata?.invited_to_stage;
    })
    : localMetadata?.invited_to_stage && !localMetadata?.hand_raised;

  // Removed local track management from StreamPlayer
  // It is now handled by ActiveStagePlayer

  const remoteVideoTracks = useTracks([Track.Source.Camera]).filter(
    (t) => t.participant.identity !== localParticipant.identity
  );

  const remoteAudioTracks = useTracks([Track.Source.Microphone]).filter(
    (t) => t.participant.identity !== localParticipant.identity
  );

  const authToken = useAuthToken();
  const onLeaveStage = async () => {
    await fetch("/api/stream/remove_from_stage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${authToken}`,
      },
      body: JSON.stringify({
        identity: localParticipant.identity,
      }),
    });
  };

  return (
    <div className="relative h-full w-full bg-black">
      <div className="w-full h-full absolute grid gap-2">
        {canHost && (
          <ActiveStagePlayer
            localParticipant={localParticipant}
            localMetadata={localMetadata}
          />
        )}
        {remoteVideoTracks.map((t) => (
          <div key={t.participant.identity} className="relative">
            <div
              className="absolute w-full h-full flex items-center justify-center"
            >
              <Avatar className="h-32 w-32">
                <AvatarImage src={
                  (safeJsonParse(t.participant.metadata, {} as ParticipantMetadata))
                    ?.avatar_image
                } />
                <AvatarFallback>{t.participant.name?.[0] ?? t.participant.identity?.[0] ?? "?"}</AvatarFallback>
              </Avatar>
            </div>
            <VideoTrack
              trackRef={t}
              className="absolute w-full h-full bg-transparent"
            />
            <div className="absolute w-full h-full">
              <Badge
                variant="outline"
                className="absolute bottom-2 right-2"
              >
                {t.participant.name ?? t.participant.identity}
              </Badge>
            </div>
          </div>
        ))}
      </div>
      {
        remoteAudioTracks.map((t) => (
          <AudioTrack trackRef={t} key={t.participant.identity} />
        ))
      }
      <ConfettiCanvas />
      <StartAudio
        label="Click to allow audio playback"
        className="absolute top-0 h-full w-full bg-black/50 text-white"
      />
      <div className="absolute top-0 w-full p-2">
        <div className="flex justify-between items-end">
          <div className="flex gap-2 justify-center items-center">
            <Button
              size="sm"
              variant="secondary"
              disabled={!Boolean(roomName)}
              onClick={() =>
                copy(`${process.env.NEXT_PUBLIC_SITE_URL}/watch/${roomName}`)
              }
            >
              {roomState === ConnectionState.Connected ? (
                <>
                  {roomName} <Copy className="w-4 h-4" />
                </>
              ) : (
                "Loading..."
              )}
            </Button>
            {roomName && canHost && (
              <div className="flex gap-2">
                <MediaDeviceSettings />
                {roomMetadata?.creator_identity !==
                  localParticipant.identity && (
                    <Button size="sm" onClick={onLeaveStage}>
                      Leave stage
                    </Button>
                  )}
              </div>
            )}
          </div>
          <div className="flex gap-2">
            {roomState === ConnectionState.Connected && (
              <div className="flex gap-1 items-center">
                <div className="rounded-full bg-red-500 w-2 h-2 animate-pulse" />
                <span className="text-xs uppercase font-medium text-red-500">
                  Live
                </span>
              </div>
            )}
            <PresenceDialog isHost={isHost}>
              <div className="relative">
                {showNotification && (
                  <div className="absolute flex h-3 w-3 -top-1 -right-1">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-11 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-accent-11"></span>
                  </div>
                )}
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={roomState !== ConnectionState.Connected}
                >
                  {roomState === ConnectionState.Connected ? (
                    <Eye className="w-4 h-4" />
                  ) : (
                    <EyeOff className="w-4 h-4" />
                  )}
                  {roomState === ConnectionState.Connected
                    ? participants.length
                    : ""}
                </Button>
              </div>
            </PresenceDialog>
          </div>
        </div>
      </div>
    </div >
  );
}
