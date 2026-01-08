"use client";


import { ParticipantMetadata, RoomMetadata } from "../../../../lib/livekit";
import { cn, safeJsonParse, formatCompactNumber } from "@/lib/utils";
import {
  VideoTrack,
  AudioTrack,
  useLocalParticipant,
  useMediaDeviceSelect,
  useParticipants,
  useRoomContext,
  useTracks,
} from "@livekit/components-react";
import { useStreamContext } from "@/app/(home)/components/stream-manager";
import { Eye, EyeOff, LogOut, Power, VolumeX, PictureInPicture, Pin, PinOff } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
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
import { CustomStartAudio } from "./custom-start-audio";
import { PresenceDialog } from "./presence-dialog";
import { useAuthToken } from "./token-context";
import { toAvatarURL } from "@/lib/constants";
import { Coin } from "@/components/ui/coin";

function ActiveStagePlayer({
  localParticipant,
  localMetadata,
  showBadge = true,
  large = false,
}: {
  localParticipant: LocalParticipant;
  localMetadata: ParticipantMetadata;
  showBadge?: boolean;
  large?: boolean;
}) {
  const { isCameraEnabled } = useLocalParticipant();
  const tracks = useTracks([Track.Source.Camera]);
  const localVideoTrack = tracks.find((t) => t.participant.identity === localParticipant.identity);

  return (
    <div className="relative w-full h-full bg-transparent overflow-hidden">
      {/* Fallback Avatar Overlay - Only show if camera is off */}
      {!isCameraEnabled && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150 animate-pulse" />
            <Avatar className={cn(
              "border-white/10 shadow-2xl relative z-20",
              large ? "h-24 w-24 sm:h-32 sm:w-32 border-4" : "h-12 w-12 border-2"
            )}>
              <AvatarImage src={toAvatarURL(localParticipant.identity)} />
              <AvatarFallback className={cn(
                "bg-zinc-900 text-white",
                large ? "text-4xl" : "text-xl"
              )}>
                {localParticipant.name?.[0] ?? localParticipant.identity?.[0] ?? ""}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      )}

      {/* Video */}
      {isCameraEnabled && localVideoTrack && (
        <VideoTrack
          trackRef={localVideoTrack}
          id="main-video-player"
          className="absolute inset-0 w-full h-full object-cover -scale-x-100 z-20"
        />
      )}

      {/* Badge */}
      {showBadge && (
        <div className="absolute bottom-0 right-1 z-30">
          <span className="text-[9px] font-bold text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
            {localParticipant.name ?? localParticipant.identity} (you)
          </span>
        </div>
      )}
    </div>
  );
}

export function StreamPlayer({ isHost = false, thumbnailUrl, streamerId, streamerName }: { isHost?: boolean; thumbnailUrl?: string; streamerId?: string; streamerName?: string }) {
  const room = useRoomContext();
  const { metadata, name: roomName, state: roomState } = room;
  const [ticker, setTicker] = useState(0);
  const [reactionCount, setReactionCount] = useState(0);
  const [totalCoins, setTotalCoins] = useState(0);
  const [isInPip, setIsInPip] = useState(false);


  // Handle PiP state
  useEffect(() => {
    const onEnterPiP = () => setIsInPip(true);
    const onLeavePiP = () => setIsInPip(false);

    // Attach to window with capture to catch non-bubbling events from any video element
    window.addEventListener('enterpictureinpicture', onEnterPiP, { capture: true });
    window.addEventListener('leavepictureinpicture', onLeavePiP, { capture: true });

    return () => {
      window.removeEventListener('enterpictureinpicture', onEnterPiP, { capture: true });
      window.removeEventListener('leavepictureinpicture', onLeavePiP, { capture: true });
    }
  }, []);

  const togglePiP = async () => {
    try {
      // Try to find the specific main video player
      let videoEl = document.getElementById("main-video-player") as HTMLElement | null;

      // If the element found is not a video tag (e.g. wrapper), look inside
      if (videoEl && !(videoEl instanceof HTMLVideoElement)) {
        videoEl = videoEl.querySelector("video");
      }

      // Fallback: try finding the first video element in the document
      if (!videoEl) {
        videoEl = document.querySelector("video");
      }

      if (!videoEl || !(videoEl instanceof HTMLVideoElement)) {
        toast.error("No active stream video found");
        return;
      }

      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await videoEl.requestPictureInPicture();
      }
    } catch (error) {
      console.error("Failed to toggle PiP:", error);
      toast.error("Failed to enter Picture-in-Picture");
    }
  };

  useEffect(() => {
    const handleMetadataChanged = () => {
      setTicker((prev) => prev + 1);
    };
    room.on(RoomEvent.ParticipantMetadataChanged, handleMetadataChanged);
    room.on(RoomEvent.RoomMetadataChanged, handleMetadataChanged);
    return () => {
      room.off(RoomEvent.ParticipantMetadataChanged, handleMetadataChanged);
      room.off(RoomEvent.RoomMetadataChanged, handleMetadataChanged);
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

  const onPin = async (identity: string) => {
    try {
      await fetch("/api/stream/pin_participant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${authToken} `,
        },
        body: JSON.stringify({
          identity,
        }),
      });
    } catch (error) {
      toast.error("Failed to pin participant");
    }
  };

  const onUnpin = async () => {
    try {
      await fetch("/api/stream/unpin_participant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${authToken} `,
        },
      });
    } catch (error) {
      toast.error("Failed to unpin participant");
    }
  };

  useEffect(() => {
    // No cleanup required here as StreamManager handles it.
  }, []);

  const router = useRouter();
  const { leaveStream } = useStreamContext()!;

  const onEndStream = async () => {
    try {
      await fetch("/api/stream/stop_stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${authToken} `,
        },
        body: JSON.stringify({
          force: true
        }),
      });
    } catch (error) {
      console.error("Failed to stop stream API", error);
    }

    try {
      // Use the manager's leaveStream to handle API call and state cleanup synchronously
      leaveStream(true);
      router.push("/events/list");
    } catch (error) {
      console.error("Failed to end stream", error);
    }
  };

  const pinnedParticipantIdentity =
    (localMetadata?.is_pinned ? localParticipant.identity : undefined) ||
    participants.find((p) => {
      const meta = safeJsonParse(p.metadata, {} as ParticipantMetadata);
      return meta?.is_pinned;
    })?.identity ||
    roomMetadata?.pinned_identity;

  // Identify Main Stage Participant (Pinned or Host)
  const mainIdentity = pinnedParticipantIdentity && (
    pinnedParticipantIdentity === localParticipant.identity ||
    participants.some(p => p.identity === pinnedParticipantIdentity)
  )
    ? pinnedParticipantIdentity
    : (creatorIdentity || (isHost ? localParticipant.identity : undefined));

  const isLocalMain = mainIdentity === localParticipant.identity;

  const mainParticipant = isLocalMain
    ? localParticipant
    : participants.find(p => p.identity === mainIdentity);

  // Identify Sidebar Participants (Remote)
  // Everyone who is "on stage" (Host + Invited) EXCEPT the main focus
  const sidebarRemoteParticipants = participants.filter(p => {
    if (p.isLocal) return false;
    if (p.identity === mainIdentity) return false; // Already on main stage

    const meta = safeJsonParse(p.metadata, {} as ParticipantMetadata);
    const isCreator = creatorIdentity && p.identity === creatorIdentity;

    return isCreator || meta?.invited_to_stage;
  });

  const mainRemoteTrack = !isLocalMain && mainParticipant
    ? remoteVideoTracks.find(t => t.participant.identity === mainParticipant.identity)
    : undefined;

  const isMainCameraEnabled = mainParticipant?.isCameraEnabled;

  const showLocalInSidebar = canHost && !isLocalMain;


  return (
    <div className="relative h-full w-full bg-zinc-950 overflow-hidden">
      {/* Background Thumbnail */}
      {thumbnailUrl && (
        <div className="absolute inset-0 z-0 transition-opacity duration-1000">
          <img
            src={thumbnailUrl}
            alt="Stream Background"
            className={cn(
              "w-full h-full object-cover transition-all duration-1000",
              isMainCameraEnabled ? "opacity-30 blur-xl" : "opacity-60 blur-md"
            )}
          />
          <div className="absolute inset-0 bg-black/20" />
        </div>
      )}

      {/* === PRIMARY LAYER (Main Stage) === */}
      <div className="absolute inset-0 w-full h-full">
        {mainParticipant ? (
          isLocalMain ? (
            // Layout: Local Participant (Host or Pinned Guest Me)
            <ActiveStagePlayer
              localParticipant={localParticipant}
              localMetadata={localMetadata}
              showBadge={false}
              large
            />
          ) : (
            // Layout: Remote Participant on Main Stage
            <div className="relative w-full h-full group">
              {/* Avatar Fallback */}
              {!isMainCameraEnabled && (
                <div className="absolute inset-0 flex items-center justify-center z-10 transition-all">
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150 animate-pulse" />
                    <Avatar className="h-24 w-24 sm:h-32 sm:w-32 border-4 border-white/10 shadow-2xl relative z-20">
                      <AvatarImage src={toAvatarURL(mainParticipant.identity ?? streamerId)} />
                      <AvatarFallback className="text-4xl bg-zinc-900 text-white">
                        {mainParticipant.name?.[0] ?? mainParticipant.identity?.[0] ?? ""}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </div>
              )}
              {/* Video Track Overlay */}
              {isMainCameraEnabled && mainRemoteTrack && (
                <VideoTrack
                  trackRef={mainRemoteTrack}
                  id="main-video-player"
                  className="absolute inset-0 w-full h-full object-cover z-20"
                />
              )}

              {/* Unpin Button (Host Only) */}
              {isLocalHost && pinnedParticipantIdentity === mainParticipant.identity && (
                <div className="absolute top-10 right-2 z-40 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="rounded-full w-8 h-8 bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/10 text-white"
                    onClick={() => onUnpin()}
                  >
                    <PinOff />
                    {/* Unpin */}
                  </Button>
                </div>
              )}
            </div>
          )
        ) : (
          // Layout: Host Offline or Unknown
          <div className="flex items-center justify-center w-full h-full text-muted-foreground bg-transparent">
            {/* Same Offline UI */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150 animate-pulse" />
                <Avatar className="h-24 w-24 sm:h-32 sm:w-32 border-4 border-white/10 shadow-2xl relative z-20">
                  <AvatarImage src={toAvatarURL(streamerId)} />
                  <AvatarFallback className="text-4xl bg-zinc-900 text-white">
                    {streamerName?.[0] || ""}
                  </AvatarFallback>
                </Avatar>
              </div>
              <p className="font-medium animate-pulse">Stream is offline</p>
            </div>
          </div>
        )}

        {/* PiP Fallback Overlay */}
        {isInPip && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-zinc-950/90 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-300">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150 animate-pulse" />
                <Avatar className="h-24 w-24 sm:h-32 sm:w-32 border-4 border-white/10 shadow-2xl relative z-20">
                  <AvatarImage src={toAvatarURL(mainParticipant?.identity ?? streamerId)} />
                  <AvatarFallback className="text-4xl bg-zinc-900 text-white">
                    {mainParticipant?.name?.[0] ?? streamerName?.[0] ?? "S"}
                  </AvatarFallback>
                </Avatar>
                {/* PiP Badge */}
                <div className="absolute -bottom-2 -right-2 bg-indigo-500 text-white text-[10px] px-2 py-0.5 rounded-full border-2 border-zinc-950 font-bold shadow-lg flex items-center gap-1">
                  <PictureInPicture className="w-3 h-3" />
                  In PiP
                </div>
              </div>
            </div>
          </div>
        )}
      </div>


      {/* === OVERLAY LAYER (Sidebar) === */}
      {/* Top Left Stage Corner */}
      <div className="absolute top-2 left-2 flex flex-col items-start gap-2 z-30 pointer-events-none">
        {/* Local Sidebar Participant (e.g. Host bumped from main) */}
        {showLocalInSidebar && (
          <div className="pointer-events-auto w-24 sm:w-36 aspect-video rounded-lg overflow-hidden ring-1 ring-white/10 shadow-xl bg-zinc-900 relative group transition-all duration-300">
            <ActiveStagePlayer
              localParticipant={localParticipant}
              localMetadata={localMetadata}
            />
          </div>
        )}

        {/* Remote Sidebar Participants */}
        {sidebarRemoteParticipants.map((p) => {
          const videoTrack = remoteVideoTracks.find(t => t.participant.identity === p.identity);
          return (
            <div
              key={p.identity}
              className="pointer-events-auto w-24 sm:w-36 aspect-video rounded-lg overflow-hidden ring-1 ring-white/10 shadow-xl bg-zinc-900 relative group transition-all duration-300"
            >
              {/* Avatar Fallback */}
              <div className="absolute inset-0 flex items-center justify-center bg-zinc-900">
                <Avatar className="h-10 w-10 border-2 border-white/10 shadow-xl">
                  <AvatarImage src={toAvatarURL(p.identity)} />
                  <AvatarFallback className="text-lg bg-zinc-900 text-white">
                    {p.name?.[0] ?? p.identity?.[0] ?? ""}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Video */}
              {videoTrack && p.isCameraEnabled && (
                <VideoTrack
                  trackRef={videoTrack}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              )}

              {/* Name Badge */}
              <div className="absolute bottom-0 left-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                <span className="text-[9px] font-bold text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
                  {p.name ?? p.identity}
                </span>
              </div>

              {/* Pin Button (Host Only) */}
              {isLocalHost && (
                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                  <Button
                    size="icon"
                    variant="secondary"
                    className="h-6 w-6 rounded-full bg-black/50 hover:bg-black/70 border border-white/10 text-white"
                    onClick={() => onPin(p.identity)}
                  >
                    <Pin className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Right Actions */}
      <div className="absolute bottom-2 right-2 flex flex-col items-end gap-3 z-30 pointer-events-none">
        {/* PiP Toggle Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={togglePiP}
          className="pointer-events-auto rounded-full bg-black/40 backdrop-blur-md border border-white/10 hover:bg-black/60 text-white h-9 w-9 shadow-lg transition-all"
          title="Picture in Picture"
        >
          <PictureInPicture className="w-4 h-4" />
        </Button>
      </div>


      {/* === AUDIO TRACKS === */}
      {remoteAudioTracks.map((t) => (
        <AudioTrack trackRef={t} key={t.participant.identity} />
      ))}

      {/* === REACTION EFFECTS === */}
      <FlyingReactions onReaction={() => setReactionCount(prev => prev + 1)} />
      <FlyingGifts onGiftReceived={(gift) => setTotalCoins(prev => prev + gift.coins)} />

      {/* === START AUDIO PROMPT === */}
      {/* === START AUDIO PROMPT === */}
      <CustomStartAudio />

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
