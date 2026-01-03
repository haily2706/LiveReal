
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
        image: "https://images.unsplash.com/photo-LO1lToLGGFA?q=80&w=2600&auto=format&fit=crop",
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

export interface UpcomingEvent extends LiveStream {
    scheduledFor: string;
}

export interface FinishedEvent extends Video {
    endedAt: string;
}

export interface FamousPerson extends User {
    followerCount: string;
    description: string;
    coverImage: string;
}

export interface LiveStream {
    id: string;
    title: string;
    thumbnail: string;
    channel: User;
    viewers: number;
    isBirthday: boolean;
    isVertical?: boolean;
    isBackend?: boolean;
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
        thumbnail: "https://images.unsplash.com/photo-UEeiZeKFlks?q=80&w=2600&auto=format&fit=crop",
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
        thumbnail: "https://images.unsplash.com/photo-D68ADLeMh5Q?q=80&w=2670&auto=format&fit=crop",
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
        thumbnail: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=1740&auto=format&fit=crop",
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
        thumbnail: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=2670&auto=format&fit=crop",
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
        isVertical: true,
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
        isVertical: true,
    },
    {
        id: "l7",
        title: "Outdoor Adventure",
        thumbnail: "https://images.unsplash.com/photo-1501555088652-021faa106b9b?q=80&w=2600&auto=format&fit=crop",
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
        isVertical: true,
    },
    {
        id: "l9",
        title: "Epic Minecraft Build",
        thumbnail: "https://images.unsplash.com/photo-1555680202-c86f0e12f086?q=80&w=2600&auto=format&fit=crop",
        channel: followers[1],
        viewers: 1200,
        isBirthday: false,
    },
    {
        id: "l10",
        title: "Cooking Italian Pasta 🍝",
        thumbnail: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?q=80&w=2600&auto=format&fit=crop",
        channel: followers[3],
        viewers: 890,
        isBirthday: false,
        isVertical: true,
    },
    {
        id: "l11",
        title: "Midnight Horror Games 👻",
        thumbnail: "https://images.unsplash.com/photo-1542751110-97427bbecf20?q=80&w=2670&auto=format&fit=crop",
        channel: followers[2],
        viewers: 2100,
        isBirthday: false,
    },
    {
        id: "l12",
        title: "Morning Yoga Session 🧘‍♀️",
        thumbnail: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=2600&auto=format&fit=crop",
        channel: followers[0],
        viewers: 650,
        isBirthday: false,
        isVertical: true,
    },
    {
        id: "l13",
        title: "Tech Review Live: iPhone 16?",
        thumbnail: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=2670&auto=format&fit=crop",
        channel: followers[1],
        viewers: 3400,
        isBirthday: false,
    },
    {
        id: "l14",
        title: "Guitar Jamming 🎸",
        thumbnail: "https://images.unsplash.com/photo-1525201548942-d8732f6617a0?q=80&w=2600&auto=format&fit=crop",
        channel: followers[2],
        viewers: 1560,
        isBirthday: false,
    },
    {
        id: "l15",
        title: "Coding a React App from Scratch",
        thumbnail: "https://images.unsplash.com/photo-1587620962725-abab7fe55159?q=80&w=2670&auto=format&fit=crop",
        channel: followers[3],
        viewers: 920,
        isBirthday: false,
    },
    {
        id: "l16",
        title: "Travel Talk: Best Destinations",
        thumbnail: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2670&auto=format&fit=crop",
        channel: followers[0],
        viewers: 780,
        isBirthday: false,
    },
    {
        id: "l17",
        title: "Valorant Ranked Grind",
        thumbnail: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?q=80&w=2670&auto=format&fit=crop",
        channel: followers[1],
        viewers: 2800,
        isBirthday: false,
    }
];

export const upcomingEvents: UpcomingEvent[] = [
    {
        id: "ue1",
        title: "Anniversary Special Stream",
        thumbnail: "https://images.unsplash.com/photo-1535141192574-5d4897c12636?q=80&w=2574&auto=format&fit=crop",
        channel: followers[0],
        viewers: 0,
        isBirthday: false,
        scheduledFor: "Tomorrow, 8:00 PM"
    },
    {
        id: "ue2",
        title: "Q&A with Fans",
        thumbnail: "https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?q=80&w=2574&auto=format&fit=crop",
        channel: followers[1],
        viewers: 0,
        isBirthday: false,
        scheduledFor: "Sat, 10:00 AM"
    },
    {
        id: "ue3",
        title: "New Game Release Party",
        thumbnail: "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=2600&auto=format&fit=crop",
        channel: followers[2],
        viewers: 0,
        isBirthday: false,
        scheduledFor: "Sun, 2:00 PM"
    },
    {
        id: "ue4",
        title: "Cooking Class Live",
        thumbnail: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=2600&auto=format&fit=crop",
        channel: followers[3],
        viewers: 0,
        isBirthday: false,
        scheduledFor: "Mon, 6:00 PM"
    },
    {
        id: "ue5",
        title: "Digital Art Workshop 🎨",
        thumbnail: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=2671&auto=format&fit=crop",
        channel: followers[0], // Sarah
        viewers: 0,
        isBirthday: false,
        scheduledFor: "Tue, 4:00 PM"
    },
    {
        id: "ue6",
        title: "Speedrun Challenge: Mario 🍄",
        thumbnail: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?q=80&w=2642&auto=format&fit=crop",
        channel: followers[1], // Mike
        viewers: 0,
        isBirthday: false,
        scheduledFor: "Wed, 9:00 PM"
    },
    {
        id: "ue7",
        title: "Jazz Night Session 🎷",
        thumbnail: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?q=80&w=2670&auto=format&fit=crop",
        channel: followers[2], // Emily
        viewers: 0,
        isBirthday: false,
        scheduledFor: "Thu, 8:00 PM"
    },
    {
        id: "ue8",
        title: "Morning Fitness Routine 💪",
        thumbnail: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2670&auto=format&fit=crop",
        channel: followers[3], // Chris
        viewers: 0,
        isBirthday: false,
        scheduledFor: "Fri, 7:00 AM"
    },
    {
        id: "ue9",
        title: "React Native Crash Course 📱",
        thumbnail: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=2670&auto=format&fit=crop",
        channel: followers[0], // Sarah
        viewers: 0,
        isBirthday: false,
        scheduledFor: "Sat, 2:00 PM"
    },
    {
        id: "ue10",
        title: "Indie Game Showcase 🎮",
        thumbnail: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?q=80&w=2670&auto=format&fit=crop",
        channel: followers[1], // Mike
        viewers: 0,
        isBirthday: false,
        scheduledFor: "Sun, 3:00 PM"
    },
    {
        id: "ue11",
        title: "Songwriting Live Stream 🎵",
        thumbnail: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=2670&auto=format&fit=crop",
        channel: followers[2], // Emily
        viewers: 0,
        isBirthday: false,
        scheduledFor: "Mon, 6:00 PM"
    },
    {
        id: "ue12",
        title: "Ask Me Anything: Career 💼",
        thumbnail: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=2670&auto=format&fit=crop",
        channel: followers[3], // Chris
        viewers: 0,
        isBirthday: false,
        scheduledFor: "Tue, 5:00 PM"
    },
    {
        id: "ue13",
        title: "Live Coding: Portfolio Site 💻",
        thumbnail: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=2672&auto=format&fit=crop",
        channel: followers[0], // Sarah
        viewers: 0,
        isBirthday: false,
        scheduledFor: "Wed, 10:00 AM"
    },
    {
        id: "ue14",
        title: "Retro Gaming Night 🕹️",
        thumbnail: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2670&auto=format&fit=crop",
        channel: followers[1], // Mike
        viewers: 0,
        isBirthday: false,
        scheduledFor: "Thu, 9:00 PM"
    }
];

export const finishedEvents: FinishedEvent[] = [
    {
        id: "fe1",
        title: "Marathon 24h Stream",
        thumbnail: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=2670&auto=format&fit=crop",
        channel: followers[3],
        views: "1.5M",
        postedAt: "Yesterday",
        duration: "24:00:00",
        endedAt: "1 day ago"
    },
    {
        id: "fe2",
        title: "Charity Fundraiser Event",
        thumbnail: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=2670&auto=format&fit=crop",
        channel: followers[1],
        views: "850K",
        postedAt: "2 days ago",
        duration: "05:30:00",
        endedAt: "2 days ago"
    },
    {
        id: "fe3",
        title: "Live Concert (Acoustic)",
        thumbnail: "https://images.unsplash.com/photo-1501612780327-45045538702b?q=80&w=2670&auto=format&fit=crop",
        channel: followers[2],
        views: "2.1M",
        postedAt: "3 days ago",
        duration: "02:15:00",
        endedAt: "3 days ago"
    },
    {
        id: "fe4",
        title: "Tech Talk: AI Future",
        thumbnail: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=2670&auto=format&fit=crop",
        channel: followers[0],
        views: "120K",
        postedAt: "3 days ago",
        duration: "01:00:00",
        endedAt: "3 days ago"
    }
];

export const famousPeople: FamousPerson[] = [
    {
        ...followers[0],
        followerCount: "2.5M",
        description: "Official tech reviewer & lifestyle vlogger. Bringing you the latest gadgets and daily vibes.",
        coverImage: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2670&auto=format&fit=crop"
    },
    {
        ...followers[1],
        followerCount: "1.8M",
        description: "Pro gamer and variety streamer. Catch me live every day!",
        coverImage: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2670&auto=format&fit=crop"
    },
    {
        ...followers[2],
        followerCount: "3.2M",
        description: "Musician & songwriter. Sharing my journey one song at a time.",
        coverImage: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?q=80&w=2670&auto=format&fit=crop"
    },
    {
        ...followers[3],
        followerCount: "900K",
        description: "Outdoor explorer and adventure photographer. Let's see the world together.",
        coverImage: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2621&auto=format&fit=crop"
    },
    {
        id: "u7",
        name: "Alexia Star",
        username: "@alexia_s",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alexia",
        isFollowing: false,
        followerCount: "1.1M",
        description: "Fashion & Beauty expert. Daily tips and tricks.",
        coverImage: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2670&auto=format&fit=crop"
    },
    {
        id: "u8",
        name: "David Rock",
        username: "@david_r",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
        isFollowing: false,
        followerCount: "4.5M",
        description: "Fitness coach & motivator. Let's get fit together!",
        coverImage: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2670&auto=format&fit=crop"
    },
    {
        id: "u9",
        name: "Sophia Art",
        username: "@sophia_art",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sophia",
        isFollowing: false,
        followerCount: "850K",
        description: "Digital artist & animator. Watch me create magic.",
        coverImage: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=2671&auto=format&fit=crop"
    },
    {
        id: "u10",
        name: "James Cook",
        username: "@james_cook",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=James",
        isFollowing: false,
        followerCount: "2.8M",
        description: "Culinary master. Delicious recipes every week.",
        coverImage: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=2600&auto=format&fit=crop"
    }
];

export interface CompanyAd {
    id: string;
    companyName: string;
    description: string;
    banner: string;
    logo: string;
    link: string;
    cta: string;
}

export const companyAds: CompanyAd[] = [
    {
        id: "ad1",
        companyName: "TechGear Pro",
        description: "Upgrade your setup with the latest gaming peripherals. Keyboards, mice, and headsets designed for champions.",
        banner: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2670&auto=format&fit=crop",
        logo: "https://api.dicebear.com/7.x/identicon/svg?seed=TechGear",
        link: "https://example.com/techgear",
        cta: "Shop Now"
    },
    {
        id: "ad2",
        companyName: "FreshFocus Energy",
        description: "Stay sharp and focused during your longest streams with our natural, sugar-free energy drink.",
        banner: "https://images.unsplash.com/photo-uTBMw32LIOI?q=80&w=2670&auto=format&fit=crop",
        logo: "https://api.dicebear.com/7.x/identicon/svg?seed=FreshFocus",
        link: "https://example.com/freshfocus",
        cta: "Try It Free"
    },
    {
        id: "ad3",
        companyName: "CodeMaster Academy",
        description: "Learn to code from industry experts. Master React, Node.js, and Python in just 12 weeks.",
        banner: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1740&auto=format&fit=crop",
        logo: "https://api.dicebear.com/7.x/identicon/svg?seed=CodeMaster",
        link: "https://example.com/codemaster",
        cta: "Start Learning"
    },
    {
        id: "ad4",
        companyName: "StreamLabs OBS",
        description: "The best free streaming software. Go live on Twitch, YouTube, and Facebook in seconds.",
        banner: "https://images.unsplash.com/photo-1516110833967-0b5716ca1387?q=80&w=2574&auto=format&fit=crop",
        logo: "https://api.dicebear.com/7.x/identicon/svg?seed=StreamLabs",
        link: "https://example.com/streamlabs",
        cta: "Download"
    },
    {
        id: "ad5",
        companyName: "UrbanWear Styles",
        description: "Define your look with our exclusive collection of streetwear. Hoodies, tees, and accessories.",
        banner: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2670&auto=format&fit=crop",
        logo: "https://api.dicebear.com/7.x/identicon/svg?seed=UrbanWear",
        link: "https://example.com/urbanwear",
        cta: "View Collection"
    }
];

