"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/components/auth/use-auth-store";
import { useEvents, Event } from "../use-events";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { X, Search, Check } from "lucide-react";
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
import { EventTypes, toAvatarURL } from "@/lib/constants";
import { CalendarIcon, Loader2, Video } from "lucide-react";
import { useRouter } from "next/navigation";

interface CreateEventModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialEventType?: number | null;
    eventToEdit?: Event;
}

export function CreateEventModal({ isOpen, onClose, initialEventType, eventToEdit }: CreateEventModalProps) {
    const supabase = createClient();
    const { user } = useAuthStore();
    const router = useRouter();
    const { createEvent, updateEvent } = useEvents();

    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Form State
    const [eventType, setEventType] = useState<string>("1");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [isShortStream, setIsShortStream] = useState(false);
    const [visibility, setVisibility] = useState<string>("public");
    const [liveStreamDate, setLiveStreamDate] = useState<Date | undefined>();
    const [timeOfDay, setTimeOfDay] = useState("");
    const [thumbnailUrl, setThumbnailUrl] = useState("");

    // Invite State
    const [invitedUsers, setInvitedUsers] = useState<{ id: string; name: string; avatar?: string; email?: string }[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<{ id: string; name: string; avatar?: string; email?: string }[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    const thumbnailInputRef = useRef<HTMLInputElement>(null);

    // Initialize/Reset form when opening
    useEffect(() => {
        if (isOpen) {
            if (eventToEdit) {
                // Edit Mode
                setTitle(eventToEdit.title);
                setDescription(eventToEdit.description || "");
                setIsShortStream(eventToEdit.isShort || false);
                setThumbnailUrl(eventToEdit.thumbnailUrl || "");
                setEventType(eventToEdit.type?.toString() || "1");
                setVisibility(eventToEdit.visibility || "public");
                if (eventToEdit.invitedUsers) {
                    setInvitedUsers(eventToEdit.invitedUsers as any[]);
                } else {
                    setInvitedUsers([]);
                }

                if (eventToEdit.startTime) {
                    const date = new Date(eventToEdit.startTime);
                    setLiveStreamDate(date);
                    setTimeOfDay(format(date, "HH:mm"));
                }
            } else {
                // Create Mode - Reset
                setTitle("");
                setDescription("");
                setIsShortStream(false);
                setThumbnailUrl("");
                setEventType(initialEventType?.toString() || "1");
                setVisibility("public");
                const now = new Date();
                // Round up to next 5 minutes
                const minutes = now.getMinutes();
                const roundedMinutes = (Math.floor(minutes / 5) + 1) * 5;
                now.setMinutes(roundedMinutes);
                now.setSeconds(0);

                setLiveStreamDate(now);
                setTimeOfDay(format(now, "HH:mm"));
                setInvitedUsers([]);
                setSearchQuery("");
                setSearchResults([]);
            }
        }
    }, [isOpen, eventToEdit, initialEventType]);

    // Search Effect
    useEffect(() => {
        const search = async () => {
            if (!searchQuery || searchQuery.length < 2) {
                setSearchResults([]);
                return;
            }

            setIsSearching(true);
            try {
                const response = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}`);
                const result = await response.json();

                if (result.success && result.data) {
                    setSearchResults(result.data as any[]);
                }
            } catch (error) {
                console.error("Search error", error);
            } finally {
                setIsSearching(false);
            }
        };

        const timer = setTimeout(search, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

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
            // Construct start time date object
            let finalDate = liveStreamDate;
            if (finalDate && timeOfDay) {
                const [h, m] = timeOfDay.split(":");
                finalDate.setHours(parseInt(h), parseInt(m), 0, 0);
            }

            const eventData = {
                title,
                description,
                eventType: parseInt(eventType),
                isShort: isShortStream,
                thumbnailUrl,
                visibility,
                startTime: finalDate,
                invitedUsers: visibility === 'invited' ? invitedUsers.map(u => ({ id: u.id, name: u.name || u.email || "Unknown" })) : undefined
            };

            let result;

            if (eventToEdit) {
                result = await updateEvent(eventToEdit.id, eventData);
            } else {
                result = await createEvent(eventData);
            }

            if (!result.success) throw new Error(result.error);

            toast.success(eventToEdit ? "Event updated successfully" : "Event scheduled successfully");
            router.push("/events/list");
            onClose();
        } catch (error: any) {
            toast.error(error.message || "Failed to save event");
        } finally {
            setLoading(false);
        }
    };



    const triggerThumbnailInput = () => {
        thumbnailInputRef.current?.click();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {(() => {
                            const selectedType = EventTypes.find(t => t.value.toString() === eventType);
                            const HeaderIcon = selectedType?.icon || Video;
                            const typeName = selectedType?.name || "Live Stream";
                            return (
                                <>
                                    <HeaderIcon className="h-5 w-5" />
                                    {eventToEdit ? "Edit" : "Upcoming"} {typeName}
                                </>
                            );
                        })()}
                        {visibility === "public" && <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />}
                    </DialogTitle>
                    <DialogDescription>
                        Schedule your next event.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 pt-2">
                    {!initialEventType && !eventToEdit && (
                        <div className="grid gap-2">
                            <Label>Event Type</Label>
                            <Select
                                value={eventType}
                                onValueChange={(v) => {
                                    setEventType(v);
                                    setVisibility('public');
                                }}
                            >
                                <SelectTrigger className="bg-background/50">
                                    <SelectValue placeholder="Select event type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {EventTypes.filter(t => t.value !== 5).map((type) => (
                                        <SelectItem key={type.value} value={type.value.toString()}>
                                            <div className="flex items-center gap-2">
                                                <type.icon className="h-4 w-4" />
                                                {type.name}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                    {true && (
                        <div className="flex flex-col md:flex-row gap-6">
                            <div className="flex-1 flex flex-col gap-4">
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
                                <div className="flex flex-col gap-2 flex-1">
                                    <Label htmlFor="streamDescription">Description</Label>
                                    <Textarea
                                        id="streamDescription"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="What's your stream about?"
                                        className="bg-background/50 resize-none flex-1 min-h-[100px]"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-2 shrink-0">
                                <div className="flex items-center justify-between">
                                    <Label>Thumbnail</Label>
                                    <div className="flex items-center">
                                        <Label htmlFor="short-stream-switch" className="text-xs text-muted-foreground font-normal cursor-pointer">9:16</Label>
                                        <Switch
                                            id="short-stream-switch"
                                            checked={isShortStream}
                                            onCheckedChange={setIsShortStream}
                                            className="scale-75 origin-right"
                                        />
                                    </div>
                                </div>
                                <div
                                    className={cn(
                                        "border-2 border-dashed border-muted-foreground/25 rounded-lg flex flex-col items-center justify-center gap-2 hover:bg-muted/50 transition-all cursor-pointer text-center relative overflow-hidden group bg-muted/10",
                                    )}
                                    style={{
                                        width: isShortStream ? "140px" : "240px",
                                        aspectRatio: isShortStream ? "9/16" : "16/9"
                                    }}
                                    onClick={triggerThumbnailInput}
                                >
                                    {thumbnailUrl ? (
                                        <>
                                            <img src={thumbnailUrl} alt="Thumbnail" className="absolute inset-0 w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <p className="text-white text-xs font-medium">Change</p>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="p-2 bg-secondary rounded-full">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>
                                            </div>
                                            <div className="space-y-1 px-2">
                                                <p className="text-xs font-medium text-muted-foreground">Upload</p>
                                                <p className="text-[10px] text-muted-foreground/75">{isShortStream ? "720x1280" : "1280x720"}</p>
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
                    )}

                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col sm:flex-row gap-4">


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
                                            if (!timeOfDay) return "12";
                                            const [h] = timeOfDay.split(":");
                                            let hour = parseInt(h);
                                            if (hour === 0) return "12";
                                            if (hour > 12) return (hour - 12).toString();
                                            return hour.toString();
                                        })()}
                                        onValueChange={(v) => {
                                            const [h, m] = (timeOfDay || "12:00").split(":");
                                            const oldHour = parseInt(h);
                                            const isPM = oldHour >= 12;
                                            let newHour = parseInt(v);
                                            if (isPM && newHour !== 12) newHour += 12;
                                            if (!isPM && newHour === 12) newHour = 0;
                                            setTimeOfDay(`${newHour.toString().padStart(2, '0')}:${m}`);
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
                                        value={timeOfDay ? timeOfDay.split(":")[1] : "00"}
                                        onValueChange={(v) => {
                                            const [h] = (timeOfDay || "12:00").split(":");
                                            setTimeOfDay(`${h}:${v}`);
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
                                            if (!timeOfDay) return "AM";
                                            const [h] = timeOfDay.split(":");
                                            return parseInt(h) >= 12 ? "PM" : "AM";
                                        })()}
                                        onValueChange={(v) => {
                                            const [h, m] = (timeOfDay || "12:00").split(":");
                                            let hour = parseInt(h);
                                            if (v === "PM" && hour < 12) hour += 12;
                                            if (v === "AM" && hour >= 12) hour -= 12;
                                            setTimeOfDay(`${hour.toString().padStart(2, '0')}:${m}`);
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

                        <div className="grid gap-2">
                            <Label>Visibility</Label>
                            <Select
                                value={visibility}
                                onValueChange={setVisibility}
                            >
                                <SelectTrigger className="bg-background/50">
                                    <SelectValue placeholder="Select visibility" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="public">Public (Everyone)</SelectItem>
                                    <SelectItem value="private">Private (Only You)</SelectItem>
                                    <SelectItem value="invited">Invited</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {visibility === "invited" && (
                            <div className="flex flex-col gap-2">
                                <Label>Invited People</Label>
                                <div className="flex flex-col gap-3">
                                    <div className="relative">
                                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Search by name or email..."
                                            className="pl-9 bg-background/50"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                        {searchResults.length > 0 && (
                                            <div className="absolute z-10 mt-1 w-full bg-popover text-popover-foreground rounded-md border shadow-md max-h-[200px] overflow-auto">
                                                {searchResults.map((user) => {
                                                    const isInvited = invitedUsers.some(u => u.id === user.id);
                                                    return (
                                                        <div
                                                            key={user.id}
                                                            className={cn(
                                                                "flex items-center gap-2 p-2 cursor-pointer hover:bg-accent hover:text-accent-foreground",
                                                                isInvited && "opacity-50 cursor-not-allowed"
                                                            )}
                                                            onClick={() => {
                                                                if (!isInvited) {
                                                                    setInvitedUsers([...invitedUsers, user]);
                                                                    setSearchQuery("");
                                                                    setSearchResults([]);
                                                                }
                                                            }}
                                                        >
                                                            <Avatar className="h-6 w-6">
                                                                <AvatarImage src={toAvatarURL(user.id)} />
                                                                <AvatarFallback>{user.name?.[0] || user.email?.[0]}</AvatarFallback>
                                                            </Avatar>
                                                            <div className="flex-1 text-sm">
                                                                <p className="font-medium leading-none">{user.name || "Unknown"}</p>
                                                                <p className="text-xs text-muted-foreground">{user.email}</p>
                                                            </div>
                                                            {isInvited && <Check className="h-4 w-4 text-green-500" />}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>

                                    {invitedUsers.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {invitedUsers.map((user) => (
                                                <div key={user.id} className="flex items-center gap-1 bg-secondary text-secondary-foreground px-2 py-1 rounded-full text-xs box-border border border-transparent">
                                                    <Avatar className="h-4 w-4">
                                                        <AvatarImage src={toAvatarURL(user.id)} />
                                                        <AvatarFallback className="text-[10px]">{user.name?.[0] || "?"}</AvatarFallback>
                                                    </Avatar>
                                                    <span className="max-w-[100px] truncate">{user.name || user.email}</span>
                                                    <button
                                                        onClick={() => setInvitedUsers(invitedUsers.filter(u => u.id !== user.id))}
                                                        className="hover:bg-destructive/10 hover:text-destructive rounded-full p-0.5 transition-colors"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}


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
        </Dialog >
    );
}
