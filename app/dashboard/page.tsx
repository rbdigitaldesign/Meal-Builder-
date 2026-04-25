"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useProfileStore } from "@/store/profileStore";
import { useMealStore } from "@/store/mealStore";
import { calculateDailyTotals, buildNutrientSummaries } from "@/lib/nutrition";
import { MEAL_TYPES } from "@/lib/types";
import { MealSummaryCard } from "@/components/dashboard/MealSummaryCard";
import { DailyNutrientChart } from "@/components/dashboard/DailyNutrientChart";
import { HealthPlanCard } from "@/components/dashboard/HealthPlanCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function DashboardPage() {
  const router = useRouter();
  const { profile, resetProfile } = useProfileStore();
  const _hasHydrated = useProfileStore((s) => s._hasHydrated);
  const { dailyLog, resetDay, ensureTodayLog } = useMealStore();
  const [isSupabasePatient, setIsSupabasePatient] = useState(false);
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [pinEntry, setPinEntry] = useState("");
  const [pinError, setPinError] = useState(false);
  const isSigningOutRef = useRef(false);

  useEffect(() => {
    ensureTodayLog();
    setIsSupabasePatient(!!localStorage.getItem("meal-builder-client-id"));
  }, [ensureTodayLog]);

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!profile?.setupComplete && !isSigningOutRef.current) {
      const clientId = localStorage.getItem("meal-builder-client-id");
      router.replace(clientId ? "/patient/login" : "/clinician");
    }
  }, [_hasHydrated, profile?.setupComplete, router]);

  function handleSignOut() {
    isSigningOutRef.current = true;
    localStorage.removeItem("meal-builder-client-id");
    resetProfile();
    router.replace("/patient/login");
  }

  if (!profile?.setupComplete) {
    return null;
  }

  const dailyTotals = calculateDailyTotals(dailyLog);
  const summaries = buildNutrientSummaries(dailyTotals, profile.targets);

  const today = new Date().toLocaleDateString("en-AU", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="min-h-screen bg-brand-cream">
      {/* Header */}
      <div className="bg-brand-forest text-white px-5 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Image src="/logo.png" alt="Alchemy Natural Health" width={100} height={34} className="object-contain" />
            <div className="border-l border-white/20 pl-4">
              <p className="text-xs opacity-70">{today}</p>
              <p className="font-semibold">Welcome back, {profile.name}!</p>
            </div>
          </div>
          {isSupabasePatient ? (
            <button
              onClick={handleSignOut}
              className="text-xs opacity-60 hover:opacity-100 transition-opacity"
            >
              Sign out
            </button>
          ) : (
            <button
              onClick={() => {
                if (profile.pin) {
                  setPinEntry("");
                  setPinError(false);
                  setPinModalOpen(true);
                } else {
                  router.push("/clinician");
                }
              }}
              className="text-xs opacity-60 hover:opacity-100 transition-opacity"
            >
              Settings
            </button>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Daily progress + health plan side by side */}
        {isSupabasePatient ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-stretch">
            <DailyNutrientChart summaries={summaries} targets={profile.targets} className="h-full" />
            <HealthPlanCard profile={profile} className="h-full" />
          </div>
        ) : (
          <DailyNutrientChart summaries={summaries} targets={profile.targets} />
        )}

        {/* Meals */}
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-stone-400 mb-3">Today&apos;s Meals</h2>
          <div className="space-y-4">
            {MEAL_TYPES.map((mealType) => (
              <MealSummaryCard
                key={mealType}
                mealType={mealType}
                meal={dailyLog.meals[mealType]}
                targets={profile.targets}
              />
            ))}
          </div>
        </div>

        {/* Reset day */}
        <div className="pt-4 border-t border-brand-warm flex justify-center">
          <Button
            variant="secondary"
            size="md"
            onClick={() => {
              if (confirm("Clear all of today's meals and start fresh?")) {
                resetDay();
              }
            }}
            className="text-red-500 border-red-200 hover:bg-red-50"
          >
            ↺ Reset today&apos;s meals
          </Button>
        </div>
      </div>

      {/* PIN modal for Settings access */}
      {pinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-xs space-y-4">
            <h2 className="font-semibold text-brand-forest text-lg">Enter PIN</h2>
            <p className="text-sm text-stone-500">Enter the clinician PIN to access settings.</p>
            <Input
              label="PIN"
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={pinEntry}
              onChange={(e) => { setPinEntry(e.target.value.replace(/\D/g, "")); setPinError(false); }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && pinEntry.length === 4) {
                  if (pinEntry === profile.pin) { setPinModalOpen(false); router.push("/clinician"); }
                  else { setPinError(true); setPinEntry(""); }
                }
                if (e.key === "Escape") setPinModalOpen(false);
              }}
              autoFocus
            />
            {pinError && <p className="text-xs text-red-500">Incorrect PIN. Try again.</p>}
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setPinModalOpen(false)}>Cancel</Button>
              <Button
                className="flex-1"
                disabled={pinEntry.length !== 4}
                onClick={() => {
                  if (pinEntry === profile.pin) { setPinModalOpen(false); router.push("/clinician"); }
                  else { setPinError(true); setPinEntry(""); }
                }}
              >
                Unlock
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
