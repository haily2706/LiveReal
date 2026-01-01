import { birthdayLives, upcomingEvents, finishedEvents, followers, companyAds } from "@/lib/data";
import { LiveSection } from "./components/live-section";
import { UpcomingSection } from "./components/upcoming-section";
import { JFYSection } from "./components/jfy-section";

import { AdsBanner } from "./components/ads-banner";
import { BackgroundBlobs } from "@/components/ui/background-blobs";


export default async function HomePage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {

    const resolvedSearchParams = await searchParams;
    const category = resolvedSearchParams?.category;
    let filteredLives = [...birthdayLives];
    let sectionTitle = "Trending Live";

    if (category && typeof category === 'string' && category !== "All") {
        sectionTitle = `Trending ${category}`;
        const term = category.toLowerCase();

        if (term === 'gaming') {
            filteredLives = filteredLives.filter(l =>
                l.title.toLowerCase().includes("gaming") ||
                l.title.toLowerCase().includes("game") ||
                l.title.toLowerCase().includes("minecraft") ||
                l.title.toLowerCase().includes("fortnite") ||
                l.title.toLowerCase().includes("valorant")
            );
        } else if (term === 'sing' || term === 'music') {
            filteredLives = filteredLives.filter(l =>
                l.title.toLowerCase().includes("music") ||
                l.title.toLowerCase().includes("sing") ||
                l.title.toLowerCase().includes("song") ||
                l.title.toLowerCase().includes("guitar") ||
                l.title.toLowerCase().includes("piano")
            );
        }
        // 'Live' category generally means everything in this context, or maybe 'Just Chatting'
    }

    // Sort by viewers (descending) and take top 10
    filteredLives.sort((a, b) => b.viewers - a.viewers);
    filteredLives = filteredLives.slice(0, 5);


    return (
        <div className="flex flex-col min-h-screen relative overflow-x-hidden">
            <div className="p-4 md:p-6 space-y-16 max-w-[2000px] mx-auto w-full relative z-10 pb-20">

                {/* Ads Banner */}
                <AdsBanner />

                {/* Live Section */}
                <LiveSection lives={filteredLives} title={sectionTitle} />

                {/* Upcoming Events Section */}
                <UpcomingSection events={upcomingEvents.slice(0, 10)} />

                {/* Just For You Section */}
                <JFYSection
                    liveStreams={birthdayLives.filter(l => followers.some(f => f.id === l.channel.id))}
                    upcomingStreams={upcomingEvents.filter(u => followers.some(f => f.id === u.channel.id))}
                />




            </div>
        </div>
    );
}
