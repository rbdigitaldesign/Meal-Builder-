"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get("error") === "access") {
      setError("Your account doesn't have practitioner access. Contact the administrator.");
    }
  }, [searchParams]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError("Incorrect email or password.");
      setLoading(false);
    } else {
      router.replace("/admin/dashboard");
    }
  }

  return (
    <div className="min-h-screen bg-brand-cream flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-3">
          <div className="bg-brand-forest rounded-2xl p-4">
            <Image src="/logo.png" alt="Alchemy Natural Health" width={120} height={40} className="object-contain" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-semibold text-brand-forest">Practitioner Portal</h1>
            <p className="text-sm text-stone-500 mt-1">Sign in to manage your clients</p>
          </div>
        </div>

        <Card>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </Card>

        <p className="text-center text-xs text-stone-400">
          Patient?{" "}
          <a href="/patient/login" className="text-brand-olive hover:underline">
            Enter your PIN here
          </a>
        </p>
      </div>
    </div>
  );
}
