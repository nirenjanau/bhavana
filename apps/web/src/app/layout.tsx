import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.bhavanastudio.com";

const siteDescription =
  "Bhavana Studio captures life's most precious moments with an editorial, cinematic approach. Based in Bangalore, available worldwide.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    template: "%s | Bhavana Studio",
    default: "Bhavana Studio — Fine Art Photography",
  },
  description: siteDescription,
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteUrl,
    siteName: "Bhavana Studio",
    title: "Bhavana Studio — Fine Art Photography",
    description: siteDescription,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Bhavana Studio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bhavana Studio — Fine Art Photography",
    description: siteDescription,
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/Bhavana%20Name%20Adress%20copy00.png",
    apple: "/Bhavana%20Name%20Adress%20copy00.png",
  },
};

const maintenance = process.env.MAINTENANCE_MODE === "true";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {!maintenance && <Navbar />}
        <main>{children}</main>
        {!maintenance && <Footer />}
      </body>
    </html>
  );
}
