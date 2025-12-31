import { Coins } from "lucide-react";

export const CASH_IN_PLANS = [
    {
        id: "starter_pack",
        name: "Starter Pack",
        icon: Coins,
        price: 5,
        currency: "USD",
        lrealAmount: 500,
        description: "Get started with 500 LREAL",
        color: "blue",
        gradient: "from-blue-500 to-cyan-500",
    },
    {
        id: "pro_pack",
        name: "Pro Pack",
        icon: Coins,
        price: 10,
        currency: "USD",
        lrealAmount: 1000,
        description: "1000 LREAL for serious users",
        popular: true,
        color: "pink",
        gradient: "from-pink-500 to-purple-500",
    },
    {
        id: "ultimate_pack",
        name: "Ultimate Pack",
        icon: Coins,
        price: 50,
        currency: "USD",
        lrealAmount: 5000,
        description: "Best value: 5000 LREAL",
        color: "orange",
        gradient: "from-yellow-500 to-orange-500",
    },
];
