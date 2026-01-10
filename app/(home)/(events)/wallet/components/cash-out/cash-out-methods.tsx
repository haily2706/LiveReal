"use client";

import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, CreditCard, Landmark, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";
import { AddCashOutMethodModal } from "./add-cash-out-method-modal";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAuthStore } from "@/components/auth/use-auth-store";
import { useWalletStore, PaymentMethod } from "../../use-wallet-store";

export function CashOutMethods() {
    const { user } = useAuthStore();
    const { paymentMethods, fetchPaymentMethods } = useWalletStore();
    const loading = !paymentMethods && !!user; // Simplified loading state, or rely on store loading?? Store has global loading.
    // Better to use a separate loading state or just rely on whether data is there + user logic.
    // Since fetchPaymentMethods checks if data exists, it won't re-fetch.
    // But initially paymentMethods is [].
    // Let's rely on mounted effect.

    useEffect(() => {
        if (user) {
            fetchPaymentMethods();
        }
    }, [user, fetchPaymentMethods]);

    const handleAddMethod = () => {
        fetchPaymentMethods(true);
    };

    const handleDeleteMethod = async () => {
        try {
            const response = await fetch('/api/wallet/cash-out/cash-out-method', {
                method: 'DELETE'
            });
            const result = await response.json();

            if (result.success) {
                fetchPaymentMethods(true);
                toast.success("Payment method removed");
            } else {
                toast.error("Failed to remove payment method");
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to remove payment method");
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h4 className="text-base font-semibold">Cashout Payment Method</h4>
                    <p className="text-sm text-muted-foreground">Manage bank account for withdrawals</p>
                </div>
            </div>

            <Card className="overflow-hidden border-muted/60">
                <CardContent className="p-0">
                    {false ? ( // We removed internal loading state, maybe we can assume loaded if not empty, or add loading to store specifically for this?
                        // The store 'isLoading' is for balance. We might want to use that or add 'isMethodsLoading'.
                        // For now, let's just render the list. If empty, it shows empty state.
                        // If we want skeleton, we need a loading state. 
                        // Let's use `paymentMethods.length === 0` and maybe a short timeout or just keep it simple.
                        // If we really want skeleton, we need `isLoadingMethods` in store or just assume fast response.
                        // The original code used `loading` state.
                        // Let's verify if `paymentMethods` is populated.
                        // If we want to show skeleton initialy:
                        <div className="divide-y divide-border/50">
                            {[1].map((i) => (
                                <div key={i} className="flex items-center p-4 gap-4">
                                    <Skeleton className="h-12 w-16 rounded-md" />
                                    <div className="flex-1 space-y-2">
                                        <Skeleton className="h-4 w-28" />
                                        <Skeleton className="h-3 w-44" />
                                    </div>
                                    <div className="flex gap-2">
                                        <Skeleton className="h-6 w-6 rounded-md" />
                                        <Skeleton className="h-6 w-6 rounded-md" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : paymentMethods.length === 0 ? (
                        <div className="p-8 flex flex-col items-center gap-4 text-center text-muted-foreground animate-in fade-in-0 slide-in-from-bottom-2 duration-500">
                            <p>No cashout methods added yet.</p>
                            {user && <AddCashOutMethodModal onAddMethod={handleAddMethod}>
                                <Button variant="outline" size="sm" className="h-9 gap-1 rounded-full px-4 hover:border-primary/50 hover:text-primary transition-colors">
                                    <Plus className="h-4 w-4" />
                                    Add New
                                </Button>
                            </AddCashOutMethodModal>
                            }
                        </div>
                    ) : (
                        <div className="divide-y divide-border/50 animate-in fade-in-0 slide-in-from-bottom-2 duration-500">
                            {paymentMethods.map((method) => (
                                <div key={method.id} className="flex items-center p-4 gap-4 hover:bg-muted/10 transition-colors group">
                                    <div className="h-12 w-16 rounded-md bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center border border-border/50 shadow-xs">
                                        {method.type === 'bank' ? (
                                            <Landmark className="h-6 w-6 text-zinc-500" />
                                        ) : (
                                            <CreditCard className="h-6 w-6 text-zinc-500" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-medium flex items-center gap-2">
                                            {method.title}
                                            {method.isDefault && (
                                                <div className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-muted text-muted-foreground uppercase tracking-wider">Default</div>
                                            )}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {method.description}
                                            {method.expiry && ` • Expires ${method.expiry}`}
                                        </div>
                                    </div>
                                    <AddCashOutMethodModal onAddMethod={handleAddMethod} existingMethod={method}>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                    </AddCashOutMethodModal>

                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Delete Payment Method?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Are you sure you want to remove this payment method? This action cannot be undone.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={handleDeleteMethod} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
