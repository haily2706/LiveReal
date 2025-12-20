"use server";

import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { conversations, messages, participants, users } from "@/lib/db/schema";
import { and, desc, eq, or, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function startConversation(targetUserId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("Unauthorized");
    }

    if (user.id === targetUserId) {
        throw new Error("Cannot chat with yourself");
    }

    // Check if conversation already exists
    // intricate query to find a conversation where both users are participants
    const existingConversation = await db
        .select({ id: conversations.id })
        .from(conversations)
        .innerJoin(
            participants,
            eq(conversations.id, participants.conversationId)
        )
        .where(
            and(
                eq(participants.userId, user.id),
                sql`${conversations.id} IN (
                    SELECT conversation_id FROM ${participants} WHERE user_id = ${targetUserId}
                )`
            )
        )
        .limit(1);

    if (existingConversation.length > 0) {
        return { conversationId: existingConversation[0].id };
    }

    // Create new conversation
    const newConversationId = crypto.randomUUID();

    await db.transaction(async (tx) => {
        await tx.insert(conversations).values({
            id: newConversationId,
            isEncrypted: true,
        });

        await tx.insert(participants).values([
            {
                conversationId: newConversationId,
                userId: user.id,
            },
            {
                conversationId: newConversationId,
                userId: targetUserId,
            }
        ]);
    });

    revalidatePath("/messages");
    return { conversationId: newConversationId };
}

export async function getConversations() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return [];
    }

    // specific query to get conversations and the OTHER participant's details
    // We want: conversation info, last message, other user info
    const userConversations = await db.execute(sql`
        SELECT 
            c.id, 
            c.last_message_at,
            u.id as other_user_id,
            u.email as other_user_email,
            u.full_name as other_user_name,
            u.avatar_url as other_user_avatar,
            m.content as last_message_content,
            m.created_at as last_message_time,
            m.sender_id as last_message_sender
        FROM ${conversations} c
        JOIN ${participants} p1 ON c.id = p1.conversation_id AND p1.user_id = ${user.id}
        JOIN ${participants} p2 ON c.id = p2.conversation_id AND p2.user_id != ${user.id}
        JOIN ${users} u ON p2.user_id = u.id
        LEFT JOIN ${messages} m ON c.last_message_at = m.created_at AND c.id = m.conversation_id
        ORDER BY c.last_message_at DESC NULLS FIRST
    `);

    // Drizzle execute returns strict simplified objects, might need mapping if using precise types, 
    // but for now we return the raw result which works for UI props usually if typed on receive.
    // However, let's map it to a cleaner interface if possible or Typescript might complain.

    return userConversations.map((row: any) => ({
        id: row.id,
        lastMessageAt: row.last_message_at ? new Date(row.last_message_at) : new Date(), // Ensure newly created chats float to top
        otherUser: {
            id: row.other_user_id,
            name: row.other_user_name || row.other_user_email?.split('@')[0] || "User",
            avatar: row.other_user_avatar,
        },
        lastMessage: row.last_message_content ? {
            content: row.last_message_content,
            createdAt: new Date(row.last_message_time),
            senderId: row.last_message_sender,
        } : null,
    }));
}

export async function getMessages(conversationId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    // Verify participant
    const isParticipant = await db.query.participants.findFirst({
        where: and(
            eq(participants.conversationId, conversationId),
            eq(participants.userId, user.id)
        )
    });

    if (!isParticipant) throw new Error("Unauthorized access to conversation");

    const chatMessages = await db.query.messages.findMany({
        where: eq(messages.conversationId, conversationId),
        orderBy: [desc(messages.createdAt)], // Get newest first for scrolling usually, or we can reverse on client
        limit: 50, // pagination limit
        with: {
            // we might want sender details if not local
        }
    });

    return chatMessages.reverse(); // Return oldest to newest
}

export async function sendMessage(conversationId: string, content: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    // Verify participant
    const isParticipant = await db.query.participants.findFirst({
        where: and(
            eq(participants.conversationId, conversationId),
            eq(participants.userId, user.id)
        )
    });

    if (!isParticipant) throw new Error("Unauthorized");

    const messageId = crypto.randomUUID();
    const now = new Date();

    await db.transaction(async (tx) => {
        await tx.insert(messages).values({
            id: messageId,
            conversationId,
            senderId: user.id,
            content, // In a real E2EE, this would be encrypted on client. Here we store text (Encryption at Rest handled by DB provider/disk usually, or we could encrypt field here)
            createdAt: now,
        });

        await tx.update(conversations)
            .set({ lastMessageAt: now })
            .where(eq(conversations.id, conversationId));
    });

    revalidatePath(`/messages`);
    revalidatePath(`/messages/${conversationId}`); // if we have dynamic routes
    return { success: true, messageId };
}

export async function searchUsers(query: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return [];
    if (!query || query.length < 2) return [];

    // Find users matching name or email, excluding self
    const listeners = await db.select({
        id: users.id,
        name: users.fullName,
        avatar: users.avatarUrl,
        email: users.email,
    })
        .from(users)
        .where(
            and(
                or(
                    sql`${users.fullName} ILIKE ${`%${query}%`}`,
                    sql`${users.email} ILIKE ${`%${query}%`}`
                ),
                sql`${users.id} != ${user.id}`
            )
        )
        .limit(10);

    return listeners.map(l => ({
        id: l.id,
        name: l.name || l.email.split('@')[0], // Fallback name
        avatar: l.avatar,
    }));
}

export async function getConversationDetails(conversationId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    // Get the other participant
    // We join conversations -> participants -> users
    const details = await db.execute(sql`
        SELECT 
            u.id,
            u.full_name as name,
            u.avatar_url as avatar
        FROM ${participants} p
        JOIN ${users} u ON p.user_id = u.id
        WHERE p.conversation_id = ${conversationId}
        AND p.user_id != ${user.id}
        LIMIT 1
    `);

    if (details.length === 0) {
        return null;
    }

    const otherUser = details[0] as any;

    return {
        id: otherUser.id,
        name: otherUser.name,
        avatar: otherUser.avatar,
    };
}

export async function getCurrentUser() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const dbUser = await db.query.users.findFirst({
        where: eq(users.id, user.id),
        columns: {
            id: true,
            fullName: true,
            avatarUrl: true,
            email: true
        }
    });

    if (!dbUser) return null;

    return {
        id: dbUser.id,
        name: dbUser.fullName || dbUser.email.split('@')[0],
        avatar: dbUser.avatarUrl,
        email: dbUser.email
    };
}
