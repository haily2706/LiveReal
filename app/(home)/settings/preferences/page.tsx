"use client";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useSidebar } from "@/app/(home)/components/provider";
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
            <Separator />

            <div className="space-y-4">
                {/* Theme Setting */}
                <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                        <Label className="text-base">Theme Mode</Label>
                        <p className="text-sm text-muted-foreground">
                            Select your preferred appearance.
                        </p>
                    </div>
                    <Select value={theme} onValueChange={setTheme}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select theme" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="light">Light</SelectItem>
                            <SelectItem value="dark">Dark</SelectItem>
                            <SelectItem value="system">System</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Sidebar Setting */}
                <div className="flex items-center justify-between rounded-lg border p-4">
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
                <div className="flex items-center justify-between rounded-lg border p-4">
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
            </div>
        </div>
    );
}
