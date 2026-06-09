import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

const siteUrl = process.env.NEXTAUTH_URL ?? "https://www.bhavanastudio.com";

const title = "Client Gallery | Bhavana Studio";
const description = "Access your private photo gallery from Bhavana Studio.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "Bhavana Studio",
    title,
    description,
    images: [
      {
        url: "https://www.bhavanastudio.com/bhavana-logo.png",
        width: 1024,
        height: 576,
        alt: "Bhavana Studio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["https://www.bhavanastudio.com/bhavana-logo.png"],
  },
  icons: {
    icon: "/bhavana-logo.png",
    apple: "/bhavana-logo.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
