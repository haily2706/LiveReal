"use server";

import { db } from "@/lib/db";
import { users, cashOuts, cashIns } from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";
import { eq, and, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getAccountBalance } from "@/lib/hedera/client";

export type PaymentMethod = {
    id: string;
    type: string;
    title: string;
    description: string;
    last4: string;
    isDefault?: boolean;
    expiry?: string;
};

export async function updateCashoutPaymentMethod(method: PaymentMethod) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("Unauthorized");
    }

    try {
        await db.update(users)
            .set({
                cashoutPaymentMethod: method,
                updatedAt: new Date(),
            })
            .where(eq(users.id, user.id));

        revalidatePath("/events/wallet");
        return { success: true };
    } catch (error) {
        console.error("Error updating payment method:", error);
        return { success: false, error: "Failed to update payment method" };
    }
}

export async function deleteCashoutPaymentMethod() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("Unauthorized");
    }

    try {
        await db.update(users)
            .set({
                cashoutPaymentMethod: null,
                updatedAt: new Date(),
            })
            .where(eq(users.id, user.id));

        revalidatePath("/events/wallet");
        return { success: true };
    } catch (error) {
        console.error("Error deleting payment method:", error);
        return { success: false, error: "Failed to delete payment method" };
    }
}

export async function getCashoutPaymentMethod() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return null;
    }

    try {
        const userRecord = await db.query.users.findFirst({
            where: eq(users.id, user.id),
            columns: {
                cashoutPaymentMethod: true,
            }
        });

        return userRecord?.cashoutPaymentMethod as PaymentMethod | null;
    } catch (error) {
        console.error("Error fetching payment method:", error);
        return null;
    }
}

export async function requestCashout(amount: number, paymentMethodId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        // 1. Get user details for Hedera account
        const userRecord = await db.query.users.findFirst({
            where: eq(users.id, user.id),
        });

        if (!userRecord || !userRecord.hbarAccountId) {
            return { success: false, error: "Wallet not found" };
        }

        // 2. Check for existing open requests (status = 0)
        const existingRequests = await db.query.cashOuts.findFirst({
            where: and(
                eq(cashOuts.userId, user.id),
                eq(cashOuts.status, 0)
            )
        });

        if (existingRequests) {
            return { success: false, error: "You already have a pending cashout request." };
        }

        // 3. Check user balance
        try {
            const balances = await getAccountBalance(userRecord.hbarAccountId);
            const balance = Number(balances.tokenBalance);

            // Amount requested is in LREAL (base units)
            const amountInLReal = amount;

            if (balance < amountInLReal) {
                return { success: false, error: "Insufficient funds" };
            }

            // 4. Create cashout request
            await db.insert(cashOuts).values({
                id: crypto.randomUUID(),
                userId: user.id,
                amount: amountInLReal.toString(),
                status: 0,
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            return { success: true };

        } catch (error) {
            console.error("Error checking balance:", error);
            return { success: false, error: "Failed to verify balance" };
        }

    } catch (error) {
        console.error("Error requesting cashout:", error);
        return { success: false, error: "Failed to request cashout" };
    }
}

export async function getCashInTransactions() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return [];

    try {
        const transactions = await db.query.cashIns.findMany({
            where: eq(cashIns.userId, user.id),
            orderBy: [desc(cashIns.createdAt)],
            limit: 10,
        });
        return transactions;
    } catch (error) {
        console.error("Error fetching cash in transactions:", error);
        return [];
    }
}

export async function getCashOutTransactions() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return [];

    try {
        const transactions = await db.query.cashOuts.findMany({
            where: eq(cashOuts.userId, user.id),
            orderBy: [desc(cashOuts.createdAt)],
            limit: 10,
        });
        return transactions;
    } catch (error) {
        console.error("Error fetching cash out transactions:", error);
        return [];
    }
}

export async function searchUser(email: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    try {
        const foundUser = await db.query.users.findFirst({
            where: eq(users.email, email),
            columns: {
                id: true,
                name: true,
                email: true,
                avatar: true,
            }
        });

        if (foundUser?.id === user.id) {
            return null; // Cannot transfer to self
        }

        return foundUser || null;
    } catch (error) {
        console.error("Error searching user:", error);
        return null;
    }
}

import { transfers } from "@/lib/db/schema";
import { transferTokenFromUser } from "@/lib/hedera/client";

export async function transferCoins(formData: FormData) {
    const amount = parseFloat(formData.get("amount") as string);
    const recipientId = formData.get("recipientId") as string;

    if (!amount || amount <= 0) {
        return { success: false, error: "Invalid amount" };
    }

    if (!recipientId) {
        return { success: false, error: "Invalid recipient" };
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        // 1. Get sender details (need private key)
        const sender = await db.query.users.findFirst({
            where: eq(users.id, user.id),
        });

        if (!sender || !sender.hbarAccountId || !sender.hbarPrivateKey) {
            return { success: false, error: "Sender wallet not configured" };
        }

        // 2. Get recipient details
        const recipient = await db.query.users.findFirst({
            where: eq(users.id, recipientId),
        });

        if (!recipient || !recipient.hbarAccountId) {
            return { success: false, error: "Recipient wallet not configured" };
        }

        // 3. Check balance
        const balanceData = await getAccountBalance(sender.hbarAccountId);
        const tokenBalance = parseInt(balanceData.tokenBalance); // in base units? NO, getAccountBalance returns string, likely base unit? 
        // Let's check getAccountBalance implementation. 
        // It returns balance.tokens?.get(tokenId)?.toString(). This is base unit (cents).
        // amount is in USD (e.g., 10.50). 
        // Token has 2 decimals (implied by /100 in page.tsx).
        // So amount * 100 = cents.

        const amountInLReal = amount;

        if (tokenBalance < amountInLReal) {
            return { success: false, error: "Insufficient balance" };
        }

        // 4. Execute Hedera Transfer
        try {
            const hederaResult = await transferTokenFromUser(
                sender.hbarAccountId,
                sender.hbarPrivateKey,
                recipient.hbarAccountId,
                amountInLReal
            );

            if (hederaResult.status !== "SUCCESS") {
                return { success: false, error: "Hedera transfer failed" };
            }

            // 5. Record Transaction in DB
            const transferId = crypto.randomUUID();

            // Insert into transfers
            await db.insert(transfers).values({
                id: transferId,
                fromUserId: user.id,
                toUserId: recipientId,
                amount: amountInLReal.toString(),
                status: 'succeeded',
                transaction: {
                    hederaTransactionId: hederaResult.transactionId,
                    amountUSD: amount,
                    fee: 0, // Calculate fee if needed
                    timestamp: new Date().toISOString()
                },
                createdAt: new Date(),
            });

            // Revalidate
            revalidatePath("/events/wallet");

            return { success: true };

        } catch (error: any) {
            console.error("Hedera transfer error:", error);
            return { success: false, error: error.message || "Failed to execute transfer" };
        }

    } catch (error) {
        console.error("Transfer error:", error);
        return { success: false, error: "Internal server error" };
    }
}

export async function getTransfers() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return [];

    try {
        const sentTransfers = await db.query.transfers.findMany({
            where: eq(transfers.fromUserId, user.id),
            orderBy: [desc(transfers.createdAt)],
        });

        const receivedTransfers = await db.query.transfers.findMany({
            where: eq(transfers.toUserId, user.id),
            orderBy: [desc(transfers.createdAt)],
        });

        const allTransfers = [...sentTransfers, ...receivedTransfers].sort((a, b) =>
            new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
        );

        // Fetch user details manually since relations were removed
        const userIds = new Set<string>();
        allTransfers.forEach(tx => {
            if (tx.fromUserId !== user.id) userIds.add(tx.fromUserId);
            if (tx.toUserId !== user.id) userIds.add(tx.toUserId);
        });

        let usersMap: Record<string, any> = {};

        if (userIds.size > 0) {
            const usersList = await db.query.users.findMany({
                where: (users, { inArray }) => inArray(users.id, Array.from(userIds)),
                columns: {
                    id: true,
                    name: true,
                    email: true,
                    avatar: true,
                }
            });

            usersList.forEach(u => {
                usersMap[u.id] = u;
            });
        }

        return allTransfers.map(tx => ({
            ...tx,
            fromUser: tx.fromUserId === user.id ? { id: user.id } : usersMap[tx.fromUserId],
            toUser: tx.toUserId === user.id ? { id: user.id } : usersMap[tx.toUserId]
        }));

    } catch (error) {
        console.error("Error fetching transfers:", error);
        return [];
    }
}

import { getTransactionInfo } from "@/lib/hedera/client";

export async function fetchHederaTransaction(transactionId: string) {
    if (!transactionId) return null;
    return await getTransactionInfo(transactionId);
}
