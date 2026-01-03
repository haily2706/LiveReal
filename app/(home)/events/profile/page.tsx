"use client";

import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/components/auth/use-auth-store";
import { Button } from "@/components/ui/button";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion } from "framer-motion";

import { ProfileAvatar } from "../components/profile-avatar";
import { PersonalDetails } from "../components/personal-details";
import { updateProfile } from "@/app/actions/user";

export default function ProfilePage() {
    const supabase = createClient();
    const { user, setUser } = useAuthStore();
    const router = useRouter();


    // Profile State
    const [fullName, setFullName] = useState("");
    const [country, setCountry] = useState("");
    const [bio, setBio] = useState("");
    const [avatarUrl, setAvatarUrl] = useState("");

    // UI State
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setFullName(user.user_metadata?.full_name || "");
            setCountry(user.user_metadata?.country || "");
            setBio(user.user_metadata?.bio || "");
            setAvatarUrl(user.user_metadata?.avatar_url || "");
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            onSubmit={handleSubmit}
            className="space-y-8 animate-in fade-in-50 duration-500"
        >
            <div>
                <h3 className="text-lg font-medium">Profile</h3>
                <p className="text-sm text-muted-foreground">
                    Manage your public profile details.
                </p>
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
                    <div className="flex justify-end">
                        <Button
                            type="submit"
                            size="sm"
                            className="w-[130px] font-medium bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all hover:-translate-y-0.5 cursor-pointer"
                            disabled={loading}
                        >
                            {loading ? "Saving..." : "Save Changes"}
                        </Button>
                    </div>
                </div>
            </div>
        </motion.form>
    );
}
