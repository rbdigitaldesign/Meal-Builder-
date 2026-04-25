"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useProfileStore } from "@/store/profileStore";

export default function RootPage() {
  const router = useRouter();
  const { profile } = useProfileStore();

  useEffect(() => {
    if (profile?.setupComplete) {
      router.replace("/dashboard");
    } else {
      router.replace("/clinician");
    }
  }, [profile, router]);

  return (
    <div className="min-h-screen bg-brand-cream flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-brand-olive border-t-transparent animate-spin" />
    </div>
  );
}
