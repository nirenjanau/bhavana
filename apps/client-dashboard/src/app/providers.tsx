"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "#1c1917",
            color: "#fafaf9",
            fontSize: "13px",
            borderRadius: "2px",
          },
        }}
      />
    </SessionProvider>
  );
}
