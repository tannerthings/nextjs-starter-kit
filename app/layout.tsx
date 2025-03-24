import Provider from "@/app/provider";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { ClerkProvider } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/react";
import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://wileyswiftreunion.com"),
  title: {
    default: 'Next Starter',
    template: `%s | Next Starter`
  },
  description:
    "The Wiley Swift 2025 Reunion",
  openGraph: {
    description:
      "The Wiley Swift 2025 Reunion",
    images: [
      "https://7mt7h9a7m4.ufs.sh/f/FuIgmNtZWliey5XfvrMo2VvLrS83lcPqpT4hGUtsNMCdF5Oe",
    ],
    url: "https://wileyswiftreunion.com/",
  },
  twitter: {
    card: "summary_large_image",
    title: "Wiley Swift",
    description:
      "The Wiley Swift 2025 Reunion",
    siteId: "",
    creator: "@rennatsx",
    creatorId: "",
    images: [
      "https://7mt7h9a7m4.ufs.sh/f/FuIgmNtZWliey5XfvrMo2VvLrS83lcPqpT4hGUtsNMCdF5Oe",
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider dynamic>
      <html lang="en" suppressHydrationWarning>
        <body className={GeistSans.className}>
          <Provider>
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem
              disableTransitionOnChange
            >
              {children}
              <Toaster />
            </ThemeProvider>
          </Provider>
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  );
}
