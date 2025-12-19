import { z } from "zod";

export const createEventSchema = z.object({
    title: z.string().min(3, { message: "Title must be at least 3 characters" }),
    description: z.string().optional(),
    startTime: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "Invalid start time",
    }),
    isLive: z.boolean().default(false).optional(),
    thumbnailUrl: z.string().url().optional().or(z.literal("")),
    isShort: z.boolean().default(false),
    hashtags: z.string().optional().or(z.literal("")),
    visibility: z.enum(["public", "private", "unlisted"]).default("public"),
});

export type CreateEventSchema = z.infer<typeof createEventSchema>;
