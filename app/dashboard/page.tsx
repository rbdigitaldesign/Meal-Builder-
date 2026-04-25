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

export default function DashboardPage() {
  const router = useRouter();
  const { profile, resetProfile } = useProfileStore();
  const { dailyLog, resetDay, ensureTodayLog } = useMealStore();
  const [isSupabasePatient, setIsSupabasePatient] = useState(false);
  const isSigningOutRef = useRef(false);

  useEffect(() => {
    ensureTodayLog();
    setIsSupabasePatient(!!localStorage.getItem("meal-builder-client-id"));
  }, [ensureTodayLog]);

  useEffect(() => {
    if (!profile?.setupComplete && !isSigningOutRef.current) {
      router.replace("/clinician");
    }
  }, [profile?.setupComplete, router]);

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
              <p className="font-semibold">{profile.name}</p>
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
                  const entered = prompt("Enter clinician PIN:");
                  if (entered !== profile.pin) {
                    alert("Incorrect PIN.");
                    return;
                  }
                }
                router.push("/clinician");
              }}
              className="text-xs opacity-60 hover:opacity-100 transition-opacity"
            >
              Settings
            </button>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        {/* Daily progress */}
        <DailyNutrientChart summaries={summaries} targets={profile.targets} />

        {/* Patient's health plan — read-only view of practitioner-set goals */}
        {isSupabasePatient && <HealthPlanCard profile={profile} />}

        {/* Meals */}
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-stone-400 mb-3">Today&apos;s Meals</h2>
          <div className="space-y-3">
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
        <div className="pt-2 border-t border-brand-warm">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (confirm("Clear all of today's meals and start fresh?")) {
                resetDay();
              }
            }}
            className="text-stone-400"
          >
            Reset today&apos;s meals
          </Button>
        </div>
      </div>
    </div>
  );
}
