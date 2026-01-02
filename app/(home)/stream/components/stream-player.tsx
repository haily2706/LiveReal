"use client";


import { ParticipantMetadata, RoomMetadata } from "../lib/controller";
import { cn, safeJsonParse, formatCompactNumber } from "@/lib/utils";
import {
  VideoTrack,
  AudioTrack,
  useLocalParticipant,
  useMediaDeviceSelect,
  useParticipants,
  useRoomContext,
  useTracks,
  StartAudio,
} from "@livekit/components-react";
import { Eye, EyeOff, LogOut, Power, VolumeX } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FlyingReactions } from "./flying-reactions";
import { FlyingGifts } from "./flying-gifts";
import {
  ConnectionState,
  LocalVideoTrack,
  Track,
  createLocalTracks,
  RoomEvent,
  LocalParticipant,
  Participant,
} from "livekit-client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MediaDeviceSettings } from "./media-device-settings";
import { PresenceDialog } from "./presence-dialog";
import { useAuthToken } from "./token-context";
import { toAvatarURL } from "@/lib/constants";
import { Coin } from "@/components/ui/coin";

function ActiveStagePlayer({
  localParticipant,
  localMetadata,
  showBadge = true,
}: {
  localParticipant: LocalParticipant;
  localMetadata: ParticipantMetadata;
  showBadge?: boolean;
}) {
  const { isCameraEnabled } = useLocalParticipant();
  const tracks = useTracks([Track.Source.Camera]);
  const localVideoTrack = tracks.find((t) => t.participant.identity === localParticipant.identity);

  return (
    <div className="relative w-full h-full">
      {/* Fallback Avatar */}
      <div className="absolute inset-0 flex items-center justify-center bg-zinc-900">
        <Avatar className="h-1/2 w-1/2 max-h-32 max-w-32">
          <AvatarImage src={toAvatarURL(localParticipant.identity)} />
          <AvatarFallback className="text-2xl">
            {localParticipant.name?.[0] ?? localParticipant.identity?.[0] ?? ""}
          </AvatarFallback>
        </Avatar>
      </div>

      {/* Video */}
      {isCameraEnabled && localVideoTrack && (
        <VideoTrack
          trackRef={localVideoTrack}
          className="absolute inset-0 w-full h-full object-cover -scale-x-100"
        />
      )}

      {/* Badge */}
      {/* Badge */}
      {showBadge && (
        <div className="absolute bottom-2 right-2 z-10">
          <Badge variant="secondary" className="bg-black/50 backdrop-blur-sm text-white hover:bg-black/70">
            {localParticipant.name ?? localParticipant.identity} (you)
          </Badge>
        </div>
      )}
    </div>
  );
}

export function StreamPlayer({ isHost = false }) {
  const room = useRoomContext();
  const { metadata, name: roomName, state: roomState } = room;
  const [ticker, setTicker] = useState(0);
  const [reactionCount, setReactionCount] = useState(0);
  const [totalCoins, setTotalCoins] = useState(0);

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
  const creatorIdentity = roomMetadata?.creator_identity;

  const { localParticipant } = useLocalParticipant();
  const localMetadata = safeJsonParse(localParticipant.metadata, {} as ParticipantMetadata);

  // Am I allowed to be on stage? (Host or Invited Guest with Hand Raised)
  const canHost = isHost || (localMetadata?.invited_to_stage && localMetadata?.hand_raised);

  // Am I the Creator/Host of this stream?
  const isLocalHost = creatorIdentity ? localParticipant.identity === creatorIdentity : isHost;

  const participants = useParticipants();

  // Notification for Host: Are there raised hands?
  const showNotification = isHost
    ? Array.from(room.remoteParticipants.values()).some((p) => {
      const pMeta = safeJsonParse(p.metadata, {} as ParticipantMetadata);
      return pMeta?.hand_raised && !pMeta?.invited_to_stage;
    })
    : localMetadata?.invited_to_stage && !localMetadata?.hand_raised;

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
        Authorization: `Token ${authToken} `,
      },
      body: JSON.stringify({
        identity: localParticipant.identity,
      }),
    });
  };

  const router = useRouter();
  const onEndStream = async () => {
    try {
      await fetch("/api/stream/stop_stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${authToken} `,
        },
      });
      router.push("/events");
    } catch (error) {
      console.error("Failed to end stream", error);
    }
  };

  // Identify Host Participant (Remote)
  // We use creatorIdentity to find the host among remote participants
  const hostParticipant = creatorIdentity
    ? participants.find(p => p.identity === creatorIdentity && !p.isLocal)
    : undefined;

  // Identify Guest Participants (Remote & On Stage)
  const guestParticipants = participants.filter(p => {
    if (p.isLocal) return false;
    if (creatorIdentity && p.identity === creatorIdentity) return false;
    const meta = safeJsonParse(p.metadata, {} as ParticipantMetadata);
    return meta?.invited_to_stage;
  });

  const hostRemoteTrack = creatorIdentity
    ? remoteVideoTracks.find(t => t.participant.identity === creatorIdentity)
    : undefined;


  return (
    <div className="relative h-full w-full bg-zinc-950 overflow-hidden">

      {/* === PRIMARY LAYER (Host) === */}
      <div className="absolute inset-0 w-full h-full">
        {isLocalHost && canHost ? (
          // Layout: Local Host
          <ActiveStagePlayer
            localParticipant={localParticipant}
            localMetadata={localMetadata}
            showBadge={false}
          />
        ) : hostParticipant ? (
          // Layout: Remote Host (Connected)
          <div className="relative w-full h-full">
            {/* Avatar Fallback */}
            <div className="absolute inset-0 flex items-center justify-center bg-zinc-900">
              <Avatar className="h-48 w-48">
                <AvatarImage src={toAvatarURL(hostParticipant.identity)} />
                <AvatarFallback className="text-4xl">{hostParticipant.name?.[0] ?? "?"}</AvatarFallback>
              </Avatar>
            </div>
            {/* Video Track Overlay */}
            {hostRemoteTrack && (
              <VideoTrack
                trackRef={hostRemoteTrack}
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}
          </div>
        ) : (
          // Layout: Host Offline or Unknown
          <div className="flex items-center justify-center w-full h-full text-muted-foreground bg-zinc-900">
            <div className="flex flex-col items-center gap-4">
              <Avatar className="h-24 w-24">
                <AvatarFallback>?</AvatarFallback>
              </Avatar>
              <p className="font-medium animate-pulse">Stream is offline or connecting...</p>
            </div>
          </div>
        )}
      </div>


      {/* === OVERLAY LAYER (Guests) === */}
      {/* Top Center Row (User modified to flex-col) */}
      <div className="absolute top-2 left-[-6px] w-full flex flex-col justify-center gap-3 z-20 px-4 pointer-events-none">

        {/* Local Guest (Me on Stage) */}
        {canHost && !isLocalHost && (
          <div className="pointer-events-auto w-32 sm:w-48 aspect-video rounded-lg overflow-hidden ring-1 ring-white/10 shadow-xl bg-zinc-900 relative group">
            <ActiveStagePlayer
              localParticipant={localParticipant}
              localMetadata={localMetadata}
            />
          </div>
        )}

        {/* Remote Guests */}
        {guestParticipants.map((p) => {
          const videoTrack = remoteVideoTracks.find(t => t.participant.identity === p.identity);
          return (
            <div
              key={p.identity}
              className="pointer-events-auto w-32 sm:w-48 aspect-video rounded-lg overflow-hidden ring-1 ring-white/10 shadow-xl bg-zinc-900 relative group"
            >
              {/* Avatar Fallback */}
              <div className="absolute inset-0 flex items-center justify-center bg-zinc-800">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={toAvatarURL(p.identity)} />
                  <AvatarFallback>{p.name?.[0] ?? "?"}</AvatarFallback>
                </Avatar>
              </div>

              {/* Video */}
              {videoTrack && (
                <VideoTrack
                  trackRef={videoTrack}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              )}

              {/* Name Badge */}
              <div className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Badge variant="secondary" className="text-[10px] h-5 px-1.5 bg-black/60 text-white backdrop-blur-md">
                  {p.name ?? p.identity}
                </Badge>
              </div>
            </div>
          );
        })}
      </div>


      {/* === AUDIO TRACKS === */}
      {remoteAudioTracks.map((t) => (
        <AudioTrack trackRef={t} key={t.participant.identity} />
      ))}

      {/* === REACTION EFFECTS === */}
      <FlyingReactions onReaction={() => setReactionCount(prev => prev + 1)} />
      <FlyingGifts onGiftReceived={(gift) => setTotalCoins(prev => prev + gift.coins)} />

      {/* === START AUDIO PROMPT === */}
      <StartAudio
        label="Click to unmute"
        className="absolute bottom-20 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/60 hover:bg-black/80 backdrop-blur-sm text-white rounded-full z-50 cursor-pointer text-sm font-medium transition-all"
      />

      {/* === CONTROLS & INFO === */}

      {/* Top Right Info (Live Status + Presence) */}
      <div className="absolute top-2 right-2 z-30 flex gap-2 pointer-events-auto">
        {totalCoins > 0 && (
          <div className="flex items-center gap-1.5 animate-in fade-in slide-in-from-top-4 duration-500">
            <Coin className="w-4 h-4 shadow-black drop-shadow-md" />
            <span className=" text-white text-sm tabular-nums drop-shadow-md">
              {formatCompactNumber(totalCoins)}
            </span>

          </div>
        )}
        {reactionCount > 0 && (
          <div className="flex items-center gap-1 pointer-events-auto px-2 text-white animate-in fade-in duration-300">
            <span className="text-md shadow-black drop-shadow-md ">💖</span>
            <span className="text-sm tabular-nums shadow-black drop-shadow-md">{formatCompactNumber(reactionCount)}</span>
          </div>
        )}
        {roomState === ConnectionState.Connected && (
          <div className="flex gap-1 items-center px-2">
            <div className="rounded-full bg-red-500 w-2 h-2 animate-pulse" />
            <span className="text-xs uppercase font-medium text-red-500">
              Live
            </span>
          </div>
        )}
        <PresenceDialog isHost={isHost}>
          <div className="relative">
            {showNotification && (
              <div className="absolute flex h-3 w-3 -top-1 -right-1 z-50">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </div>
            )}
            <Button
              size="sm"
              variant="secondary"
              className="h-6 bg-black/40 backdrop-blur-md border-white/10 hover:bg-black/60 text-white"
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

      {/* Bottom Center Controls (Host) */}
      {roomName && canHost && (
        <div className="absolute bottom-0 sm:bottom-0 left-0 w-full z-30 flex flex-col justify-center items-center gap-2 pointer-events-none px-2">
          <div className="pointer-events-auto flex items-center justify-center gap-2">
            <MediaDeviceSettings />
            {(roomMetadata?.creator_identity !== localParticipant.identity) && (
              <Button size="sm" onClick={onLeaveStage} variant="destructive" className="h-10 w-10 p-0">
                <LogOut className="h-5 w-5" />
              </Button>
            )}
            {(roomMetadata?.creator_identity === localParticipant.identity) && (
              <Button size="sm" onClick={onEndStream} variant="destructive" className="h-10 w-10 p-0">
                <Power className="h-5 w-5" />
              </Button>
            )}
          </div>
          {/* Badge for Host View */}
          <div className="flex-1"></div>
          {/* {isLocalHost && (
            <div className="pointer-events-auto">
              <Badge variant="secondary" className="bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 h-8 flex items-center gap-1">
                <span className="truncate max-w-[80px] sm:max-w-[150px]">{localParticipant.name ?? localParticipant.identity}</span>
                (you)
              </Badge>
            </div>
          )} */}
        </div>
      )}

    </div>
  );
}
