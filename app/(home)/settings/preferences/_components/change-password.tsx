"use client";

import { useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Eye, EyeOff, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/components/auth/use-auth-store";

export function ChangePassword() {
    const { user } = useAuthStore();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [passwords, setPasswords] = useState({
        newPassword: "",
        confirmPassword: "",
    });
    const [showNewPassword, setShowNewPassword] = useState(false);

    const supabase = createClient();

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();

        if (passwords.newPassword !== passwords.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        if (passwords.newPassword.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        setLoading(true);

        try {
            const { error } = await supabase.auth.updateUser({
                password: passwords.newPassword,
            });

            if (error) {
                toast.error(error.message);
            } else {
                toast.success("Password updated successfully");
                setOpen(false);
                setPasswords({ newPassword: "", confirmPassword: "" });
            }
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="flex items-center justify-between py-3">
            <div className="space-y-0.5">
                <Label className="text-base">Password</Label>
                <p className="text-sm text-muted-foreground">
                    Change your password to keep your account secure.
                </p>
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline">Change Password</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Change Password</DialogTitle>
                        <DialogDescription>
                            Enter your new password below. Make sure it's secure.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleUpdate} className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="new-password">New Password</Label>
                            <div className="relative">
                                <Input
                                    id="new-password"
                                    type={showNewPassword ? "text" : "password"}
                                    value={passwords.newPassword}
                                    onChange={(e) =>
                                        setPasswords({
                                            ...passwords,
                                            newPassword: e.target.value,
                                        })
                                    }
                                    placeholder="******"
                                    required
                                    className="bg-background border border-slate-200 dark:border-white/10 text-foreground placeholder:text-muted-foreground focus:border-purple-500/50 focus:bg-background focus:ring-1 focus:ring-purple-500/50 transition-all duration-200 pr-10"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-muted-foreground hover:text-foreground"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                >
                                    {showNewPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                    <span className="sr-only">Toggle password visibility</span>
                                </Button>
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="confirm-password">
                                Confirm Password
                            </Label>
                            <div className="relative">
                                <Input
                                    id="confirm-password"
                                    type={showNewPassword ? "text" : "password"}
                                    value={passwords.confirmPassword}
                                    onChange={(e) =>
                                        setPasswords({
                                            ...passwords,
                                            confirmPassword: e.target.value,
                                        })
                                    }
                                    placeholder="******"
                                    required
                                    className="bg-background border border-slate-200 dark:border-white/10 text-foreground placeholder:text-muted-foreground focus:border-purple-500/50 focus:bg-background focus:ring-1 focus:ring-purple-500/50 transition-all duration-200 pr-10"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setOpen(false)}
                                disabled={loading}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Update Password
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
