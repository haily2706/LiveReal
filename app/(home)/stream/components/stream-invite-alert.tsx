"use client";

import { useEffect, useState } from "react";
import { useLocalParticipant, useRoomContext } from "@livekit/components-react";
import { RoomEvent } from "livekit-client";
import { safeJsonParse } from "@/lib/utils";
import { ParticipantMetadata } from "../../../../lib/livekit";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuthToken } from "./token-context";
import { toast } from "sonner";

export function StreamInviteAlert() {
    const { localParticipant } = useLocalParticipant();
    const room = useRoomContext();
    const authToken = useAuthToken();
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const handleMetadataChange = () => {
            if (!localParticipant) return;
            const metadata = safeJsonParse(localParticipant.metadata, {} as ParticipantMetadata);

            // Check if invited but not yet accepted (hand_raised is true when on stage or requesting)
            // Actually, based on logic in presence-dialog:
            // invited_to_stage && !hand_raised => shows "Accept" / "Reject" buttons.
            if (metadata.invited_to_stage && !metadata.hand_raised) {
                setIsOpen(true);
            } else {
                setIsOpen(false);
            }
        };

        // Initial check
        handleMetadataChange();

        // Listen for changes
        room.on(RoomEvent.ParticipantMetadataChanged, handleMetadataChange);
        return () => {
            room.off(RoomEvent.ParticipantMetadataChanged, handleMetadataChange);
        };
    }, [localParticipant, room]);

    const handleAccept = async () => {
        try {
            console.log('[StreamInviteAlert] Accepting invitation for:', localParticipant?.identity);
            await fetch("/api/stream/raise_hand", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Token ${authToken}`,
                },
            });
            setIsOpen(false);
            toast.success("You joined the stage!");
        } catch (e) {
            toast.error("Failed to join stage");
        }
    };

    const handleReject = async () => {
        if (!localParticipant) return;

        try {
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
            setIsOpen(false);
            toast.info("Invitation rejected");
        } catch (e) {
            toast.error("Failed to reject invitation");
        }
    };

    return (
        <AlertDialog open={isOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Invitation to Stage</AlertDialogTitle>
                    <AlertDialogDescription>
                        The host has invited you to join the stage as a speaker. Do you accept?
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={handleReject}>Reject</AlertDialogCancel>
                    <AlertDialogAction onClick={handleAccept}>Accept</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
