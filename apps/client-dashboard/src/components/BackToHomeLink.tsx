import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { HOME_URL } from "@/lib/site";

interface Props {
  className?: string;
}

export default function BackToHomeLink({ className = "" }: Props) {
  return (
    <Link
      href={HOME_URL}
      className={`inline-flex items-center gap-1.5 text-xs tracking-widest uppercase text-stone-400 hover:text-stone-900 transition-colors ${className}`}
    >
      <ArrowLeft size={14} />
      Back to home
    </Link>
  );
}
