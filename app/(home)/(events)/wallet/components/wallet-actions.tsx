"use client";

import { Card } from "@/components/ui/card";
import { ArrowDownLeft, ArrowUpRight, ArrowRightLeft } from "lucide-react";
import { CashInModal } from "./cash-in/cash-in-modal";
import { CashOutModal } from "./cash-out/cash-out-modal";
import { TransferModal } from "./transfer/transfer-modal";
import { useWalletStore } from "../use-wallet-store";

interface WalletActionsProps {
    onActionSuccess?: () => void;
}

export function WalletActions({ onActionSuccess }: WalletActionsProps) {
    const { fetchBalance } = useWalletStore();

    const handleActionSuccess = () => {
        fetchBalance(true);
        if (onActionSuccess) {
            onActionSuccess();
        }
    };

    return (
        <>
            <CashInModal>
                <Card className="col-span-1 group flex flex-col justify-center items-center p-4 cursor-pointer bg-background hover:bg-muted/30 transition-all duration-300 border-dashed hover:border-solid hover:border-green-500/50 hover:shadow-lg hover:shadow-green-500/10">
                    <div className="h-10 w-10 rounded-full bg-green-500/10 group-hover:scale-110 group-hover:bg-green-500 text-green-500 group-hover:text-white flex items-center justify-center mb-2 transition-all duration-300 shadow-sm">
                        <ArrowDownLeft className="h-5 w-5" />
                    </div>
                    <div className="font-bold text-base group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">Cash In</div>
                    <p className="text-[10px] text-muted-foreground text-center mt-1 group-hover:text-muted-foreground/80">Add funds to your wallet</p>
                </Card>
            </CashInModal>

            <CashOutModal>
                <Card className="col-span-1 group flex flex-col justify-center items-center p-4 cursor-pointer bg-background hover:bg-muted/30 transition-all duration-300 border-dashed hover:border-solid hover:border-red-500/50 hover:shadow-lg hover:shadow-red-500/10">
                    <div className="h-10 w-10 rounded-full bg-red-500/10 group-hover:scale-110 group-hover:bg-red-500 text-red-500 group-hover:text-white flex items-center justify-center mb-2 transition-all duration-300 shadow-sm">
                        <ArrowUpRight className="h-5 w-5" />
                    </div>
                    <div className="font-bold text-base group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">Cash Out</div>
                    <p className="text-[10px] text-muted-foreground text-center mt-1 group-hover:text-muted-foreground/80">Withdraw funds to bank</p>
                </Card>
            </CashOutModal>

            <TransferModal onTransferSuccess={handleActionSuccess}>
                <Card
                    className="col-span-1 group flex flex-col justify-center items-center p-4 cursor-pointer bg-background hover:bg-muted/30 transition-all duration-300 border-dashed hover:border-solid hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10"
                >
                    <div className="h-10 w-10 rounded-full bg-blue-500/10 group-hover:scale-110 group-hover:bg-blue-500 text-blue-500 group-hover:text-white flex items-center justify-center mb-2 transition-all duration-300 shadow-sm">
                        <ArrowRightLeft className="h-5 w-5" />
                    </div>
                    <div className="font-bold text-base group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Transfer</div>
                    <p className="text-[10px] text-muted-foreground text-center mt-1 group-hover:text-muted-foreground/80">Send funds to others</p>
                </Card>
            </TransferModal>
        </>
    );
}
