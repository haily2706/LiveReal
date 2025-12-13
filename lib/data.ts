
export interface User {
    id: string;
    name: string;
    username: string;
    avatar: string;
    bio?: string;
    birthday?: string; // ISO date string YYYY-MM-DD
    isFollowing?: boolean;
}

export interface Post {
    id: string;
    user: User;
    content: string;
    image?: string;
    likes: number;
    comments: number;
    createdAt: string;
}

export const currentUser: User = {
    id: "u1",
    name: "Alex Doe",
    username: "@alexdoe",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
    bio: "Birthday enthusiast! 🎂 | Streamer 🎥",
    birthday: "1995-08-15",
};

export const followers: User[] = [
    {
        id: "u2",
        name: "Sarah Smith",
        username: "@sarah_s",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
        birthday: "1998-12-15", // Upcoming soon (example)
        isFollowing: true,
    },
    {
        id: "u3",
        name: "Mike Johnson",
        username: "@mikej",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike",
        birthday: "1992-12-20", // Upcoming
        isFollowing: true,
    },
    {
        id: "u4",
        name: "Emily Davis",
        username: "@emilyd",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emily",
        birthday: "2000-01-05", // Next month
        isFollowing: true,
    },
    {
        id: "u5",
        name: "Chris Wilson",
        username: "@chrisw",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Chris",
        birthday: "1990-06-10",
        isFollowing: true,
    },
];

export const exploreItems: Post[] = [
    {
        id: "p1",
        user: followers[0], // Sarah
        content: "Just streamed my 25th birthday! Thanks for all the gifts! 🎁✨",
        image: "https://images.unsplash.com/photo-1530103862676-de3c9a59af38?q=80&w=2600&auto=format&fit=crop",
        likes: 124,
        comments: 18,
        createdAt: "2023-12-10T14:00:00Z",
    },
    {
        id: "p2",
        user: followers[1], // Mike
        content: "Getting ready for the big bash next week! Who's tuning in? 🕺💃",
        likes: 89,
        comments: 12,
        createdAt: "2023-12-11T09:30:00Z",
    },
    {
        id: "p3",
        user: {
            id: "u6",
            name: "Jessica Lee",
            username: "@jessicalee",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jessica",
            isFollowing: false,
        },
        content: "Best birthday surprise ever! 🎈🎂",
        image: "https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=2670&auto=format&fit=crop",
        likes: 456,
        comments: 42,
        createdAt: "2023-12-12T10:15:00Z",
    },
];

export interface Video {
    id: string;
    title: string;
    thumbnail: string;
    channel: User;
    views: string;
    postedAt: string;
    duration: string;
}

export interface Short {
    id: string;
    title: string;
    thumbnail: string;
    views: string;
}

export interface LiveStream {
    id: string;
    title: string;
    thumbnail: string;
    channel: User;
    viewers: number;
    isBirthday: boolean;
}

export const recommendedVideos: Video[] = [
    {
        id: "v1",
        title: "Building a YouTube Clone in Next.js",
        thumbnail: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=2672&auto=format&fit=crop",
        channel: followers[0], // Sarah
        views: "125K",
        postedAt: "2 days ago",
        duration: "14:20",
    },
    {
        id: "v2",
        title: "My 25th Birthday Celebration Highlights! 🎉",
        thumbnail: "https://images.unsplash.com/photo-1530103862676-de3c9a59af38?q=80&w=2600&auto=format&fit=crop",
        channel: followers[0], // Sarah
        views: "54K",
        postedAt: "5 hours ago",
        duration: "8:45",
    },
    {
        id: "v3",
        title: "Top 10 Coding Tips for Beginners",
        thumbnail: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=2670&auto=format&fit=crop",
        channel: followers[1], // Mike
        views: "892K",
        postedAt: "1 year ago",
        duration: "12:30",
    },
    {
        id: "v4",
        title: "Unboxing my new setup 🖥️",
        thumbnail: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?q=80&w=2642&auto=format&fit=crop",
        channel: followers[2], // Emily
        views: "34K",
        postedAt: "3 weeks ago",
        duration: "10:15",
    },
    {
        id: "v5",
        title: "Vlog: A Day in the Life",
        thumbnail: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2671&auto=format&fit=crop",
        channel: followers[3], // Chris
        views: "1.2M",
        postedAt: "4 months ago",
        duration: "18:00",
    },
    {
        id: "v6",
        title: "How to bake a perfect cake 🎂",
        thumbnail: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=2589&auto=format&fit=crop",
        channel: followers[0],
        views: "450K",
        postedAt: "1 month ago",
        duration: "15:45",
    },
    {
        id: "v7",
        title: "React vs Vue - Which one to choose?",
        thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=2670&auto=format&fit=crop",
        channel: followers[1],
        views: "210K",
        postedAt: "2 months ago",
        duration: "22:10",
    },
    {
        id: "v8",
        title: "Travel Vlog: Japan 🇯🇵",
        thumbnail: "https://images.unsplash.com/photo-1493976040375-85c17d3b253c?q=80&w=2670&auto=format&fit=crop",
        channel: followers[2],
        views: "3.5M",
        postedAt: "6 months ago",
        duration: "25:00",
    }
];

export const trendingShorts: Short[] = [
    {
        id: "s1",
        title: "Birthday Prank! 😂",
        thumbnail: "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?q=80&w=1740&auto=format&fit=crop",
        views: "1.2M",
    },
    {
        id: "s2",
        title: "Quick Coding Tip 👨‍💻",
        thumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1740&auto=format&fit=crop",
        views: "500K",
    },
    {
        id: "s3",
        title: "Satisfying Cake Cutting 🍰",
        thumbnail: "https://images.unsplash.com/photo-1541781777621-af130545f653?q=80&w=1740&auto=format&fit=crop",
        views: "2.3M",
    },
    {
        id: "s4",
        title: "Cute Puppy 🐶",
        thumbnail: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=1548&auto=format&fit=crop",
        views: "5.6M",
    },
    {
        id: "s5",
        title: "Dance Challenge 💃",
        thumbnail: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1638&auto=format&fit=crop",
        views: "890K",
    },
    {
        id: "s6",
        title: "DIY Gift Idea 🎁",
        thumbnail: "https://images.unsplash.com/photo-1513885535751-8b9238bd345a?q=80&w=1740&auto=format&fit=crop",
        views: "340K",
    }
];

export const birthdayLives: LiveStream[] = [
    {
        id: "l2",
        title: "Chilling and Coding on my Birthday",
        thumbnail: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2670&auto=format&fit=crop",
        channel: followers[3], // Chris
        viewers: 450,
        isBirthday: true,
    },
    {
        id: "l3",
        title: "Live Music Stream",
        thumbnail: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=2670&auto=format&fit=crop",
        channel: followers[2], // Emily
        viewers: 230,
        isBirthday: false,
    },
    {
        id: "l5",
        title: "Late Night Gaming",
        thumbnail: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2670&auto=format&fit=crop",
        channel: followers[1], // Mike
        viewers: 340,
        isBirthday: false,
    },
    {
        id: "l6",
        title: "Just Chatting & Coffee",
        thumbnail: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=2670&auto=format&fit=crop",
        channel: followers[0], // Chris
        viewers: 120,
        isBirthday: false,
    },
    {
        id: "l7",
        title: "Outdoor Adventure",
        thumbnail: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=2670&auto=format&fit=crop",
        channel: followers[2], // Emily
        viewers: 560,
        isBirthday: false,
    },
    {
        id: "l8",
        title: "Art & Drawing Stream",
        thumbnail: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=2671&auto=format&fit=crop",
        channel: followers[0], // Sarah
        viewers: 410,
        isBirthday: false,
    }
];
