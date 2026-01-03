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

        revalidatePath("/settings/wallet");
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

        revalidatePath("/settings/wallet");
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

            // Amount requested is in dollars, convert to cents
            const amountInCents = Math.round(amount * 100);

            if (balance < amountInCents) {
                return { success: false, error: "Insufficient funds" };
            }

            // 4. Create cashout request
            await db.insert(cashOuts).values({
                id: crypto.randomUUID(),
                userId: user.id,
                amount: amountInCents.toString(),
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
