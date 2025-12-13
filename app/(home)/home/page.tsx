
import { birthdayLives } from "@/lib/data";
import { LiveSection } from "./components/live-section";
import { BackgroundBlobs } from "@/components/ui/background-blobs";


export default async function HomePage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {

    const resolvedSearchParams = await searchParams;
    const category = resolvedSearchParams?.category;
    let filteredLives = [...birthdayLives];
    let sectionTitle = "Featured Live";

    if (category && typeof category === 'string' && category !== "All") {
        sectionTitle = `Top ${category}`;
        const term = category.toLowerCase();

        if (term === 'gaming') {
            filteredLives = filteredLives.filter(l =>
                l.title.toLowerCase().includes("gaming") ||
                l.title.toLowerCase().includes("game") ||
                l.title.toLowerCase().includes("minecraft") ||
                l.title.toLowerCase().includes("fortnite")
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


    return (
        <div className="flex flex-col min-h-screen bg-background relative overflow-hidden">
            <BackgroundBlobs />

            <div className="p-4 md:p-8 space-y-12 max-w-[2000px] mx-auto w-full relative z-10 pb-20">
                {/* Live Section */}
                <LiveSection lives={filteredLives} title={sectionTitle} />
            </div>
        </div>
    );
}
