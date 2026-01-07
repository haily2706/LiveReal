import { getTransactionInfo } from "@/lib/hedera/client";
import { NextResponse } from "next/server";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ transactionId: string }> }
) {
    const { transactionId } = await params;

    if (!transactionId) {
        return NextResponse.json({ success: false, error: "Transaction ID is required" }, { status: 400 });
    }

    try {
        const data = await getTransactionInfo(transactionId);
        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error("Error fetching Hedera transaction:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch transaction info" }, { status: 500 });
    }
}
