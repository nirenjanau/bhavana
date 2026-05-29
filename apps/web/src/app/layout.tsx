import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: {
    template: "%s | Bhavana Studio",
    default: "Bhavana Studio — Fine Art Photography",
  },
  description:
    "Bhavana Studio captures life's most precious moments with an editorial, cinematic approach. Based in Bangalore, available worldwide.",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://bhavanastudio.com",
    siteName: "Bhavana Studio",
  },
  icons: {
    icon: "/Bhavana%20Name%20Adress%20copy00.png",
    apple: "/Bhavana%20Name%20Adress%20copy00.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
