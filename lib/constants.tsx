import { Cake, Mic, Users, Gamepad2, Sparkles, Zap, Crown } from "lucide-react";

export const EventTypes = [
    {
        name: 'Birthday',
        value: 1,
        color: "bg-linear-to-r from-pink-500 via-rose-500 to-yellow-500",
        icon: Cake
    },
    {
        name: 'Singing',
        value: 2,
        color: "bg-linear-to-r from-cyan-400 via-blue-500 to-purple-500",
        icon: Mic
    },
    {
        name: 'FanMeet',
        value: 3,
        color: "bg-linear-to-r from-orange-500 via-amber-500 to-yellow-400",
        icon: Users
    },
    {
        name: 'Gaming',
        value: 4,
        color: "bg-linear-to-r from-purple-500 via-violet-500 to-indigo-500",
        icon: Gamepad2
    }
];

export const PLANS = [
    {
        id: "free",
        name: "Free",
        icon: Sparkles,
        price: "$0",
        period: "forever",
        description: "Perfect for getting started",
        platformFee: "20%",
        features: [
            "Limited streams",
            "Up to 1k viewers per stream",
            "Basic streaming themes",
            "Standard gift animations",
            "Standard stream quality"
        ],
        cta: "Get Started Free",
        popular: false,
        gradient: "from-gray-500 to-slate-500",
        buttonVariant: "outline" as const,
        color: "blue",
    },
    {
        id: "pro",
        stripeProdId: "prod_TbjaLeHjXqA7Xs",
        name: "Pro",
        icon: Zap,
        price: "$9.99",
        period: "/month",
        description: "For serious streamers",
        platformFee: "10%",
        features: [
            "Unlimited streams",
            "Up to 10k viewers per stream",
            "Pro streaming themes",
            "Pro gift animations",
            "Premium HD stream"
        ],
        cta: "Start Pro Trial",
        popular: true,
        gradient: "from-pink-500 to-purple-500",
        buttonVariant: "default" as const,
        color: "pink",
    },
    {
        id: "creator",
        stripeProdId: "prod_TbjcKCyXxAHoGN",
        name: "Creator",
        icon: Crown,
        price: "$29.99",
        period: "/month",
        description: "Maximum earnings potential",
        platformFee: "5%",
        features: [
            "Unlimited streams",
            "Unlimited viewers per stream",
            "Premium streaming themes",
            "Premium gift animations",
            "Premium HD stream"
        ],
        cta: "Go Creator",
        popular: false,
        gradient: "from-yellow-500 to-orange-500",
        buttonVariant: "outline" as const,
        color: "orange",
    },
];


export const toAvatarURL = (userId?: string) => {
    if (!userId) return undefined;
    const id = userId.split("-viewer-")[0].split(" (via OBS")[0];
    return `https://ujybiburokztfpqtrxcn.supabase.co/storage/v1/object/public/avatars/${id}`;
};