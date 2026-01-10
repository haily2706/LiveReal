import { getTransactionInfo } from "@/lib/hedera/client";
import { NextResponse } from "next/server";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    if (!id) {
        return NextResponse.json({ success: false, error: "Transaction ID is required" }, { status: 400 });
    }

    try {
        const data = await getTransactionInfo(id);
        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error("Error fetching Hedera transaction:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch transaction info" }, { status: 500 });
    }
}
