"use client";

import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/components/auth/use-auth-store";
import { useSidebar } from "@/app/(home)/components/provider";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { countries } from "@/lib/countries";
import { EventTypes } from "@/lib/constants";
import { CalendarIcon, VideoIcon, Coins, PenSquare } from "lucide-react";
import { CreateEventModal } from "../components/create-event-modal";

export default function ProfilePage() {
    const supabase = createClient();
    const { user, setUser } = useAuthStore();
    const [fullName, setFullName] = useState("");
    const [country, setCountry] = useState("");
    const [bio, setBio] = useState("");
    const [isBirthdayEnabled, setIsBirthdayEnabled] = useState(false);
    const [birthdayTime, setBirthdayTime] = useState("");
    const [birthdayDate, setBirthdayDate] = useState<Date | undefined>();
    const [liveStreamDate, setLiveStreamDate] = useState<Date | undefined>();
    const [thumbnailUrl, setThumbnailUrl] = useState("");


    const [eventType, setEventType] = useState<string>("1");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [isShortStream, setIsShortStream] = useState(false);

    // Modal state
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);

    const [avatarUrl, setAvatarUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [isEditingAvatar, setIsEditingAvatar] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { isCollapsed } = useSidebar();
    const router = useRouter();

    useEffect(() => {
        if (user) {
            setFullName(user.user_metadata?.full_name || "");
            setCountry(user.user_metadata?.country || "");
            setBio(user.user_metadata?.bio || "");
            setIsBirthdayEnabled(user.user_metadata?.birthday_enabled || false);
            setBirthdayTime(user.user_metadata?.birthday_time || "");
            const savedDate = user.user_metadata?.birthday_date;
            if (savedDate) {
                setBirthdayDate(new Date(savedDate));
            }
            const savedLiveStreamDate = user.user_metadata?.live_stream_date;
            if (savedLiveStreamDate) {
                setLiveStreamDate(new Date(savedLiveStreamDate));
            }

            setAvatarUrl(user.user_metadata?.avatar_url || "");

            setThumbnailUrl(user.user_metadata?.thumbnail_url || "");
            setEventType(user.user_metadata?.event_type?.toString() || "1");
            setTitle(user.user_metadata?.live_stream_title || "");
            setDescription(user.user_metadata?.live_stream_description || "");
            setIsShortStream(user.user_metadata?.is_short_stream || false);
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
                    country: country,
                    bio: bio,
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
            onSubmit={handleSubmit}
            className={`flex-1 space-y-8 p-6 mx-auto w-full mb-20 transition-all duration-300 ${isCollapsed ? "max-w-full" : "max-w-5xl"}`}
        >
            <div className="flex items-center justify-between gap-4 pb-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-linear-to-r from-pink-500 to-purple-500 w-fit">My Events</h1>
                    <p className="text-muted-foreground text-sm mt-1 hidden sm:block">
                        Manage your upcoming events and personal details.
                    </p>
                </div>

            </div>

            <div className="flex flex-col lg:flex-row gap-10">
                {/* Left Column: Avatar */}
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
                                    {uploading ? "..." : (fullName?.[0] || user?.email?.[0] || "U").toUpperCase()}
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
                            className="absolute bottom-1 right-1 rounded-full shadow-lg h-8 w-8 border border-background"
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

                {/* Right Column: Details */}
                <div className="flex-1 space-y-6 flex flex-col gap-8">
                    <div className="text-card-foreground rounded-xl shadow-xs space-y-4">
                        <div className="flex items-center justify-between gap-4">
                            <div className="space-y-2">
                                <h3 className="font-semibold leading-none tracking-tight">Personal Details</h3>
                                <p className="text-sm text-muted-foreground">Manage how you appear to others.</p>
                            </div>
                            <Button
                                type="submit"
                                size="sm"
                                className="w-[130px] font-medium bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all hover:-translate-y-0.5"
                                disabled={loading || uploading}
                            >
                                {loading ? "Saving..." : "Save Changes"}
                            </Button>
                        </div>
                        <Separator />
                        <div className="grid gap-4">
                            <div className="grid grid-cols-1 sm:grid-cols-[1fr_240px] gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="fullName">Name</Label>
                                    <Input
                                        id="fullName"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        placeholder="Your display name"
                                        className="bg-transparent"
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="country">Location</Label>
                                    <Select value={country} onValueChange={setCountry}>
                                        <SelectTrigger id="country" className="bg-transparent">
                                            <SelectValue placeholder="Select your country" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {countries.map((c) => (
                                                <SelectItem key={c.value} value={c.value}>
                                                    {c.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="bio">Bio</Label>
                                <Textarea
                                    id="bio"
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    placeholder="Tell us a little bit about yourself"
                                    className="bg-transparent resize-none h-24"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="text-card-foreground shadow-xs space-y-4 overflow-hidden relative">
                        <div className="absolute top-[-24px] right-0 p-6 opacity-10">
                            <CalendarIcon className="w-12 h-12 text-pink-500" />
                        </div>
                        <div className="flex items-center justify-between relative z-10">
                            <div className="space-y-1">
                                <h3 className="font-semibold leading-none tracking-tight flex items-center gap-2">
                                    Upcoming Live Stream
                                    {isBirthdayEnabled && <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />}
                                </h3>
                                <p className="text-sm text-muted-foreground">Schedule your next celebration.</p>
                            </div>
                        </div>
                        <Separator />
                        <div className="bg-muted/30 rounded-lg p-4 relative overflow-hidden">
                            {title ? (
                                <div className="flex flex-col sm:flex-row gap-4 relative z-10">
                                    <div className="w-full sm:w-48 aspect-video sm:aspect-auto sm:h-28 bg-muted rounded-md shrink-0 overflow-hidden relative border border-border/50">
                                        {thumbnailUrl ? (
                                            <img src={thumbnailUrl} alt={title} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="flex items-center justify-center w-full h-full text-muted-foreground">
                                                <VideoIcon className="h-8 w-8 opacity-50" />
                                            </div>
                                        )}
                                        {isShortStream && (
                                            <div className="absolute top-1 right-1 bg-black/60 px-1.5 py-0.5 rounded text-[10px] text-white font-medium">9:16</div>
                                        )}
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h4 className="font-semibold text-lg leading-tight">{title}</h4>
                                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{description || "No description provided."}</p>
                                            </div>
                                            <span className="shrink-0 px-2 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full border border-primary/20">
                                                {EventTypes.find(e => e.value.toString() === eventType)?.name || "Event"}
                                            </span>
                                        </div>

                                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground pt-2">
                                            {liveStreamDate && (
                                                <div className="flex items-center gap-1.5">
                                                    <CalendarIcon className="h-4 w-4 text-pink-500" />
                                                    <span>{format(liveStreamDate, "PPP")}</span>
                                                </div>
                                            )}
                                            {birthdayTime && (
                                                <div className="flex items-center gap-1.5">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-500"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                                                    <span>{(() => {
                                                        const [h, m] = birthdayTime.split(":");
                                                        const hour = parseInt(h);
                                                        const isPM = hour >= 12;
                                                        const displayHour = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
                                                        return `${displayHour}:${m} ${isPM ? "PM" : "AM"}`;
                                                    })()}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="py-8 text-center space-y-3">
                                    <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto">
                                        <CalendarIcon className="h-6 w-6 text-muted-foreground" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="font-medium">No upcoming event scheduled</p>
                                        <p className="text-sm text-muted-foreground">Get ready for your big day by scheduling a stream!</p>
                                    </div>
                                    <Button onClick={() => setIsEventModalOpen(true)} variant="secondary" size="sm" type="button">
                                        Schedule Now
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>

                    <CreateEventModal
                        isOpen={isEventModalOpen}
                        onClose={() => setIsEventModalOpen(false)}
                    />

                    <div className="text-card-foreground rounded-xl shadow-xs space-y-4">
                        <div className="space-y-2">
                            <h3 className="font-semibold leading-none tracking-tight">My Events</h3>
                            <p className="text-sm text-muted-foreground">Manage your events.</p>
                        </div>
                        <Separator />
                        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="group relative flex border rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors overflow-hidden">
                                <div className="relative h-24 w-40 shrink-0 bg-muted">
                                    <img
                                        src="https://images.unsplash.com/photo-1566737236500-c8ac43014a67?q=80&w=1740&auto=format&fit=crop"
                                        alt="Thumbnail"
                                        className="h-full w-full object-cover"
                                    />
                                    <div className="absolute top-1 right-1 flex items-center gap-1 text-[10px] font-semibold text-white bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded-full">
                                        <img src="/coin.svg" alt="Coin" className="h-2.5 w-2.5" />
                                        <span>12.4k</span>
                                    </div>
                                </div>
                                <div className="flex flex-col flex-1 p-3 min-w-0 justify-between">
                                    <div className="space-y-1">
                                        <h4 className="font-medium text-sm line-clamp-1 group-hover:text-primary transition-colors">My 25th Birthday</h4>
                                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <CalendarIcon className="h-3 w-3" />
                                                Oct 24
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <VideoIcon className="h-3 w-3" />
                                                2h 15m
                                            </span>
                                        </div>
                                    </div>
                                    <div className="pt-2">
                                        <Button variant="ghost" size="sm" className="h-7 px-0 text-xs text-pink-500 hover:text-pink-600 hover:bg-transparent font-medium p-0 justify-start">
                                            Watch Replay &rarr;
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <div className="group relative flex border rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors overflow-hidden">
                                <div className="relative h-24 w-40 shrink-0 bg-muted">
                                    <img
                                        src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1000&auto=format&fit=crop"
                                        alt="Thumbnail"
                                        className="h-full w-full object-cover"
                                    />
                                    <div className="absolute top-1 right-1 flex items-center gap-1 text-[10px] font-semibold text-white bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded-full">
                                        <img src="/coin.svg" alt="Coin" className="h-2.5 w-2.5" />
                                        <span>8.3k</span>
                                    </div>
                                </div>
                                <div className="flex flex-col flex-1 p-3 min-w-0 justify-between">
                                    <div className="space-y-1">
                                        <h4 className="font-medium text-sm line-clamp-1 group-hover:text-primary transition-colors">FanMeet 101</h4>
                                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <CalendarIcon className="h-3 w-3" />
                                                Sep 12
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <VideoIcon className="h-3 w-3" />
                                                1h 45m
                                            </span>
                                        </div>
                                    </div>
                                    <div className="pt-2">
                                        <Button variant="ghost" size="sm" className="h-7 px-0 text-xs text-pink-500 hover:text-pink-600 hover:bg-transparent font-medium p-0 justify-start">
                                            Watch Replay &rarr;
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <div className="group relative flex border rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors overflow-hidden">
                                <div className="relative h-24 w-40 shrink-0 bg-muted">
                                    <img
                                        src="https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=1000&auto=format&fit=crop"
                                        alt="Thumbnail"
                                        className="h-full w-full object-cover"
                                    />
                                    <div className="absolute top-1 right-1 flex items-center gap-1 text-[10px] font-semibold text-white bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded-full">
                                        <img src="/coin.svg" alt="Coin" className="h-2.5 w-2.5" />
                                        <span>15.2k</span>
                                    </div>
                                </div>
                                <div className="flex flex-col flex-1 p-3 min-w-0 justify-between">
                                    <div className="space-y-1">
                                        <h4 className="font-medium text-sm line-clamp-1 group-hover:text-primary transition-colors">Karaoke Night Special</h4>
                                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <CalendarIcon className="h-3 w-3" />
                                                Aug 05
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <VideoIcon className="h-3 w-3" />
                                                3h 10m
                                            </span>
                                        </div>
                                    </div>
                                    <div className="pt-2">
                                        <Button variant="ghost" size="sm" className="h-7 px-0 text-xs text-pink-500 hover:text-pink-600 hover:bg-transparent font-medium p-0 justify-start">
                                            Watch Replay &rarr;
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.form>
    );
};
