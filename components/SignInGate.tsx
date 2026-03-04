"use client";

import { useEffect, useState } from "react";
import { SignIn } from "@clerk/nextjs";

export function SignInGate() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(true);
  }, []);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={() => setOpen(false)}
    >
      <div onClick={(e) => e.stopPropagation()}>
        <SignIn routing="hash" />
      </div>
    </div>
  );
}
