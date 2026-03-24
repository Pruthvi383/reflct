"use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      richColors={false}
      closeButton
      toastOptions={{
        classNames: {
          toast: "!border-white/10 !bg-[#11131a]/90 !text-[#f8f8f2]",
          description: "!text-[#d8d2c2]",
          actionButton: "!bg-[#c9a84c] !text-[#0a0a0f]",
          cancelButton: "!bg-white/10 !text-[#f8f8f2]"
        }
      }}
    />
  );
}
