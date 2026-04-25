"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";

const NAV = [
  { href: "/admin/dashboard", label: "Clients" },
  { href: "/admin/templates", label: "Templates" },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/admin/login");
  }

  return (
    <div className="min-h-screen bg-brand-cream">
      <header className="bg-brand-forest text-white px-5 py-3 flex items-center gap-4">
        <Link href="/admin/dashboard" className="flex items-center gap-3">
          <Image src="/logo.png" alt="Alchemy Natural Health" width={90} height={30} className="object-contain" />
          <span className="border-l border-white/20 pl-3 text-sm font-semibold hidden sm:block">
            Practitioner Portal
          </span>
        </Link>

        <nav className="flex-1 flex items-center gap-1 ml-4">
          {NAV.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                pathname.startsWith(href)
                  ? "bg-white/20 text-white"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-white/70 hover:text-white hover:bg-white/10">
          Sign out
        </Button>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
