"use client";

import { useEffect, useState, useRef } from "react";
import {
    LocalVideoTrack,
    LocalAudioTrack,
    createLocalTracks,
    Track,
} from "livekit-client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Mic, MicOff, Video, VideoOff, UserCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { LocalUserChoices } from "@livekit/components-react";

interface CustomPreJoinProps {
    room: string;
    username: string;
    userName: string;
    onSubmit: (values: LocalUserChoices) => void;
    onCancel: () => void;
}

export function CustomPreJoin({ room, username, userName, onSubmit, onCancel }: CustomPreJoinProps) {
    const [videoEnabled, setVideoEnabled] = useState(true);
    const [audioEnabled, setAudioEnabled] = useState(true);
    const [videoTrack, setVideoTrack] = useState<LocalVideoTrack | undefined>(undefined);
    const [audioTrack, setAudioTrack] = useState<LocalAudioTrack | undefined>(undefined);
    const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
    const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
    const [selectedVideoDeviceId, setSelectedVideoDeviceId] = useState<string>("");
    const [selectedAudioDeviceId, setSelectedAudioDeviceId] = useState<string>("");
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Initial setup
    useEffect(() => {
        let mounted = true;

        const init = async () => {
            try {
                // Get devices
                const devices = await navigator.mediaDevices.enumerateDevices();
                const vDevices = devices.filter(d => d.kind === 'videoinput');
                const aDevices = devices.filter(d => d.kind === 'audioinput');

                if (mounted) {
                    setVideoDevices(vDevices);
                    setAudioDevices(aDevices);
                    if (vDevices.length > 0) setSelectedVideoDeviceId(vDevices[0].deviceId);
                    if (aDevices.length > 0) setSelectedAudioDeviceId(aDevices[0].deviceId);
                }

                // Create initial tracks
                const tracks = await createLocalTracks({
                    audio: true,
                    video: true,
                });

                const vTrack = tracks.find(t => t.kind === Track.Kind.Video) as LocalVideoTrack;
                const aTrack = tracks.find(t => t.kind === Track.Kind.Audio) as LocalAudioTrack;

                if (mounted) {
                    setVideoTrack(vTrack);
                    setAudioTrack(aTrack);
                    setIsLoading(false);
                } else {
                    tracks.forEach(t => t.stop());
                }
            } catch (error) {
                console.error("Error initializing prejoin:", error);
                if (mounted) {
                    toast.error("Could not access camera or microphone");
                    setIsLoading(false);
                }
            }
        };

        init();

        return () => {
            mounted = false;
        };
    }, []);

    // Attach video track to element
    useEffect(() => {
        if (videoTrack && videoRef.current) {
            videoTrack.attach(videoRef.current);
        }
        return () => {
            if (videoTrack && videoRef.current) {
                videoTrack.detach(videoRef.current);
            }
        };
    }, [videoTrack]);

    // Cleanup tracks on unmount
    useEffect(() => {
        return () => {
            videoTrack?.stop();
            audioTrack?.stop();
        };
    }, [videoTrack, audioTrack]);

    const toggleVideo = () => {
        if (videoTrack) {
            if (videoEnabled) {
                videoTrack.mute();
            } else {
                videoTrack.unmute();
            }
            setVideoEnabled(!videoEnabled);
        }
    };

    const toggleAudio = () => {
        if (audioTrack) {
            if (audioEnabled) {
                audioTrack.mute();
            } else {
                audioTrack.unmute();
            }
            setAudioEnabled(!audioEnabled);
        }
    };

    const handleDeviceChange = async (kind: 'video' | 'audio', deviceId: string) => {
        if (kind === 'video') {
            setSelectedVideoDeviceId(deviceId);
            if (videoTrack) {
                await videoTrack.setDeviceId(deviceId);
            }
        } else {
            setSelectedAudioDeviceId(deviceId);
            if (audioTrack) {
                await audioTrack.setDeviceId(deviceId);
            }
        }
    };

    const handleSubmit = () => {
        // Stop tracks so main room can create its own
        videoTrack?.stop();
        audioTrack?.stop();

        onSubmit({
            videoEnabled,
            audioEnabled,
            videoDeviceId: selectedVideoDeviceId,
            audioDeviceId: selectedAudioDeviceId,
            username // This is display name passed as property 'username' to defaults in LiveKit
        });
    };

    if (isLoading) {
        return (
            <div className="flex h-full w-full items-center justify-center bg-background/95 backdrop-blur-3xl">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full w-full items-center justify-center p-4 bg-background/95 backdrop-blur-3xl animate-in fade-in duration-500">
            <div className="w-full max-w-lg space-y-6">

                {/* Header */}
                <div className="text-center space-y-2">
                    <h2 className="text-2xl font-bold tracking-tight">Ready to join?</h2>
                    <p className="text-muted-foreground">Joining as <span className="font-semibold text-foreground">{userName}</span></p>
                </div>

                {/* Video Preview */}
                <div className="relative aspect-video w-full bg-muted rounded-2xl overflow-hidden border border-border shadow-2xl ring-1 ring-white/10 group">
                    <video
                        ref={videoRef}
                        className={`w-full h-full object-cover transform scale-x-[-1] ${!videoEnabled ? 'hidden' : ''}`}
                        muted
                        playsInline
                    />

                    {!videoEnabled && (
                        <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-muted/50">
                            <div className="flex flex-col items-center gap-3 opacity-50">
                                <div className="h-20 w-20 rounded-full bg-background flex items-center justify-center shadow-sm">
                                    <UserCircle2 className="h-10 w-10" />
                                </div>
                                <p className="text-sm font-medium">Camera is off</p>
                            </div>
                        </div>
                    )}

                    {/* Controls Overlay */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/60 backdrop-blur-md p-2 rounded-2xl border border-white/10 transition-all duration-300 opacity-0 group-hover:opacity-100 focus-within:opacity-100">
                        <Button
                            variant={audioEnabled ? "secondary" : "destructive"}
                            size="icon"
                            className="h-10 w-10 rounded-xl transition-all duration-200"
                            onClick={toggleAudio}
                        >
                            {audioEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                        </Button>
                        <Button
                            variant={videoEnabled ? "secondary" : "destructive"}
                            size="icon"
                            className="h-10 w-10 rounded-xl transition-all duration-200"
                            onClick={toggleVideo}
                        >
                            {videoEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                        </Button>
                    </div>
                </div>

                {/* Settings / Devices */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground ml-1">Microphone</Label>
                        <Select
                            value={selectedAudioDeviceId}
                            onValueChange={(val) => handleDeviceChange('audio', val)}
                            disabled={!audioEnabled}
                        >
                            <SelectTrigger className="h-9 text-xs bg-secondary/50 border-0">
                                <SelectValue placeholder="Select mic" />
                            </SelectTrigger>
                            <SelectContent>
                                {audioDevices.map(d => (
                                    <SelectItem key={d.deviceId} value={d.deviceId}>{d.label || `Mic ${d.deviceId.slice(0, 4)}`}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground ml-1">Camera</Label>
                        <Select
                            value={selectedVideoDeviceId}
                            onValueChange={(val) => handleDeviceChange('video', val)}
                            disabled={!videoEnabled}
                        >
                            <SelectTrigger className="h-9 text-xs bg-secondary/50 border-0">
                                <SelectValue placeholder="Select camera" />
                            </SelectTrigger>
                            <SelectContent>
                                {videoDevices.map(d => (
                                    <SelectItem key={d.deviceId} value={d.deviceId}>{d.label || `Camera ${d.deviceId.slice(0, 4)}`}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-4">
                    <Button variant="ghost" className="flex-1 rounded-2xl" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button
                        className="flex-[2] rounded-2xl text-white shadow-lg hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                        onClick={handleSubmit}
                    >
                        Join Room
                    </Button>
                </div>

            </div>
        </div>
    );
}
