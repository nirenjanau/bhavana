import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "About",
  description: "Learn about Bhavana Studio — fine art photography with soul.",
};

/* About page disabled — previous full-page implementation preserved in git history.
 * Navbar, Footer, and home teaser “Our Story” link to /about are commented out.
 */
export default function AboutPage() {
  redirect("/");
}
