"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { countries } from "@/lib/countries";
import { Check, ChevronsUpDown, Search } from "lucide-react";

interface PersonalDetailsProps {
    fullName: string;
    setFullName: (value: string) => void;
    country: string;
    setCountry: (value: string) => void;
    bio: string;
    setBio: (value: string) => void;
    loading: boolean;
}

export function PersonalDetails({
    fullName,
    setFullName,
    country,
    setCountry,
    bio,
    setBio,
    loading
}: PersonalDetailsProps) {
    const [isCountryOpen, setIsCountryOpen] = useState(false);
    const [countrySearchQuery, setCountrySearchQuery] = useState("");

    return (
        <div className="text-card-foreground rounded-xl shadow-xs space-y-4">
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
                        <Popover open={isCountryOpen} onOpenChange={setIsCountryOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={isCountryOpen}
                                    className="w-full justify-between font-normal bg-transparent hover:bg-transparent"
                                >
                                    {country
                                        ? countries.find((c) => c.value === country)?.label
                                        : "Select your country"}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                                <div className="flex flex-col">
                                    <div className="flex items-center border-b px-3">
                                        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                                        <input
                                            className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                                            placeholder="Search country..."
                                            onChange={(e) => setCountrySearchQuery(e.target.value)}
                                            value={countrySearchQuery}
                                        />
                                    </div>
                                    <div className="max-h-[300px] overflow-y-auto p-1">
                                        {countries.filter((item) =>
                                            item.label.toLowerCase().includes(countrySearchQuery.toLowerCase())
                                        ).map((c) => (
                                            <div
                                                key={c.value}
                                                className={cn(
                                                    "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                                                    country === c.value && "bg-accent text-accent-foreground"
                                                )}
                                                onClick={() => {
                                                    setCountry(c.value);
                                                    setIsCountryOpen(false);
                                                }}
                                            >
                                                <Check
                                                    className={cn(
                                                        "mr-2 h-4 w-4",
                                                        country === c.value ? "opacity-100" : "opacity-0"
                                                    )}
                                                />
                                                {c.label}
                                            </div>
                                        ))}
                                        {countries.filter((item) =>
                                            item.label.toLowerCase().includes(countrySearchQuery.toLowerCase())
                                        ).length === 0 && (
                                                <p className="p-2 text-sm text-muted-foreground text-center">No country found.</p>
                                            )}
                                    </div>
                                </div>
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
                        className="bg-transparent resize-none h-36"
                    />
                </div>
            </div>
        </div>
    );
}
