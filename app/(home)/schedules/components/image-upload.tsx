"use client";

import { useState, useCallback } from "react";
import { Upload, X, ImageIcon, Loader2 } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface ImageUploadProps {
    value?: string;
    onChange: (url: string) => void;
    disabled?: boolean;
}

export function ImageUpload({ value, onChange, disabled }: ImageUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const supabase = createClient();

    const onUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            const file = e.target.files?.[0];
            if (!file) return;

            // Basic validation
            if (!file.type.startsWith("image/")) {
                toast.error("Please upload an image file");
                return;
            }

            if (file.size > 2 * 1024 * 1024) {
                toast.error("Image size must be less than 2MB");
                return;
            }

            setIsUploading(true);

            const fileExt = file.name.split(".").pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `thumbnails/${fileName}`;

            const { error: uploadError, data } = await supabase.storage
                .from("thumbnails")
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            const { data: { publicUrl } } = supabase.storage
                .from("thumbnails")
                .getPublicUrl(filePath);

            onChange(publicUrl);
            toast.success("Image uploaded successfully");
        } catch (error: any) {
            toast.error(error.message || "Failed to upload image");
        } finally {
            setIsUploading(false);
        }
    }, [onChange, supabase.storage]);

    const onRemove = useCallback(() => {
        onChange("");
    }, [onChange]);

    return (
        <div className="space-y-4 w-full">
            <div
                className={cn(
                    "relative aspect-video rounded-xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center overflow-hidden bg-secondary/20",
                    !value && "hover:border-primary/50 hover:bg-secondary/40 cursor-pointer",
                    value ? "border-transparent" : "border-muted-foreground/25",
                    disabled && "opacity-50 cursor-not-allowed"
                )}
            >
                {value ? (
                    <>
                        <Image
                            fill
                            src={value}
                            alt="Thumbnail"
                            className="object-cover"
                        />
                        <button
                            onClick={onRemove}
                            disabled={disabled}
                            type="button"
                            className="absolute top-2 right-2 p-1.5 rounded-full bg-red-500/80 text-white hover:bg-red-600 transition-colors backdrop-blur-sm shadow-lg z-10"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </>
                ) : (
                    <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer gap-2 p-4">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={onUpload}
                            disabled={disabled || isUploading}
                            className="hidden"
                        />
                        {isUploading ? (
                            <div className="flex flex-col items-center gap-1">
                                <Loader2 className="h-8 w-8 text-primary animate-spin" />
                                <p className="text-xs font-medium text-muted-foreground">Uploading...</p>
                            </div>
                        ) : (
                            <>
                                <div className="p-3 rounded-full bg-primary/10 text-primary group-hover:scale-105 transition-transform duration-300">
                                    <Upload className="h-6 w-6" />
                                </div>
                                <div className="text-center space-y-0.5">
                                    <p className="text-sm font-semibold">Upload thumbnail</p>
                                    <p className="text-[10px] text-muted-foreground">
                                        16:9 ratio, max 2MB
                                    </p>
                                </div>
                            </>
                        )}
                    </label>
                )}
            </div>
        </div>
    );
}
