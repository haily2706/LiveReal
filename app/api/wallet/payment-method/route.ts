import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";


export type PaymentMethod = {
    id: string;
    type: string;
    title: string;
    description: string;
    last4: string;
    isDefault?: boolean;
    expiry?: string;
};

/**
 * @swagger
 * components:
 *   schemas:
 *     PaymentMethod:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         type:
 *           type: string
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         last4:
 *           type: string
 *         isDefault:
 *           type: boolean
 *         expiry:
 *           type: string
 */



/**
 * @swagger
 * /api/wallet/payment-method:
 *   get:
 *     summary: Get payment method
 *     description: Retrieves the user's saved payment method for cashouts.
 *     tags:
 *       - Wallet
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Payment method details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaymentMethod'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to fetch payment method
 */
export async function GET() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    try {
        const userRecord = await db.query.users.findFirst({
            where: eq(users.id, user.id),
            columns: {
                cashoutPaymentMethod: true,
            }
        });

        return NextResponse.json({ success: true, data: userRecord?.cashoutPaymentMethod });
    } catch (error) {
        console.error("Error fetching payment method:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch payment method" }, { status: 500 });
    }
}


/**
 * @swagger
 * /api/wallet/payment-method:
 *   put:
 *     summary: Update payment method
 *     description: Updates or sets the user's payment method for cashouts.
 *     tags:
 *       - Wallet
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PaymentMethod'
 *     responses:
 *       200:
 *         description: Payment method updated successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to update payment method
 */
export async function PUT(req: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    try {
        const method = await req.json();
        await db.update(users)
            .set({
                cashoutPaymentMethod: method,
                updatedAt: new Date(),
            })
            .where(eq(users.id, user.id));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error updating payment method:", error);
        return NextResponse.json({ success: false, error: "Failed to update payment method" }, { status: 500 });
    }
}


/**
 * @swagger
 * /api/wallet/payment-method:
 *   delete:
 *     summary: Delete payment method
 *     description: Removes the user's saved payment method.
 *     tags:
 *       - Wallet
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Payment method deleted successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to delete payment method
 */
export async function DELETE() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    try {
        await db.update(users)
            .set({
                cashoutPaymentMethod: null,
                updatedAt: new Date(),
            })
            .where(eq(users.id, user.id));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting payment method:", error);
        return NextResponse.json({ success: false, error: "Failed to delete payment method" }, { status: 500 });
    }
}
