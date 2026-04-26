"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useProfileStore } from "@/store/profileStore";
import { useMealStore } from "@/store/mealStore";
import { calculateDailyTotals, buildNutrientSummaries } from "@/lib/nutrition";
import { MEAL_TYPES } from "@/lib/types";
import type { DailyLog } from "@/lib/types";
import { MealSummaryCard } from "@/components/dashboard/MealSummaryCard";
import { DailyNutrientChart } from "@/components/dashboard/DailyNutrientChart";
import { HealthPlanCard } from "@/components/dashboard/HealthPlanCard";
import { TodayRecipeCard } from "@/components/dashboard/TodayRecipeCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function offsetDate(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T12:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function formatDateLabel(dateStr: string): string {
  if (dateStr === todayStr()) return "Today";
  if (dateStr === offsetDate(todayStr(), -1)) return "Yesterday";
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short" });
}

function emptyLog(date: string): DailyLog {
  return { date, meals: { breakfast: null, lunch: null, dinner: null, snack: null } };
}

export default function DashboardPage() {
  const router = useRouter();
  const { profile, resetProfile } = useProfileStore();
  const _hasHydrated = useProfileStore((s) => s._hasHydrated);
  const { dailyLog, activeRecipes, resetDay, ensureTodayLog, getLogForDate } = useMealStore();
  const [isSupabasePatient, setIsSupabasePatient] = useState(false);
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [pinEntry, setPinEntry] = useState("");
  const [pinError, setPinError] = useState(false);
  const isSigningOutRef = useRef(false);

  // Date navigation
  const [viewDate, setViewDate] = useState(todayStr());
  const [historicalLog, setHistoricalLog] = useState<DailyLog | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const isToday = viewDate === todayStr();

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

  const loadHistoricalDate = useCallback(async (date: string) => {
    if (date === todayStr()) {
      setHistoricalLog(null);
      return;
    }
    setLoadingHistory(true);
    const clientId = typeof window !== "undefined" ? localStorage.getItem("meal-builder-client-id") : null;
    if (clientId) {
      try {
        const res = await fetch(`/api/meal-logs?clientId=${clientId}&date=${date}`);
        const json = await res.json();
        setHistoricalLog(json.log ?? emptyLog(date));
      } catch {
        setHistoricalLog(emptyLog(date));
      }
    } else {
      setHistoricalLog(getLogForDate(date) ?? emptyLog(date));
    }
    setLoadingHistory(false);
  }, [getLogForDate]);

  useEffect(() => {
    loadHistoricalDate(viewDate);
  }, [viewDate, loadHistoricalDate]);

  function handleSignOut() {
    isSigningOutRef.current = true;
    localStorage.removeItem("meal-builder-client-id");
    resetProfile();
    router.replace("/patient/login");
  }

  if (!profile?.setupComplete) return null;

  const displayLog = isToday ? dailyLog : (historicalLog ?? emptyLog(viewDate));
  const dailyTotals = calculateDailyTotals(displayLog);
  const summaries = buildNutrientSummaries(dailyTotals, profile.targets);

  const today = new Date().toLocaleDateString("en-AU", {
    weekday: "long", day: "numeric", month: "long",
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
              <p className="font-semibold">Welcome back, {profile.name.split(" ")[0]}!</p>
            </div>
          </div>
          {isSupabasePatient ? (
            <button onClick={handleSignOut} className="text-sm opacity-70 hover:opacity-100 transition-opacity py-2 px-3 -my-1 rounded-lg hover:bg-white/10 min-h-[44px] flex items-center">
              Sign out
            </button>
          ) : (
            <button
              onClick={() => {
                if (profile.pin) { setPinEntry(""); setPinError(false); setPinModalOpen(true); }
                else router.push("/clinician");
              }}
              className="text-sm opacity-70 hover:opacity-100 transition-opacity py-2 px-3 -my-1 rounded-lg hover:bg-white/10 min-h-[44px] flex items-center"
            >
              Settings
            </button>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">

        {/* Date navigation */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => setViewDate((d) => offsetDate(d, -1))}
            className="w-11 h-11 rounded-full bg-white border border-brand-warm text-brand-forest hover:bg-brand-sage/20 flex items-center justify-center transition-colors text-xl font-medium"
          >
            ‹
          </button>
          <div className="text-center min-w-[130px]">
            <p className="font-semibold text-brand-forest">{formatDateLabel(viewDate)}</p>
            {!isToday && (
              <button
                onClick={() => setViewDate(todayStr())}
                className="text-sm text-brand-olive hover:underline mt-0.5 py-1 inline-block"
              >
                Back to today
              </button>
            )}
          </div>
          <button
            onClick={() => setViewDate((d) => offsetDate(d, 1))}
            disabled={isToday}
            className="w-11 h-11 rounded-full bg-white border border-brand-warm text-brand-forest hover:bg-brand-sage/20 flex items-center justify-center transition-colors text-xl font-medium disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ›
          </button>
        </div>

        {/* Daily progress + health plan */}
        {loadingHistory ? (
          <div className="h-40 bg-white rounded-2xl border border-brand-warm animate-pulse" />
        ) : isSupabasePatient ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-stretch">
            <DailyNutrientChart summaries={summaries} targets={profile.targets} className="h-full" />
            <HealthPlanCard profile={profile} className="h-full" />
          </div>
        ) : (
          <DailyNutrientChart summaries={summaries} targets={profile.targets} />
        )}

        {/* Meals */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-stone-400">
              {isToday ? "Today's Meals" : `Meals — ${formatDateLabel(viewDate)}`}
            </h2>
            {!isToday && (
              <span className="text-xs text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full">View only</span>
            )}
          </div>
          <div className="space-y-4">
            {MEAL_TYPES.map((mealType) => (
              <MealSummaryCard
                key={mealType}
                mealType={mealType}
                meal={displayLog.meals[mealType]}
                targets={profile.targets}
                readOnly={!isToday}
              />
            ))}
          </div>
        </div>

        {/* Recipe instructions — only on today, only when recipes are active */}
        {isToday && <TodayRecipeCard activeRecipes={activeRecipes} dailyLog={dailyLog} />}

        {/* Reset day — only on today */}
        {isToday && (
          <div className="pt-4 border-t border-brand-warm flex justify-center">
            <Button
              variant="secondary"
              size="md"
              onClick={() => { if (confirm("Clear all of today's meals and start fresh?")) resetDay(); }}
              className="text-red-500 border-red-200 hover:bg-red-50"
            >
              ↺ Reset today&apos;s meals
            </Button>
          </div>
        )}
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
