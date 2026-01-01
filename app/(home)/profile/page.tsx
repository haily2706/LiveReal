"use client";

import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/components/auth/use-auth-store";
import { useSidebar } from "@/app/(home)/components/provider";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion } from "framer-motion";

import { CreateEventModal } from "../components/create-event-modal";
import { ProfileAvatar } from "./components/profile-avatar";
import { PersonalDetails } from "./components/personal-details";
import { UpcomingEvent } from "./components/upcoming-event";
import { MyEvents } from "./components/my-events";
import { updateProfile } from "@/app/actions/user";

export default function ProfilePage() {
    const supabase = createClient();
    const { user, setUser } = useAuthStore();
    const router = useRouter();
    const { isCollapsed } = useSidebar();

    // Profile State
    const [fullName, setFullName] = useState("");
    const [country, setCountry] = useState("");
    const [bio, setBio] = useState("");
    const [avatarUrl, setAvatarUrl] = useState("");
    const [thumbnailUrl, setThumbnailUrl] = useState("");

    // Event & Birthday State
    const [isBirthdayEnabled, setIsBirthdayEnabled] = useState(false);
    const [birthdayTime, setBirthdayTime] = useState("");
    const [birthdayDate, setBirthdayDate] = useState<Date | undefined>();
    const [liveStreamDate, setLiveStreamDate] = useState<Date | undefined>();
    const [eventType, setEventType] = useState<string>("1");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [isShortStream, setIsShortStream] = useState(false);

    // UI State
    const [loading, setLoading] = useState(false);
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);

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

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setLoading(true);

        try {
            // Update Supabase Auth Metadata
            const { data, error } = await supabase.auth.updateUser({
                data: {
                    full_name: fullName,
                    country: country,
                    bio: bio,
                    avatar_url: avatarUrl,
                },
            });

            if (error) throw error;

            // Update Postgres DB
            const result = await updateProfile({
                name: fullName,
                location: country,
                bio,
                avatar: avatarUrl,
            });

            if (!result.success) {
                throw new Error("Failed to update database profile");
            }

            if (data.user) {
                setUser(data.user);
                toast.success("Profile updated successfully");
                router.refresh();
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to update profile");
        } finally {
            setLoading(false);
        }
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
                <ProfileAvatar
                    user={user}
                    fullName={fullName}
                    country={country}
                    avatarUrl={avatarUrl}
                    setAvatarUrl={setAvatarUrl}
                    setUser={setUser}
                />

                {/* Right Column: Details */}
                <div className="flex-1 space-y-6 flex flex-col gap-8">
                    <PersonalDetails
                        fullName={fullName}
                        setFullName={setFullName}
                        country={country}
                        setCountry={setCountry}
                        bio={bio}
                        setBio={setBio}
                        loading={loading}
                    />

                    <UpcomingEvent
                        title={title}
                        description={description}
                        thumbnailUrl={thumbnailUrl}
                        isShortStream={isShortStream}
                        liveStreamDate={liveStreamDate}
                        birthdayTime={birthdayTime}
                        isBirthdayEnabled={isBirthdayEnabled}
                        eventType={eventType}
                        onOpenModal={() => setIsEventModalOpen(true)}
                    />

                    <CreateEventModal
                        isOpen={isEventModalOpen}
                        onClose={() => setIsEventModalOpen(false)}
                    />

                    <MyEvents />
                </div>
            </div>
        </motion.form>
    );
}
