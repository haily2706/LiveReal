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
import { CalendarIcon, VideoIcon, Coins } from "lucide-react";

export default function ProfilePage() {
    const supabase = createClient();
    const { user, setUser } = useAuthStore();
    const [fullName, setFullName] = useState("");
    const [country, setCountry] = useState("");
    const [bio, setBio] = useState("");
    const [isBirthdayEnabled, setIsBirthdayEnabled] = useState(false);
    const [birthdayTime, setBirthdayTime] = useState("");
    const [birthdayDate, setBirthdayDate] = useState<Date | undefined>();
    const [thumbnailUrl, setThumbnailUrl] = useState("");
    const [isEditingThumbnail, setIsEditingThumbnail] = useState(false);
    const thumbnailInputRef = useRef<HTMLInputElement>(null);

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

            setAvatarUrl(user.user_metadata?.avatar_url || "");
            setThumbnailUrl(user.user_metadata?.thumbnail_url || "");
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

    const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true);
            if (!e.target.files || e.target.files.length === 0) return;
            if (!user) throw new Error("User not authenticated");

            const file = e.target.files[0];
            const filePath = `thumbnail_${user.id}_${Date.now()}`;

            if (file.size > 2 * 1024 * 1024) throw new Error('File size too large (max 2MB)');

            const { error: uploadError } = await supabase.storage
                .from('avatars') // Reusing avatars bucket for now or use a 'thumbnails' bucket if exists
                .upload(filePath, file, { upsert: true });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);

            setThumbnailUrl(publicUrl);
            toast.success("Thumbnail uploaded successfully");
            setIsEditingThumbnail(false);
        } catch (error: any) {
            toast.error(error.message || "Error uploading thumbnail");
        } finally {
            setUploading(false);
            if (thumbnailInputRef.current) thumbnailInputRef.current.value = "";
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
                    birthday_enabled: isBirthdayEnabled,
                    birthday_time: birthdayTime,
                    birthday_date: birthdayDate ? birthdayDate.toISOString() : null,
                    avatar_url: avatarUrl,
                    thumbnail_url: thumbnailUrl,
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

    const triggerThumbnailInput = () => {
        thumbnailInputRef.current?.click();
    };

    const handleStartStream = () => {
        // In a real app, this would create a room and redirect to the streaming page
        toast.info("Starting birthday stream setup...");
        router.push("/dashboard");
    };

    return (
        <motion.form
            onSubmit={handleSubmit}
            className={`flex-1 space-y-8 p-6 mx-auto w-full mb-20 transition-all duration-300 ${isCollapsed ? "max-w-full" : "max-w-5xl"}`}
        >
            <div className="flex items-center justify-between gap-4 pb-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-linear-to-r from-pink-500 to-purple-500 w-fit">My Event</h1>
                    <p className="text-muted-foreground text-sm mt-1 hidden sm:block">
                        Manage your upcoming birthday event and personal details.
                    </p>
                </div>
                <Button
                    type="submit"
                    size="lg"
                    className="rounded-full px-8 font-medium bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all hover:-translate-y-0.5"
                    disabled={loading || uploading}
                >
                    {loading ? "Saving..." : "Save Changes"}
                </Button>
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
                <div className="flex-1 space-y-6">
                    <div className="text-card-foreground rounded-xl shadow-xs space-y-4">
                        <div className="space-y-2">
                            <h3 className="font-semibold leading-none tracking-tight">Personal Details</h3>
                            <p className="text-sm text-muted-foreground">Manage how you appear to others.</p>
                        </div>
                        <Separator />
                        <div className="grid gap-4">
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

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                                <div className="grid gap-2">
                                    <Label>Birthday</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full justify-start text-left font-normal bg-background/50",
                                                    !birthdayDate && "text-muted-foreground"
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {birthdayDate ? format(birthdayDate, "PPP") : <span>Pick a date</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                className="w-[250px]"
                                                selected={birthdayDate}
                                                onSelect={setBirthdayDate}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
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
                                    Upcoming Birthday Live Stream
                                    {isBirthdayEnabled && <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />}
                                </h3>
                                <p className="text-sm text-muted-foreground">Schedule your next celebration.</p>
                            </div>
                        </div>

                        <div className="space-y-6 pt-2 relative z-10 w-full">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>Visibility</Label>
                                    <Select
                                        value={isBirthdayEnabled ? "published" : "private"}
                                        onValueChange={(v) => setIsBirthdayEnabled(v === "published")}
                                    >
                                        <SelectTrigger className="bg-background/50">
                                            <SelectValue placeholder="Select visibility" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="private">Private (Only you)</SelectItem>
                                            <SelectItem value="published">Published (Everyone)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid gap-2">
                                    <Label>Live Stream Start Time</Label>
                                    <div className="flex gap-2">
                                        <Select
                                            value={(() => {
                                                if (!birthdayTime) return "12";
                                                const [h] = birthdayTime.split(":");
                                                let hour = parseInt(h);
                                                if (hour === 0) return "12";
                                                if (hour > 12) return (hour - 12).toString();
                                                return hour.toString();
                                            })()}
                                            onValueChange={(v) => {
                                                const [h, m] = (birthdayTime || "12:00").split(":");
                                                const oldHour = parseInt(h);
                                                const isPM = oldHour >= 12;
                                                let newHour = parseInt(v);
                                                if (isPM && newHour !== 12) newHour += 12;
                                                if (!isPM && newHour === 12) newHour = 0;
                                                setBirthdayTime(`${newHour.toString().padStart(2, '0')}:${m}`);
                                            }}
                                        >
                                            <SelectTrigger className="flex-1 bg-background/50">
                                                <SelectValue placeholder="Hour" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                                                    <SelectItem key={h} value={h.toString()}>
                                                        {h}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>

                                        <Select
                                            value={birthdayTime ? birthdayTime.split(":")[1] : "00"}
                                            onValueChange={(v) => {
                                                const [h] = (birthdayTime || "12:00").split(":");
                                                setBirthdayTime(`${h}:${v}`);
                                            }}
                                        >
                                            <SelectTrigger className="flex-1 bg-background/50">
                                                <SelectValue placeholder="Min" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Array.from({ length: 12 }, (_, i) => i * 5).map((m) => (
                                                    <SelectItem key={m} value={m.toString().padStart(2, "0")}>
                                                        {m.toString().padStart(2, "0")}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>

                                        <Select
                                            value={(() => {
                                                if (!birthdayTime) return "AM";
                                                const [h] = birthdayTime.split(":");
                                                return parseInt(h) >= 12 ? "PM" : "AM";
                                            })()}
                                            onValueChange={(v) => {
                                                const [h, m] = (birthdayTime || "12:00").split(":");
                                                let hour = parseInt(h);
                                                if (v === "PM" && hour < 12) hour += 12;
                                                if (v === "AM" && hour >= 12) hour -= 12;
                                                setBirthdayTime(`${hour.toString().padStart(2, '0')}:${m}`);
                                            }}
                                        >
                                            <SelectTrigger className="flex-1 bg-background/50">
                                                <SelectValue placeholder="AM/PM" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="AM">AM</SelectItem>
                                                <SelectItem value="PM">PM</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label>Live Stream Thumbnail</Label>
                                <div
                                    className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 flex flex-col items-center justify-center gap-2 hover:bg-muted/50 transition-colors cursor-pointer text-center h-48 relative overflow-hidden group"
                                    onClick={triggerThumbnailInput}
                                >
                                    {thumbnailUrl ? (
                                        <>
                                            <img src={thumbnailUrl} alt="Thumbnail" className="absolute inset-0 w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <p className="text-white font-medium">Change Thumbnail</p>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="p-3 bg-secondary rounded-full">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium text-muted-foreground">Click to upload thumbnail</p>
                                                <p className="text-xs text-muted-foreground/75">1280x720 recommended</p>
                                            </div>
                                        </>
                                    )}
                                </div>
                                <input
                                    type="file"
                                    ref={thumbnailInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleThumbnailUpload}
                                />
                            </div>

                            <div className="flex justify-end pt-2">
                                <Button
                                    type="button"
                                    onClick={handleStartStream}
                                    className="bg-linear-to-r from-pink-500 to-purple-600 font-semibold text-white shadow-md hover:shadow-lg transition-all w-full sm:w-auto"
                                >
                                    <VideoIcon className="mr-2 h-4 w-4" />
                                    Start Live Stream
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.form>
    );
};
