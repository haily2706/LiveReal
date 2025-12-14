import Image from "next/image";
import { cn } from "@/lib/utils";

interface TextLogoProps {
    className?: string;
    width?: number;
    height?: number;
}

export function TextLogo({ className, width = 180, height = 40 }: TextLogoProps) {
    return (
        <Image
            src="/text-logo.svg"
            alt="LiveReal Logo"
            width={width}
            height={height}
            className={cn("w-auto h-6 hover:opacity-80 transition-opacity", className)}
            priority
        />
    );
}
