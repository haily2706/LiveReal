"use client";

import { createContext, useContext, useEffect, useState, useRef } from "react";
import { LiveKitRoom } from "@livekit/components-react";
import "@livekit/components-styles";
import { TokenContext } from "@/app/(home)/stream/components/token-context";
import { StreamPlayer } from "@/app/(home)/stream/components/stream-player";
import { createPortal } from "react-dom";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { log } from "console";

interface StreamInfo {
    eventId: string;
    role: 'host' | 'viewer';
    initialData: {
        title: string;
        description: string | null;
        thumbnail: string | null;
        streamer: {
            id: string;
            name: string;
            avatar: string;
            username: string;
        };
    };
}

interface StreamContextType {
    streamInfo: StreamInfo | null;
    setStreamInfo: (info: StreamInfo | null) => void;
    token: string;
    setToken: (token: string) => void;
    authToken: string;
    setAuthToken: (token: string) => void;
    wsUrl: string;
    setWsUrl: (url: string) => void;
    videoContainerRef: HTMLElement | null;
    setVideoContainerRef: (ref: HTMLElement | null) => void;
    leaveStream: (stopRoom?: boolean) => void;
    hasLeft: boolean;
}

const StreamContext = createContext<StreamContextType | undefined>(undefined);

export function useStreamContext() {
    return useContext(StreamContext);
}

export function StreamManager({ children }: { children: React.ReactNode }) {
    const [streamInfo, setStreamInfo] = useState<StreamInfo | null>(null);
    const [token, setToken] = useState("");
    const [authToken, setAuthToken] = useState("");
    const [wsUrl, setWsUrl] = useState("");
    const [videoContainerRef, setVideoContainerRef] = useState<HTMLElement | null>(null);

    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const [hasLeft, setHasLeft] = useState(false);

    // Use refs to keep the event listener stable and synchronized with latest state
    const streamInfoRef = useRef(streamInfo);
    const pathnameRef = useRef(pathname);
    const routerRef = useRef(router);
    const authTokenRef = useRef(authToken);
    const isStoppingRef = useRef(false);

    useEffect(() => {
        streamInfoRef.current = streamInfo;
        pathnameRef.current = pathname;
        routerRef.current = router;
        authTokenRef.current = authToken;
    }, [streamInfo, pathname, router, authToken]);

    const stopHostStream = async () => {
        const info = streamInfoRef.current;
        const token = authTokenRef.current;

        if (info?.role === 'host' && token && !isStoppingRef.current) {
            console.log("Stopping stream from manager...");
            isStoppingRef.current = true;
            try {
                await fetch("/api/stream/stop_stream", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Token ${token} `,
                    },
                    keepalive: true,
                    body: JSON.stringify({
                        force: false
                    })
                });
            } catch (error) {
                console.error("Failed to stop stream", error);
                // Reset flag on error so we can retry if needed, though for "Room does not exist" it usually means it's done.
                isStoppingRef.current = false;
            }
        }
    };

    useEffect(() => setMounted(true), []);

    const closeStream = () => {
        setToken("");
        setStreamInfo(null);
        setAuthToken("");
        setWsUrl("");
    };

    const leaveStream = (stopRoom = false) => {
        setHasLeft(true);
        if (stopRoom) {
            stopHostStream();
        }
        closeStream();
    };

    // Reset hasLeft when pathname changes (new navigation)
    useEffect(() => {
        setHasLeft(false);
    }, [pathname]);

    // Keep alive only if in PiP when navigating away
    useEffect(() => {
        if (token && streamInfo && pathname) {
            const isOnStreamPage = pathname === `/stream/${streamInfo.eventId}` || pathname.startsWith(`/stream/${streamInfo.eventId}/`);
            if (!isOnStreamPage && !document.pictureInPictureElement) {
                leaveStream(true);
            }
        }
    }, [pathname, token, streamInfo]);

    // Cleanup on unmount (e.g. tab close)
    useEffect(() => {
        return () => {
            stopHostStream();
        };
    }, []);

    // Handle PiP exit (Back to Tab or Close button)
    useEffect(() => {
        let interval: ReturnType<typeof setInterval> | null = null;

        const handleLeavePiP = (event: Event) => {
            if (interval) {
                clearInterval(interval);
                interval = null;
            }

            const info = streamInfoRef.current;
            const path = pathnameRef.current;
            const currentRouter = routerRef.current;

            if (path && info && !path.includes(info.eventId)) {
                const roleParam = info.role === 'host' ? '?role=host' : '';
                const url = `/stream/${info.eventId}${roleParam}`;
                currentRouter.push(url);
            }
        };

        const startPolling = () => {
            if (interval) return;
            console.log("Starting PiP exit polling...");

            interval = setInterval(() => {
                console.log("Polling PiP exit...");
                const currentPiP = document.pictureInPictureElement;

                // If we are no longer in PiP
                if (!currentPiP) {
                    handleLeavePiP(new Event('leavepictureinpicture'));
                }
            }, 3000);
        };

        const handleEnterPiP = (event: Event) => {
            startPolling();
        };

        // Monitoring function to attach listeners to ANY video that might enter PiP
        const monitorVideos = () => {
            document.querySelectorAll('video').forEach(video => {
                // Ensure we don't attach multiple times
                if (!(video as any)._pipTracked) {
                    (video as any)._pipTracked = true;
                    video.addEventListener('leavepictureinpicture', handleLeavePiP);
                    video.addEventListener('enterpictureinpicture', handleEnterPiP);
                }
            });
        };

        // Initial scan and observer for dynamic videos
        monitorVideos();
        const observer = new MutationObserver(monitorVideos);
        observer.observe(document.body, { childList: true, subtree: true });

        // Global window capture as backup
        window.addEventListener('leavepictureinpicture', handleLeavePiP, { capture: true });
        window.addEventListener('enterpictureinpicture', handleEnterPiP, { capture: true });

        return () => {
            if (interval) clearInterval(interval);
            observer.disconnect();
            window.removeEventListener('leavepictureinpicture', handleLeavePiP, { capture: true });
            window.removeEventListener('enterpictureinpicture', handleEnterPiP, { capture: true });
            document.querySelectorAll('video').forEach(video => {
                video.removeEventListener('leavepictureinpicture', handleLeavePiP);
                video.removeEventListener('enterpictureinpicture', handleEnterPiP);
                (video as any)._pipTracked = false;
            });
        };
    }, []);

    return (
        <StreamContext.Provider value={{
            streamInfo,
            setStreamInfo,
            token,
            setToken,
            authToken,
            setAuthToken,
            wsUrl,
            setWsUrl,
            videoContainerRef,
            setVideoContainerRef,
            leaveStream,
            hasLeft
        }}>
            <TokenContext.Provider value={authToken}>
                {!token ? (
                    <>
                        {children}
                    </>
                ) : (
                    <LiveKitRoom
                        token={token}
                        serverUrl={wsUrl}
                        connect={true}
                        data-lk-theme={mounted && resolvedTheme === 'dark' ? "default" : undefined}
                        className="flex flex-col h-full w-full"
                    >
                        {/* Hidden Container for Background PiP */}
                        <div
                            id="hidden-stream-container"
                            style={{
                                position: 'fixed',
                                bottom: 0,
                                right: 0,
                                width: '1px',
                                height: '1px',
                                opacity: 0,
                                pointerEvents: 'none',
                                zIndex: -1,
                                overflow: 'hidden'
                            }}
                        />

                        {/* Persistent Player */}
                        {streamInfo && (
                            <PersistentPlayerWrapper
                                containerRef={videoContainerRef}
                                streamInfo={streamInfo}
                            />
                        )}

                        {children}
                    </LiveKitRoom>
                )}
            </TokenContext.Provider>
        </StreamContext.Provider>
    );
}


function PersistentPlayerWrapper({
    containerRef,
    streamInfo
}: {
    containerRef: HTMLElement | null,
    streamInfo: StreamInfo
}) {
    // Find hidden container fallback
    const [hiddenContainer, setHiddenContainer] = useState<HTMLElement | null>(null);

    useEffect(() => {
        setHiddenContainer(document.getElementById('hidden-stream-container'));
    }, []);

    // Determine target container (Visible or Hidden)
    const targetContainer = containerRef || hiddenContainer;

    if (!targetContainer) return null;

    return createPortal(
        <div className="h-full w-full">
            <StreamPlayer
                isHost={streamInfo.role === 'host'}
                thumbnailUrl={streamInfo.initialData.thumbnail || undefined}
                streamerId={streamInfo.initialData.streamer.id}
                streamerName={streamInfo.initialData.streamer.name}
            />
        </div>,
        targetContainer
    );
}

