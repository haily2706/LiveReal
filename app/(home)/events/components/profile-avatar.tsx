"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { countries } from "@/lib/countries";
import { User } from "@supabase/supabase-js";

interface ProfileAvatarProps {
    user: User | null;
    fullName: string;
    country: string;
    avatarUrl: string;
    setAvatarUrl: (url: string) => void;
    setUser: (user: User) => void;
}

export function ProfileAvatar({
    user,
    fullName,
    country,
    avatarUrl,
    setAvatarUrl,
    setUser
}: ProfileAvatarProps) {
    const supabase = createClient();
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true);

            if (!e.target.files || e.target.files.length === 0) {
                return;
            }

            if (!user) {
                throw new Error("User not authenticated");
            }

            const file = e.target.files[0];
            const filePath = `${user.id}`;

            // Check file size (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                throw new Error('File size too large (max 2MB)');
            }

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file, {
                    upsert: true
                });

            if (uploadError) {
                throw uploadError;
            }

            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            const newAvatarUrl = `${publicUrl}?t=${Date.now()}`;
            setAvatarUrl(newAvatarUrl);

            const { data, error: updateError } = await supabase.auth.updateUser({
                data: {
                    avatar_url: newAvatarUrl,
                },
            });

            if (updateError) {
                throw updateError;
            }

            if (data.user) {
                setUser(data.user);
            }

            toast.success("Avatar updated successfully");
        } catch (error: any) {
            toast.error(error.message || "Error uploading avatar");
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="lg:w-48 flex flex-col items-center space-y-6 shrink-0">
            <div className="relative group">
                <div className="absolute -inset-0.5 bg-linear-to-r from-pink-500 to-purple-500 rounded-full opacity-75 blur-md group-hover:opacity-100 transition duration-500" />
                <div className="relative h-32 w-32 rounded-full border-4 border-background overflow-hidden bg-muted shadow-xl">
                    <Avatar className="h-full w-full">
                        <AvatarImage
                            src={avatarUrl}
                            alt={fullName || "User"}
                            className="object-cover"
                        />
                        <AvatarFallback className="text-3xl font-bold bg-muted text-muted-foreground">
                            {uploading ? "..." : (fullName?.[0] || user?.email?.[0] || "").toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    {uploading && (
                        <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
                            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        </div>
                    )}
                </div>
                <Button
                    type="button"
                    size="icon"
                    variant="secondary"
                    onClick={triggerFileInput}
                    className="absolute bottom-1 right-1 rounded-full shadow-lg h-8 w-8 border border-background cursor-pointer"
                >
                    <span className="sr-only">Change Picture</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" /></svg>
                </Button>
            </div>
            <div className="text-center">
                <h3 className="font-semibold text-lg">{fullName || "Your Name"}</h3>
                <p className="text-sm text-muted-foreground">{country ? countries.find(c => c.value === country)?.label : "No location set"}</p>
            </div>
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleUpload}
                disabled={uploading}
            />
        </div>
    );
}
