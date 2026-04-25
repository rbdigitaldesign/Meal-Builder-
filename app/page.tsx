"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useProfileStore } from "@/store/profileStore";

export default function RootPage() {
  const router = useRouter();
  const profile = useProfileStore((s) => s.profile);
  const _hasHydrated = useProfileStore((s) => s._hasHydrated);

  useEffect(() => {
    if (!_hasHydrated) return;

    if (profile?.setupComplete) {
      router.replace("/dashboard");
    } else {
      router.replace("/patient/login");
    }
  }, [_hasHydrated, profile, router]);

  return (
    <div className="min-h-screen bg-brand-cream flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-brand-olive border-t-transparent animate-spin" />
    </div>
  );
}
