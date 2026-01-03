"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import axios from "axios";
import { Check, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PLANS } from "@/lib/constants";
import { PlanId } from "@/lib/types";

interface SubscriptionViewProps {
    subscription: any;
    planIdFromUrl?: string; // Add this
}

export const SubscriptionView = ({ subscription, planIdFromUrl }: SubscriptionViewProps) => {
    const [loading, setLoading] = useState(false);

    // Determine the effective plan ID, prioritizing the one from URL/success redirect
    let currentPlanId = subscription?.planId ?? PlanId.FREE;

    if (planIdFromUrl && PLANS.some(p => p.id === planIdFromUrl)) {
        currentPlanId = planIdFromUrl;
    }

    // Find current plan details
    const currentPlan = PLANS.find(tier => tier.id === currentPlanId) || PLANS[0];

    useEffect(() => {
        if (planIdFromUrl) {
            toast.success("Subscription updated successfully!");
        }
    }, [planIdFromUrl]);

    const onSubscribe = async (planId: string) => {
        try {
            setLoading(true);
            const response = await axios.post("/api/payments/stripe/subscribe", {
                planId
            });

            window.location.href = response.data.url;
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const onManage = async () => {
        try {
            setLoading(true);
            const response = await axios.post("/api/payments/stripe/portal");

            window.location.href = response.data.url;
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const onCancel = async () => {
        try {
            setLoading(true);
            await axios.post("/api/payments/stripe/cancel");
            toast.success("Subscription canceled successfully at period end");
            // Optional: trigger a re-fetch or reload
            window.location.reload();
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Current Plan Section */}
            <div className="space-y-4">
                <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    Current Plan
                </h4>
                <div className={cn(
                    "relative rounded-xl p-6 bg-linear-to-r overflow-hidden",
                    currentPlanId === "free" && "from-blue-500/5 to-cyan-500/5",
                    currentPlanId === "pro" && "from-pink-500/5 to-purple-500/5",
                    currentPlanId === "creator" && "from-yellow-500/5 to-orange-500/5"
                )}>
                    <div className="flex flex-col sm:flex-row justify-between gap-4 relative z-10">
                        <div className="space-y-3">
                            <div className="flex items-center gap-x-3">
                                <div className={cn("p-2 rounded-lg bg-primary/10")}>
                                    <currentPlan.icon className={cn("h-5 w-5", `text-${currentPlan.color}-500`)} />
                                </div>
                                <h2 className="text-2xl font-bold">{currentPlan.name}</h2>
                                <span className={cn(
                                    "px-2.5 py-0.5 rounded-full text-white text-[10px] font-bold uppercase tracking-wide",
                                    currentPlanId === "free" && "bg-blue-500",
                                    currentPlanId === "pro" && "bg-pink-500",
                                    currentPlanId === "creator" && "bg-orange-500"
                                )}>
                                    Active
                                </span>
                            </div>
                            <p className="text-muted-foreground text-sm">
                                You are currently on the {currentPlan.name.toLowerCase()} plan.
                            </p>
                            <div>
                                <div className="flex items-baseline gap-x-1">
                                    <span className="text-2xl font-bold">{currentPlan.price}</span>
                                    <span className="text-sm text-muted-foreground">{currentPlan.period}</span>
                                </div>
                                {subscription?.stripeCurrentPeriodEnd && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Renews on {new Date(subscription.stripeCurrentPeriodEnd).toLocaleDateString()}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col items-end gap-2 justify-center">
                            <div className="flex items-center gap-2">
                                {currentPlanId !== PlanId.FREE && (
                                    <Button
                                        onClick={onManage}
                                        disabled={loading}
                                        variant="outline"
                                        size="sm"
                                        className="h-8 text-xs"
                                    >
                                        Manage
                                    </Button>
                                )}
                                {subscription?.status === 'active' && !subscription?.cancelAtPeriodEnd && currentPlanId !== PlanId.FREE && (
                                    <Button
                                        onClick={onCancel}
                                        disabled={loading}
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 text-xs text-red-500 hover:text-red-600 hover:bg-red-50"
                                    >
                                        Cancel
                                    </Button>
                                )}
                            </div>
                            {subscription?.cancelAtPeriodEnd && currentPlanId !== PlanId.FREE && (
                                <p className="text-xs text-right text-amber-600 font-medium">
                                    Cancels on {new Date(subscription.stripeCurrentPeriodEnd).toLocaleDateString()}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Decorative Icon */}
                    <div className="absolute -top-2 -right-2 opacity-10 sm:opacity-100 sm:top-6 sm:right-6">
                        <div className={cn(
                            "rounded-xl p-2",
                            currentPlanId === "free" && "bg-blue-500",
                            currentPlanId === "pro" && "bg-pink-500",
                            currentPlanId === "creator" && "bg-orange-500"
                        )}>
                            <currentPlan.icon className="h-5 w-5 text-white" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Available Plans Section */}
            <div className="space-y-4">
                <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    Available Plans
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {PLANS.map((tier) => {
                        const isCurrentPlan = tier.id === currentPlanId;
                        const isPopular = tier.popular;

                        return (
                            <div
                                key={tier.id}
                                className={cn(
                                    "border rounded-xl p-6 flex flex-col space-y-4 relative bg-card h-full",
                                    isPopular && "border-primary/50"
                                )}
                            >
                                {isPopular && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-linear-to-r from-pink-500 to-purple-500 rounded-full text-white text-xs font-bold shadow-sm">
                                        Most Popular
                                    </div>
                                )}
                                <div className="space-y-2">
                                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                                        <tier.icon className={cn("h-6 w-6", `text-${tier.color}-500`)} />
                                    </div>
                                    <h4 className="text-xl font-bold">
                                        {tier.name}
                                    </h4>
                                    <div className="flex items-baseline gap-x-1">
                                        <span className="text-2xl font-bold">{tier.price}</span>
                                        <span className="text-sm text-muted-foreground">{tier.period}</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        {tier.description}
                                    </p>
                                </div>

                                <div className="space-y-3 pt-4 flex-1">
                                    {tier.features.slice(0, 4).map((feature) => ( // Show first 4 features as per design
                                        <div key={feature} className="flex items-start gap-x-3">
                                            <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                                            <span className="text-sm text-muted-foreground">{feature}</span>
                                        </div>
                                    ))}
                                    {tier.features.length > 4 && (
                                        <div className="text-xs text-muted-foreground pl-7">
                                            + {tier.features.length - 4} more features
                                        </div>
                                    )}
                                </div>
                                <div className="pt-4">
                                    {isCurrentPlan ? (
                                        <Button
                                            disabled
                                            className="w-full bg-muted/50 text-muted-foreground hover:bg-muted/50 border-0"
                                            variant="ghost"
                                        >
                                            Current Plan
                                        </Button>
                                    ) : (
                                        <Button
                                            onClick={() => tier.id === "free" ? {} : onSubscribe(tier.id)} // Free plan can't calculate checkout usually if distinct
                                            disabled={loading}
                                            className={cn(
                                                "w-full text-white border-0",
                                                tier.gradient ? `bg-linear-to-r ${tier.gradient}` : "bg-primary"
                                            )}
                                        >
                                            Upgrade
                                        </Button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
