import type { Metadata } from "next";

const siteUrl = process.env.NEXTAUTH_URL ?? "https://www.bhavanastudio.com";

const title = "Client Gallery Portal | Bhavana Studio";
const description =
  "Sign in to your private Bhavana Studio gallery — view, like, and select your photos.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  openGraph: {
    type: "website",
    url: `${siteUrl}/login`,
    siteName: "Bhavana Studio",
    title,
    description,
    images: [
      {
        url: "/10-1.jpg.jpeg",
        width: 1200,
        height: 800,
        alt: "Bhavana Studio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/10-1.jpg.jpeg"],
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
