import { getSubscription } from "@/app/api/subcriptions/get-subscription";
import { createClient } from "@/lib/supabase/server";
import { SubscriptionView } from "./components/subscription-view";
import { redirect } from "next/navigation";


interface SubscriptionPageProps {
    searchParams: Promise<{
        planId?: string;
    }>
}

export default async function SubscriptionPage({ searchParams }: SubscriptionPageProps) {
    const { planId } = await searchParams;
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/");
    }

    const subscription = await getSubscription(user.id);

    return (
        <div className="h-full flex flex-col space-y-4">
            <h3 className="text-2xl font-bold">Subscriptions</h3>
            <p className="text-muted-foreground">
                Manage your subscription plan and billing details.
            </p>
            <SubscriptionView
                subscription={subscription}
                planIdFromUrl={planId}
            />
        </div>
    );
}
