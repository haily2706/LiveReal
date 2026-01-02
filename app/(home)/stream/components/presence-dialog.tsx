"use client";

import { useState, useEffect } from "react";

import { ParticipantMetadata, RoomMetadata } from "../lib/controller";
import { safeJsonParse } from "../lib/utils";
import {
  useLocalParticipant,
  useParticipants,
  useRoomContext,
} from "@livekit/components-react";
import { X, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Participant, RoomEvent } from "livekit-client";
import { useAuthToken } from "./token-context";
import { toAvatarURL } from "@/lib/constants";

function ParticipantListItem({
  participant,
  isCurrentUser,
  isHost = false,
}: {
  participant: Participant;
  isCurrentUser: boolean;
  isHost?: boolean;
}) {
  const authToken = useAuthToken();
  const participantMetadata = safeJsonParse(participant.metadata, {} as ParticipantMetadata);
  const room = useRoomContext();
  const roomMetadata = safeJsonParse(room.metadata, {} as RoomMetadata);

  console.log('[ParticipantListItem]', { identity: participant.identity, metadata: participantMetadata });

  const onInvite = async () => {
    // TODO: optimistic update
    await fetch("/api/stream/invite_to_stage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${authToken}`,
      },
      body: JSON.stringify({
        identity: participant.identity,
      }),
    });
  };

  // TODO: optimistic update
  const onRaiseHand = async () => {
    console.log('[onRaiseHand] Raising hand...');
    try {
      await fetch("/api/stream/raise_hand", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${authToken}`,
        },
      });
      console.log('[onRaiseHand] Hand raised successfully');
    } catch (e) {
      console.error('[onRaiseHand] Error:', e);
    }
  };

  // TODO: optimistic update
  const onCancel = async () => {
    await fetch("/api/stream/remove_from_stage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${authToken}`,
      },
      body: JSON.stringify({
        identity: participant.identity,
      }),
    });
  };

  function HostActions() {
    if (!isCurrentUser) {
      if (
        participantMetadata.invited_to_stage &&
        participantMetadata.hand_raised
      ) {
        return (
          <Button size="sm" variant="outline" onClick={onCancel}>
            Remove
          </Button>
        );
      } else if (participantMetadata.hand_raised) {
        return (
          <div className="flex gap-2">
            <Button size="sm" onClick={onInvite}>
              Accept
            </Button>
            <Button size="sm" variant="outline" onClick={onCancel}>
              Reject
            </Button>
          </div>
        );
      } else if (participantMetadata.invited_to_stage) {
        return (
          <Button size="sm" variant="outline" disabled>
            Pending
          </Button>
        );
      } else if (!participantMetadata.invited_to_stage) {
        return (
          <Button size="sm" onClick={onInvite}>
            Invite to stage
          </Button>
        );
      }
    }
  }

  function ViewerActions() {
    if (isCurrentUser) {
      if (
        participantMetadata.invited_to_stage &&
        participantMetadata.hand_raised
      ) {
        return (
          <Button size="sm" onClick={onCancel}>
            Leave stage
          </Button>
        );
      } else if (
        participantMetadata.invited_to_stage &&
        !participantMetadata.hand_raised
      ) {
        return (
          <div className="flex gap-2">
            <Button size="sm" onClick={onRaiseHand}>
              Accept
            </Button>
            <Button size="sm" variant="outline" onClick={onCancel}>
              Reject
            </Button>
          </div>
        );
      } else if (
        !participantMetadata.invited_to_stage &&
        participantMetadata.hand_raised
      ) {
        return (
          <Button size="sm" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        );
      } else if (
        !participantMetadata.invited_to_stage &&
        !participantMetadata.hand_raised
      ) {
        return (
          <Button size="sm" onClick={onRaiseHand}>
            Raise hand
          </Button>
        );
      }
    }
  }

  return (
    <div key={participant.sid} className="flex justify-between items-center">
      <div className="flex items-center gap-2">
        <Avatar className="h-6 w-6">
          <AvatarImage src={toAvatarURL(participant.identity)} />
          <AvatarFallback>
            {participant.name?.[0] ?? participant.identity?.[0] ?? <User className="h-4 w-4" />}
          </AvatarFallback>
        </Avatar>
        <span className={isCurrentUser ? "text-primary font-medium" : ""}>
          {participant.name ?? participant.identity}
          {isCurrentUser && " (you)"}
        </span>
      </div>
      {isHost && roomMetadata.allow_participation ? (
        <HostActions />
      ) : (
        <ViewerActions />
      )}
    </div>
  );
}

export function PresenceDialog({
  children,
  isHost = false,
}: {
  children: React.ReactNode;
  isHost?: boolean;
}) {
  const { localParticipant } = useLocalParticipant();
  const room = useRoomContext();
  const participants: Participant[] = [...Array.from(room.remoteParticipants.values())];
  if (room.localParticipant) {
    participants.push(room.localParticipant);
  }

  const hosts = participants.filter(
    (participant) => participant.permissions?.canPublish ?? false
  );
  const viewers = participants.filter(
    (participant) => !participant.permissions?.canPublish
  );
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

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="sm:max-w-[450px]">
        <DialogTitle className="flex justify-between items-center">
          Participants ({participants.length})
        </DialogTitle>
        <div className="flex flex-col gap-4 mt-4">
          {hosts.length > 0 && (
            <div className="flex flex-col gap-2">
              <span className="text-xs uppercase font-bold text-muted-foreground">
                {hosts.length > 1 ? "Co-Hosts" : "Host"}
              </span>
              {hosts.map((participant) => (
                <ParticipantListItem
                  key={participant.identity}
                  participant={participant}
                  isCurrentUser={
                    participant.identity === localParticipant.identity
                  }
                  isHost={isHost}
                />
              ))}
            </div>
          )}
          {viewers.length > 0 && (
            <div className="flex flex-col gap-2">
              <span className="text-xs uppercase font-bold text-muted-foreground">
                Viewers
              </span>
              {viewers.map((participant) => (
                <ParticipantListItem
                  key={participant.identity}
                  participant={participant}
                  isCurrentUser={
                    participant.identity === localParticipant.identity
                  }
                  isHost={isHost}
                />
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
