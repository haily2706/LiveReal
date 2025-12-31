"use client";

import { useState } from "react";
import { Loader2, Landmark } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AddPaymentMethodModalProps {
    children: React.ReactNode;
    onAddMethod: (method: any) => void;
}

export function AddPaymentMethodModal({ children, onAddMethod }: AddPaymentMethodModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Form states
    const [formData, setFormData] = useState({
        accountName: "",
        accountNumber: "",
        bankName: "",
        routingNumber: "",
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1500));

            const newMethod = {
                id: Math.random().toString(36).substr(2, 9),
                type: 'bank',
                title: formData.bankName,
                description: `Checking ending in ${formData.accountNumber.slice(-4)}`,
                last4: formData.accountNumber.slice(-4),
                isDefault: false,
            };

            onAddMethod(newMethod);
            toast.success("Payment method added successfully");
            setIsOpen(false);

            // Reset form
            setFormData({
                accountName: "",
                accountNumber: "",
                bankName: "",
                routingNumber: "",
            });
        } catch (error) {
            console.error(error);
            toast.error("Failed to add payment method");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-2xl">
                        <Landmark className="h-6 w-6 text-primary" />
                        Add Cashout Method
                    </DialogTitle>
                    <DialogDescription>
                        Link a new bank account to withdraw your earnings efficiently.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label htmlFor="accountName">Account Holder Name</Label>
                        <Input
                            id="accountName"
                            name="accountName"
                            placeholder="John Doe"
                            value={formData.accountName}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="bankName">Bank Name</Label>
                        <Input
                            id="bankName"
                            name="bankName"
                            placeholder="Bank Name"
                            value={formData.bankName}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="routingNumber">Routing Number</Label>
                            <Input
                                id="routingNumber"
                                name="routingNumber"
                                placeholder="000000000"
                                value={formData.routingNumber}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="accountNumber">Account Number</Label>
                            <Input
                                id="accountNumber"
                                name="accountNumber"
                                placeholder="0000000000"
                                value={formData.accountNumber}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                    </div>

                    <DialogFooter className="pt-4">
                        <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Add Method
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
