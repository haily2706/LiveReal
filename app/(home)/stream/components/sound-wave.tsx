"use client";

import { cn } from "@/lib/utils";

export function SoundWave({ className }: { className?: string }) {
    return (
        <div className={cn("flex items-center justify-center gap-1.5 h-12 w-fit", className)}>
            {[...Array(32)].map((_, i) => (
                <div
                    key={i}
                    className="w-0.5 bg-white rounded-full animate-music-bar"
                    style={{
                        animationDelay: `${i * 0.08}s`,
                        animationDuration: "1.2s"
                    }}
                />
            ))}
            <style jsx>{`
        @keyframes music-bar {
          0%, 100% { height: 20%; opacity: 0.3; }
          50% { height: 100%; opacity: 1; }
        }
        .animate-music-bar {
          animation: music-bar 1.2s ease-in-out infinite;
        }
      `}</style>
        </div>
    );
}
