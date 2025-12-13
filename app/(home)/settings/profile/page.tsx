"use client";

import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/app/components/auth/use-auth-store";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";

export default function ProfilePage() {
    const supabase = createClient();
    const { user, setUser } = useAuthStore();
    const [fullName, setFullName] = useState("");
    const [handle, setHandle] = useState("");
    const [avatarUrl, setAvatarUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [isEditingAvatar, setIsEditingAvatar] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    useEffect(() => {
        if (user) {
            setFullName(user.user_metadata?.full_name || "");
            setHandle(user.user_metadata?.handle || "");
            setAvatarUrl(user.user_metadata?.avatar_url || "");
        }
    }, [user]);

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

            setAvatarUrl(`${publicUrl}?t=${Date.now()}`);
            toast.success("Avatar uploaded successfully");
            setIsEditingAvatar(false);
        } catch (error: any) {
            toast.error(error.message || "Error uploading avatar");
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setLoading(true);

        try {
            const { data, error } = await supabase.auth.updateUser({
                data: {
                    full_name: fullName,
                    handle: handle,
                    avatar_url: avatarUrl,
                },
            });

            if (error) throw error;

            if (data.user) {
                setUser(data.user);
                toast.success("Profile updated successfully");
                setIsEditingAvatar(false);
                router.refresh();
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveAvatar = async () => {
        setAvatarUrl("");
        toast.info("Avatar removed. Click 'Save Changes' to apply.");
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    return (
        <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            onSubmit={handleSubmit}
            className="space-y-10 max-w-3xl"
        >
            <div>
                <h3 className="text-lg font-semibold tracking-tight">Profile</h3>
                <p className="text-xs text-muted-foreground mt-2">
                    This is how others will see you on the site.
                </p>
                <Separator className="my-6" />
            </div>

            {/* Picture Section */}
            <section className="space-y-6">
                <div>
                    <h3 className="text-base font-semibold tracking-tight">Profile Picture</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                        This image will be displayed on your channel and comments.
                    </p>
                </div>

                <div className="group relative bg-muted/30 border rounded-2xl p-8 flex flex-col sm:flex-row items-center sm:items-start gap-8 transition-all hover:bg-muted/50">
                    {/* Avatar Preview */}
                    <div className="shrink-0 relative">
                        <div className="absolute -inset-1 bg-linear-to-r from-pink-500 to-purple-500 rounded-full opacity-0 group-hover:opacity-75 blur-md transition duration-500" />
                        <div className="relative h-28 w-28 rounded-full border-4 border-background overflow-hidden bg-muted shadow-xl">
                            <Avatar className="h-full w-full">
                                <AvatarImage
                                    src={avatarUrl}
                                    alt={fullName || "User"}
                                    className="object-cover"
                                />
                                <AvatarFallback className="text-3xl font-bold bg-muted text-muted-foreground">
                                    {uploading ? "..." : (fullName?.[0] || user?.email?.[0] || "U").toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            {uploading && (
                                <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
                                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Instructions & Actions */}
                    <div className="flex-1 space-y-5 text-center sm:text-left w-full">
                        <div className="space-y-2">
                            <p className="text-xs text-muted-foreground leading-relaxed max-w-md">
                                Recommended: 98x98px, PNG or GIF. Max 2MB.
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleUpload}
                                disabled={uploading}
                            />
                            <Button
                                type="button"
                                variant="outline"
                                onClick={triggerFileInput}
                                disabled={uploading}
                                className="h-9 px-4 rounded-full hover:bg-primary hover:text-primary-foreground transition-all"
                            >
                                {uploading ? "Uploading..." : "Change Picture"}
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={handleRemoveAvatar}
                                className="h-9 px-4 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            >
                                Remove
                            </Button>
                        </div>

                        {/* Collapsible URL Input */}
                        {isEditingAvatar && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="pt-2 overflow-hidden"
                            >
                                <Label htmlFor="avatarUrl" className="sr-only">Avatar URL</Label>
                                <div className="flex gap-2 max-w-md">
                                    <Button size="sm" type="button" onClick={() => setIsEditingAvatar(false)} className="rounded-lg">
                                        Done
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            </section>

            <Separator />

            {/* Name Section */}
            <section className="space-y-6">
                <div>
                    <h3 className="text-base font-semibold tracking-tight">Display Name</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                        Choose a channel name that represents you and your content. Changes made to your name and picture are visible only on iReal. You can change your name twice in 14 days.
                    </p>
                </div>
                <div className="relative">
                    <div className="relative border rounded-lg px-3 py-2 bg-background transition-all focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20">
                        <Label htmlFor="fullName" className="sr-only">Display Name</Label>
                        <Input
                            id="fullName"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Your display name"
                            className="bg-transparent border-none shadow-none focus-visible:ring-0 px-0 h-auto text-sm font-medium placeholder:text-muted-foreground/40"
                        />
                    </div>
                </div>
            </section>

            {/* Handle Section */}
            <section className="space-y-6">
                <div>
                    <h3 className="text-sm font-medium tracking-tight">Handle</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                        Choose your unique handle by adding letters and numbers. You can change your handle back within 14 days. Handles can be changed twice every 14 days.
                    </p>
                </div>

                <div className="space-y-3">
                    <div className="relative">
                        <div className="relative border rounded-lg px-3 py-2 bg-background transition-all focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20">
                            <Label htmlFor="handle" className="sr-only">Handle</Label>
                            <Input
                                id="handle"
                                value={handle.startsWith('@') ? handle : handle ? `@${handle}` : ''}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    if (val === '' || val === '@') setHandle('');
                                    else if (!val.startsWith('@')) setHandle(`@${val}`);
                                    else setHandle(val);
                                }}
                                placeholder="@handle"
                                className="bg-transparent border-none shadow-none focus-visible:ring-0 px-0 h-auto text-sm font-medium placeholder:text-muted-foreground/40 font-mono"
                            />
                        </div>
                    </div>

                    <div className="pl-1">
                        <p className="text-xs text-muted-foreground font-mono bg-muted/50 inline-block px-2 py-1 rounded-md">
                            {handle ? `https://ireal.app/${handle}` : 'https://ireal.app/@handle'}
                        </p>
                    </div>
                </div>
            </section>

            <div className="flex justify-end pt-8 pb-4">
                <Button
                    type="submit"
                    className="min-w-[120px] rounded-full font-medium shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all"
                    disabled={loading || uploading}
                >
                    {loading ? "Saving..." : "Save Changes"}
                </Button>
            </div>
        </motion.form>
    );
};


