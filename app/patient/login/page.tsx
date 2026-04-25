"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { ClientRow } from "@/lib/supabase/types";
import { useProfileStore } from "@/store/profileStore";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function PatientLoginPage() {
  const router = useRouter();
  const { setProfile } = useProfileStore();
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (pin.length !== 4) return;
    setLoading(true);
    setError("");

    const res = await fetch("/api/patient/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.detail ? `Error: ${body.detail}` : "PIN not recognised. Check with your practitioner.");
      setLoading(false);
      return;
    }

    const { client }: { client: ClientRow } = await res.json();
    setProfile({
      name: client.name,
      pin: client.pin ?? undefined,
      restrictions: client.restrictions,
      targets: client.targets,
      setupComplete: true,
    });

    // Store client ID for meal syncing
    localStorage.setItem("meal-builder-client-id", client.id);
    router.replace("/dashboard");
  }

  return (
    <div className="min-h-screen bg-brand-cream flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-xs space-y-6">
        <div className="flex flex-col items-center gap-3">
          <div className="bg-brand-forest rounded-2xl p-4">
            <Image src="/logo.png" alt="Alchemy Natural Health" width={120} height={40} className="object-contain" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-semibold text-brand-forest">Welcome back</h1>
            <p className="text-sm text-stone-500 mt-1">Enter your 4-digit PIN to continue</p>
          </div>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* PIN dots display */}
            <div className="flex justify-center gap-4 py-2">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className={`w-4 h-4 rounded-full border-2 transition-colors ${
                  i < pin.length ? "bg-brand-olive border-brand-olive" : "border-stone-300"
                }`} />
              ))}
            </div>

            {/* Hidden input for actual PIN entry */}
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
              className="w-full text-center text-3xl tracking-[0.5em] font-mono rounded-xl border border-brand-warm px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-olive/50"
              autoFocus
              placeholder="----"
            />

            {error && <p className="text-sm text-red-600 text-center">{error}</p>}

            <Button type="submit" className="w-full" disabled={pin.length < 4 || loading}>
              {loading ? "Checking…" : "Enter"}
            </Button>
          </form>
        </Card>

        <p className="text-center text-xs text-stone-400">
          Practitioner?{" "}
          <a href="/admin/login" className="text-brand-olive hover:underline">Sign in here</a>
        </p>
      </div>
    </div>
  );
}
