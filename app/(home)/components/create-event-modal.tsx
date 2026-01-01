"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/components/auth/use-auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
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
import { EventTypes } from "@/lib/constants";
import { CalendarIcon, Loader2, Video } from "lucide-react";
import { useRouter } from "next/navigation";

interface CreateEventModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialEventType?: number | null;
}

export function CreateEventModal({ isOpen, onClose, initialEventType }: CreateEventModalProps) {
    const supabase = createClient();
    const { user, setUser } = useAuthStore();
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Form State
    const [eventType, setEventType] = useState<string>("1");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [isShortStream, setIsShortStream] = useState(false);
    const [isBirthdayEnabled, setIsBirthdayEnabled] = useState(false); // Used as visibility toggle
    const [liveStreamDate, setLiveStreamDate] = useState<Date | undefined>();
    const [birthdayTime, setBirthdayTime] = useState("");
    const [thumbnailUrl, setThumbnailUrl] = useState("");

    const thumbnailInputRef = useRef<HTMLInputElement>(null);

    // Initialize/Reset form when opening
    useEffect(() => {
        if (isOpen && user) {
            // Load existing data
            const meta = user.user_metadata || {};
            setTitle(meta.live_stream_title || "");
            setDescription(meta.live_stream_description || "");
            setIsShortStream(meta.is_short_stream || false);
            setThumbnailUrl(meta.thumbnail_url || "");

            // For visibility/published status, we reuse birthday_enabled for now based on previous code logic
            setIsBirthdayEnabled(meta.birthday_enabled || false);

            setBirthdayTime(meta.birthday_time || "");
            if (meta.live_stream_date) {
                setLiveStreamDate(new Date(meta.live_stream_date));
            } else {
                setLiveStreamDate(undefined);
            }

            // Set event type: prefer initial from prop, otherwise fallback to saved
            if (initialEventType) {
                setEventType(initialEventType.toString());
            } else {
                setEventType(meta.event_type?.toString() || "1");
            }
        }
    }, [isOpen, user, initialEventType]);

    const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true);
            if (!e.target.files || e.target.files.length === 0) return;
            if (!user) throw new Error("User not authenticated");

            const file = e.target.files[0];
            const filePath = `thumbnail_${user.id}_${Date.now()}`;

            if (file.size > 2 * 1024 * 1024) throw new Error('File size too large (max 2MB)');

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file, { upsert: true });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);

            setThumbnailUrl(publicUrl);
            toast.success("Thumbnail uploaded successfully");
        } catch (error: any) {
            toast.error(error.message || "Error uploading thumbnail");
        } finally {
            setUploading(false);
            if (thumbnailInputRef.current) thumbnailInputRef.current.value = "";
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase.auth.updateUser({
                data: {
                    live_stream_title: title,
                    live_stream_description: description,
                    event_type: parseInt(eventType),
                    is_short_stream: isShortStream,
                    thumbnail_url: thumbnailUrl,
                    birthday_enabled: isBirthdayEnabled, // visibility
                    live_stream_date: liveStreamDate ? liveStreamDate.toISOString() : null,
                    birthday_time: birthdayTime,
                },
            });

            if (error) throw error;

            if (data.user) {
                setUser(data.user);
                toast.success("Event scheduled successfully");
                router.refresh();
                onClose();
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to schedule event");
        } finally {
            setLoading(false);
        }
    };



    const triggerThumbnailInput = () => {
        thumbnailInputRef.current?.click();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Video className="h-5 w-5" />
                        Upcoming Live Stream
                        {isBirthdayEnabled && <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />}
                    </DialogTitle>
                    <DialogDescription>
                        Schedule your next celebration event.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 pt-2">
                    <div className="grid grid-cols-1 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="streamTitle">Title</Label>
                            <Input
                                id="streamTitle"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Give your stream a catchy title"
                                className="bg-background/50"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="streamDescription">Description</Label>
                            <Textarea
                                id="streamDescription"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="What's your stream about?"
                                className="bg-background/50 resize-none h-20"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label>Event Type</Label>
                            <Select
                                value={eventType}
                                onValueChange={setEventType}
                            >
                                <SelectTrigger className="bg-background/50">
                                    <SelectValue placeholder="Select event type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {EventTypes.map((type) => (
                                        <SelectItem key={type.value} value={type.value.toString()}>
                                            {type.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
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

                        <div className="col-span-1 sm:col-span-2 flex flex-wrap items-end gap-4">
                            <div className="grid gap-2">
                                <Label>Start Date</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-[200px] justify-start text-left font-normal bg-background/50",
                                                !liveStreamDate && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {liveStreamDate ? format(liveStreamDate, "PPP") : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            className="w-[250px]"
                                            selected={liveStreamDate}
                                            onSelect={setLiveStreamDate}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className="grid gap-2">
                                <Label>Start Time</Label>
                                <div className="flex gap-2 w-fit">
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
                                        <SelectTrigger className="w-[70px] bg-background/50">
                                            <SelectValue placeholder="Hr" />
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
                                        <SelectTrigger className="w-[70px] bg-background/50">
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
                                        <SelectTrigger className="w-[70px] bg-background/50">
                                            <SelectValue placeholder="AM" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="AM">AM</SelectItem>
                                            <SelectItem value="PM">PM</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <div className="flex items-center justify-between">
                            <Label>Thumbnail</Label>
                            <div className="flex items-center gap-2">
                                <Label htmlFor="short-stream-switch" className="text-sm text-muted-foreground font-normal cursor-pointer">Short (9:16)</Label>
                                <Switch
                                    id="short-stream-switch"
                                    checked={isShortStream}
                                    onCheckedChange={setIsShortStream}
                                />
                            </div>
                        </div>
                        <div
                            className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 flex flex-col items-center justify-center gap-2 hover:bg-muted/50 transition-colors cursor-pointer text-center h-40 relative overflow-hidden group"
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
                                        <p className="text-xs text-muted-foreground/75">{isShortStream ? "720x1280" : "1280x720"} recommended</p>
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
                            disabled={uploading}
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={loading || uploading}
                        className="bg-primary text-primary-foreground"
                    >
                        {loading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
                        Save & Schedule
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
