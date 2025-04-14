import { Button } from "@/components/ui/button";
import { Metadata } from "next";
import Link from "next/link";
import PageWrapper from "@/components/wrapper/page-wrapper";
import CustomLink from "@/components/custom-link";

export const metadata: Metadata = {
  metadataBase: new URL("https://starter.rasmic.xyz"),
  keywords: [""],
  title: "Marketing page",
  openGraph: {
    description: "Put description of the page.",
    images: [""],
  },
  twitter: {
    card: "summary_large_image",
    title: "Marketing page",
    description: "Put description of the page.",
    siteId: "",
    creator: "@rasmickyy",
    creatorId: "",
    images: [""],
  },
};

export default async function MarketingPage() {
  return (
    <PageWrapper>
      <div className="flex flex-col min-h-screen items-center mt-[2.5rem] p-3 w-full">
        <h1 className="scroll-m-20 max-w-[600px] text-5xl font-bold tracking-tight text-center">
        See You at Wiley Swift <br className="hidden sm:block" />
        Reunion 2025
        </h1>
        <p className="mx-auto max-w-[600px] text-gray-500 md:text-lg text-center mt-2 dark:text-gray-400">
        Get Ready for more Magic Moments! Wiley Swift Family Reunion is Coming to Alexandria!
        </p>
        <div className="flex gap-2 mt-2">
          <Link href="/dashboard" prefetch={true} className="mt-2">
            <Button size="lg">Learn More</Button>
          </Link>
          <Link href="/dashboard" prefetch={true} className="mt-2">
            <Button size="lg" variant="outline">
              Register Now
            </Button>
          </Link>
        </div>

      </div>
    </PageWrapper>
  );
}


/*

        <div className="mb-3 mt-[1.5rem] max-w-[900px] w-full">
          <VideoPlayer videoSrc="https://utfs.io/f/08b0a37f-afd7-4623-b5cc-e85184528fce-1f02.mp4" />
        </div>

        */