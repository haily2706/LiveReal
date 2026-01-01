import { Cake, Mic, Users } from "lucide-react";

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
    }
];
