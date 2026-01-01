import { BackgroundBlobs } from "@/components/ui/background-blobs";
import { Navbar } from "./components/navbar";

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <BackgroundBlobs />
      <Navbar />
      <main className="flex w-full flex-1 flex-col">
        {children}
      </main>
    </>
  );
}
