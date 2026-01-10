"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface ReportModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    eventId?: string; // Optional context
}

export function ReportModal({
    open,
    onOpenChange,
    eventId,
}: ReportModalProps) {
    const [reason, setReason] = useState("");

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!reason) {
            toast.error("Please select a reason for reporting");
            return;
        }

        setIsSubmitting(true);

        // Simulate API call
        try {
            // In a real app, you would send this to your backend
            await new Promise((resolve) => setTimeout(resolve, 1500));

            console.log("Report submitted:", {
                eventId,
                reason,
            });

            toast.success("Report submitted successfully");
            onOpenChange(false);

            // Reset form
            setReason("");

        } catch (error) {
            toast.error("Failed to submit report. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Report Stream</DialogTitle>
                    <DialogDescription>
                        Help us keep the community safe. Your report will be reviewed by our team.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <Label className="text-md font-semibold">Reason</Label>
                    <RadioGroup value={reason} onValueChange={setReason} className="grid gap-4">
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="harassment" id="harassment" />
                            <Label htmlFor="harassment">Harassment or bullying</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="violence" id="violence" />
                            <Label htmlFor="violence">Violence or physical harm</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="adult_content" id="adult_content" />
                            <Label htmlFor="adult_content">Nudity or sexual activity</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="hate_speech" id="hate_speech" />
                            <Label htmlFor="hate_speech">Hate speech or symbols</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="spam" id="spam" />
                            <Label htmlFor="spam">Spam or scams</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="other" id="other" />
                            <Label htmlFor="other">Other</Label>
                        </div>
                    </RadioGroup>


                </div>
                <DialogFooter>
                    <Button
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting || !reason}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Submit Report
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
