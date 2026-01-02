"use client";

import { StartAudio } from "@livekit/components-react";
import { SoundWave } from "./sound-wave";

export function CustomStartAudio() {
    return (
        <StartAudio
            // @ts-expect-error - LiveKit StartAudio accepts ReactNode in practice even if typed as string
            label={
                <div className="flex flex-col items-center justify-center gap-4 group cursor-pointer">
                    <SoundWave className="h-4" />
                    <div className="text-white/90 font-medium text-sm bg-black/20 px-4 py-2 rounded-full backdrop-blur-md border border-white/10 group-hover:bg-black/60 transition-all">
                        Click to listen
                    </div>
                </div>
            }
            className="fixed inset-0 w-full h-full bg-black/10! backdrop-blur-xs! flex items-center justify-center border-none p-0 m-0 z-50 cursor-pointer transition-all duration-500"
        />
    );
}
