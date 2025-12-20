"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createEventSchema, CreateEventSchema } from "../schema";
import { createEvent, updateEvent } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Hash, Monitor, Eye, Globe } from "lucide-react";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    Layout,
    Type,
    AlignLeft,
    Calendar,
    Clock,
    Image as ImageIcon,
    Radio,
    Save,
    ChevronRight,
    Sparkles
} from "lucide-react";
import { ImageUpload } from "./image-upload";
import { cn } from "@/lib/utils";

interface EventFormProps {
    initialData?: any;
    isEditing?: boolean;
    onSuccess?: () => void;
}

export function EventForm({ initialData, isEditing = false, onSuccess }: EventFormProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const form = useForm<any>({
        resolver: zodResolver(createEventSchema),
        defaultValues: {
            title: initialData?.title || "",
            description: initialData?.description || "",
            startTime: initialData?.startTime || "",
            endTime: initialData?.endTime || "",
            isLive: initialData?.isLive ?? false,
            thumbnailUrl: initialData?.thumbnailUrl || "",
            isShort: initialData?.isShort ?? false,
            hashtags: initialData?.hashtags || "",
            visibility: initialData?.visibility || "public",
        } as CreateEventSchema,
    });

    function onSubmit(values: CreateEventSchema) {
        startTransition(() => {
            const action = isEditing && initialData
                ? updateEvent(initialData.id, values)
                : createEvent(values);

            action
                .then((data) => {
                    if (data.error) {
                        toast.error(data.error);
                    } else {
                        toast.success(isEditing ? "Event updated" : "Event created");
                        if (onSuccess) {
                            onSuccess();
                        } else {
                            router.push("/events");
                        }
                    }
                })
                .catch(() => toast.error("Something went wrong"));
        });
    }

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -10 },
        visible: { opacity: 1, x: 0 }
    };

    return (
        <Form {...form}>
            <motion.form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4 max-w-3xl mx-auto"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
            >
                <div className="space-y-4">
                    <div className="flex flex-col md:flex-row gap-6 items-start">
                        {/* Left Side: Title */}
                        <motion.div
                            variants={itemVariants}
                            className="flex-1 space-y-4 w-full"
                        >
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem className="space-y-1">
                                        <FormLabel className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                            <Type className="h-3.5 w-3.5 text-primary" />
                                            Event Title
                                        </FormLabel>
                                        <FormControl>
                                            <div className="relative group">
                                                <Input
                                                    placeholder="Event title"
                                                    {...field}
                                                    disabled={isPending}
                                                    className="bg-black/5 dark:bg-white/5 border-transparent focus:border-primary/30 h-10 px-4 rounded-xl text-sm transition-all duration-300 group-hover:bg-black/10 dark:group-hover:bg-white/10 focus:bg-background focus:ring-2 focus:ring-primary/20 focus:shadow-[0_0_20px_rgba(var(--primary),0.1)]"
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex flex-wrap items-end gap-3">
                                <FormField
                                    control={form.control}
                                    name="startTime"
                                    render={({ field }) => (
                                        <FormItem className="space-y-1 w-auto">
                                            <FormLabel className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                                <Calendar className="h-3.5 w-3.5 text-primary" />
                                                Start Time
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="datetime-local"
                                                    {...field}
                                                    disabled={isPending}
                                                    className="bg-black/5 dark:bg-white/5 border-transparent focus:border-primary/30 h-10 px-4 rounded-xl text-xs transition-all duration-300 hover:bg-black/10 dark:hover:bg-white/10 focus:bg-background focus:ring-2 focus:ring-primary/20"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="isShort"
                                    render={({ field }) => (
                                        <FormItem className="space-y-1">
                                            <FormLabel className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                                <Monitor className="h-3.5 w-3.5 text-primary" />
                                                Ratio
                                            </FormLabel>
                                            <div className="flex p-0.5 bg-black/5 dark:bg-white/5 rounded-lg w-fit h-10 items-center">
                                                <button
                                                    type="button"
                                                    disabled={isPending}
                                                    onClick={() => field.onChange(false)}
                                                    className={cn(
                                                        "px-4 h-8 rounded-md text-[10px] font-bold transition-all duration-300",
                                                        !field.value
                                                            ? "bg-linear-to-br from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/20 scale-100"
                                                            : "text-muted-foreground hover:text-foreground hover:bg-white/5 scale-95"
                                                    )}
                                                >
                                                    16:9
                                                </button>
                                                <button
                                                    type="button"
                                                    disabled={isPending}
                                                    onClick={() => field.onChange(true)}
                                                    className={cn(
                                                        "px-4 h-8 rounded-md text-[10px] font-bold transition-all duration-300",
                                                        field.value
                                                            ? "bg-linear-to-br from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/20 scale-100"
                                                            : "text-muted-foreground hover:text-foreground hover:bg-white/5 scale-95"
                                                    )}
                                                >
                                                    9:16
                                                </button>
                                            </div>
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </motion.div>

                        {/* Right Side: Thumbnail */}
                        <motion.div variants={itemVariants} className="w-full md:w-[240px]">
                            <FormField
                                control={form.control}
                                name="thumbnailUrl"
                                render={({ field }) => (
                                    <FormItem className="space-y-1">
                                        <FormLabel className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                            <ImageIcon className="h-3.5 w-3.5 text-primary" />
                                            Thumbnail
                                        </FormLabel>
                                        <FormControl>
                                            <ImageUpload
                                                value={field.value ?? ""}
                                                onChange={field.onChange}
                                                disabled={isPending}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </motion.div>
                    </div>

                    <motion.div variants={itemVariants}>
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem className="space-y-1">
                                    <FormLabel className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                        <AlignLeft className="h-3.5 w-3.5 text-primary" />
                                        Description
                                    </FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="What's this about?"
                                            {...field}
                                            disabled={isPending}
                                            className="bg-black/5 dark:bg-white/5 border-transparent focus:border-primary/30 min-h-[120px] rounded-xl px-4 py-3 text-sm resize-none transition-all duration-300 hover:bg-black/10 dark:hover:bg-white/10 focus:bg-background focus:ring-2 focus:ring-primary/20 focus:shadow-[0_0_20px_rgba(var(--primary),0.1)]"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </motion.div>

                    <motion.div variants={itemVariants}>
                        <FormField
                            control={form.control}
                            name="hashtags"
                            render={({ field }) => (
                                <FormItem className="space-y-1">
                                    <FormLabel className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                        <Hash className="h-3.5 w-3.5 text-primary" />
                                        Hashtags
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="#gaming #live #music"
                                            {...field}
                                            disabled={isPending}
                                            className="bg-black/5 dark:bg-white/5 border-transparent focus:border-primary/30 h-10 px-4 rounded-xl text-sm transition-all duration-300 hover:bg-black/10 dark:hover:bg-white/10 focus:bg-background focus:ring-2 focus:ring-primary/20 focus:shadow-[0_0_20px_rgba(var(--primary),0.1)]"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </motion.div>
                </div>

                <motion.div variants={itemVariants}>
                    <div className="flex items-center justify-between pt-4 border-t border-border/50">
                        <FormField
                            control={form.control}
                            name="visibility"
                            render={({ field }) => (
                                <FormItem className="flex items-center gap-3 space-y-0">
                                    <FormLabel className="text-xs font-bold flex items-center gap-1.5 text-muted-foreground">
                                        <Globe className="h-3.5 w-3.5" />
                                        Visibility
                                    </FormLabel>
                                    <Select
                                        disabled={isPending}
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="bg-black/5 dark:bg-white/5 border-transparent h-9 w-[120px] rounded-lg text-xs font-medium hover:bg-black/10 dark:hover:bg-white/10 transition-colors focus:ring-2 focus:ring-primary/20">
                                                <SelectValue placeholder="Visibility" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="public">Public</SelectItem>
                                            <SelectItem value="unlisted">Unlisted</SelectItem>
                                            <SelectItem value="private">Private</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="isLive"
                            render={({ field }) => (
                                <FormItem className="flex items-center gap-3 space-y-0">
                                    <FormLabel className="text-xs font-bold flex items-center gap-1.5 cursor-pointer">
                                        <Radio className={cn("h-3.5 w-3.5", field.value ? "text-red-500 animate-pulse" : "text-muted-foreground")} />
                                        Go Live Now
                                    </FormLabel>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            disabled={isPending}
                                            className="scale-90 data-[state=checked]:bg-red-500 data-[state=checked]:shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-all duration-300"
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </div>
                </motion.div>

                {/* Footer */}
                <motion.div
                    variants={itemVariants}
                    className="flex items-center justify-end gap-3 pt-2"
                >
                    <Button
                        type="submit"
                        disabled={isPending}
                        className="h-10 px-8 font-bold text-sm bg-linear-to-r from-primary to-primary/80 hover:from-primary hover:to-primary shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 rounded-xl"
                    >
                        {isPending ? "..." : (
                            <span className="flex items-center gap-1.5">
                                <Save className="h-3.5 w-3.5" />
                                {isEditing ? "Save Changes" : "Create Event"}
                            </span>
                        )}
                    </Button>
                </motion.div>
            </motion.form>
        </Form>
    );
}
