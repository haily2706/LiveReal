"use client";

import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useSidebar } from "@/app/(home)/components/provider";
import { ChangePassword } from "./_components/change-password";
import { DeleteAccount } from "./_components/delete-account";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function PreferencesPage() {
    const {
        showPremiumBalance,
        togglePremiumBalance,
        isCollapsed,
        toggleSidebar
    } = useSidebar();
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Prevent hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null;
    }

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Preferences</h3>
                <p className="text-sm text-muted-foreground">
                    Customize your experience.
                </p>
            </div>

            <div>
                {/* Theme Setting */}
                <div className="flex items-center justify-between py-3">
                    <div className="space-y-0.5">
                        <Label className="text-base">Dark Mode</Label>
                        <p className="text-sm text-muted-foreground">
                            Toggle dark mode appearance.
                        </p>
                    </div>
                    <Switch
                        checked={theme === "dark"}
                        onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                    />
                </div>


                {/* Sidebar Setting */}
                <div className="flex items-center justify-between py-3">
                    <div className="space-y-0.5">
                        <Label className="text-base">Sidebar View</Label>
                        <p className="text-sm text-muted-foreground">
                            Collapse the sidebar for more screen space.
                        </p>
                    </div>
                    <Switch
                        checked={isCollapsed}
                        onCheckedChange={toggleSidebar}
                    />
                </div>


                {/* Premium Balance Setting */}
                <div className="flex items-center justify-between py-3">
                    <div className="space-y-0.5">
                        <Label className="text-base">Premium Balance</Label>
                        <p className="text-sm text-muted-foreground">
                            Show your premium coin balance card in the sidebar.
                        </p>
                    </div>
                    <Switch
                        checked={showPremiumBalance}
                        onCheckedChange={togglePremiumBalance}
                    />
                </div>

                {/* Password Setting */}
                <ChangePassword />

                {/* Delete Account */}
                <DeleteAccount />
            </div>
        </div>
    );
}
