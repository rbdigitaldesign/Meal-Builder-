"use client";

import { use, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { requirePractitioner } from "@/lib/supabase/adminAuth";
import type { ClientRow, MealLogRow } from "@/lib/supabase/types";
import type { NutrientKey } from "@/lib/types";
import { NUTRIENT_LABELS, NUTRIENT_UNITS } from "@/lib/types";
import { groupLogsByDate, computeWeeklySummary, getTopFoods } from "@/lib/analytics";
import { calculateMealTotals } from "@/lib/nutrition";
import { useEnergyUnit } from "@/lib/useEnergyUnit";

interface PageProps { params: Promise<{ id: string }> }

const STATUS_COLORS: Record<string, string> = {
  met:       "bg-brand-olive",
  exceeded:  "bg-brand-sage",
  approaching: "bg-amber-400",
  deficient: "bg-stone-300",
};

function complianceStatus(pct: number) {
  if (pct >= 90) return "met";
  if (pct >= 50) return "approaching";
  return "deficient";
}

export default function ReportPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [client, setClient] = useState<ClientRow | null>(null);
  const [logs, setLogs] = useState<MealLogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const { unit, toggle: toggleUnit, display: displayEnergy } = useEnergyUnit();

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const user = await requirePractitioner(supabase, router);
      if (!user) return;
      const [{ data: clientData }, { data: logsData }] = await Promise.all([
        supabase.from("clients").select("*").eq("id", id).single(),
        supabase.from("meal_logs").select("*").eq("client_id", id).order("date", { ascending: false }).limit(150),
      ]);
      setClient(clientData);
      setLogs(logsData ?? []);
      if (clientData) {
        document.title = `${clientData.name} - Nutrition Report`;
      }
      setLoading(false);
    }
    load();
  }, [id, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-stone-400">Generating report…</p>
      </div>
    );
  }
  if (!client) return null;

  const byDate = groupLogsByDate(logs);
  const allDates = Object.keys(byDate).sort();
  const recentDates = allDates.slice(-30);
  const daysWithData = recentDates.length;

  // 30-day averages
  const avgIntake = calculateMealTotals(logs.slice(0, 150 * 4).flatMap((l) => l.items));
  const nutrientKeys: NutrientKey[] = [
    "calories", "protein", "carbs", "fat", "fiber",
    "iron", "calcium", "zinc", "vitaminC", "vitaminB12",
  ];
  const dailyAvg: Record<NutrientKey, number> = {} as Record<NutrientKey, number>;
  for (const key of nutrientKeys) {
    dailyAvg[key] = daysWithData > 0
      ? Math.round((avgIntake[key] / daysWithData) * 10) / 10
      : 0;
  }

  // Compliance: % of logged days each target was met
  const compliance: Record<NutrientKey, number> = {} as Record<NutrientKey, number>;
  for (const target of client.targets) {
    const key = target.nutrient;
    const metDays = recentDates.filter((d) => {
      const val = byDate[d]?.[key] ?? 0;
      return target.dailyTarget > 0 && val / target.dailyTarget >= 0.9;
    }).length;
    compliance[key] = daysWithData > 0 ? Math.round((metDays / daysWithData) * 100) : 0;
  }

  const topFoods = getTopFoods(logs, 8);
  const weeklySummary = computeWeeklySummary(logs, client.targets);
  const generatedDate = new Date().toLocaleDateString("en-AU", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  const criticals = client.targets.filter((t) => t.priority === "critical");
  const recommended = client.targets.filter((t) => t.priority === "recommended");

  return (
    <div className="bg-white min-h-screen">
      {/* Print controls — hidden when printing */}
      <div className="print:hidden bg-stone-50 border-b border-stone-200 px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
        <Link href={`/admin/clients/${id}`} className="text-sm text-brand-olive hover:underline flex-1 min-w-0 truncate">
          ← Back to {client.name}
        </Link>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={toggleUnit}
            className="flex items-center rounded-full border border-stone-300 bg-white text-xs font-medium overflow-hidden min-h-[36px]"
            title="Switch energy units"
          >
            <span className={`px-3 py-2 transition-colors ${unit === "kcal" ? "bg-brand-olive text-white" : "text-stone-400"}`}>kcal</span>
            <span className={`px-3 py-2 transition-colors ${unit === "kJ"   ? "bg-brand-olive text-white" : "text-stone-400"}`}>kJ</span>
          </button>
          <button
            onClick={() => window.print()}
            className="bg-brand-olive text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-brand-forest transition-colors whitespace-nowrap min-h-[36px]"
          >
            Print / Save as PDF
          </button>
        </div>
      </div>

      {/* Branded header — full width, prints with background */}
      <div className="bg-brand-forest [print-color-adjust:exact] [-webkit-print-color-adjust:exact] px-8 py-6 flex items-center justify-between">
        <Image
          src="/logo.png"
          alt="Alchemy Natural Health"
          width={160}
          height={54}
          className="object-contain"
        />
        <div className="text-right text-white/70 text-xs leading-relaxed">
          <p className="text-white font-semibold text-sm">Alchemy Natural Health</p>
          <p>alchemynaturalhealth.com.au</p>
        </div>
      </div>

      {/* Report body */}
      <div className="max-w-2xl mx-auto px-8 py-10 space-y-8">

        {/* Patient + report title */}
        <div className="border-b border-stone-200 pb-6">
          <h1 className="text-2xl font-bold text-brand-forest">{client.name}</h1>
          <p className="text-sm text-stone-500 mt-1">Nutritional Progress Report</p>
          <p className="text-xs text-stone-400 mt-0.5">Generated {generatedDate}</p>
        </div>

        {/* Patient profile */}
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-400 mb-3">
            Patient Profile
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {client.condition_tags.length > 0 && (
              <div>
                <p className="text-xs text-stone-400 mb-1">Conditions &amp; Focus Areas</p>
                <div className="flex flex-wrap gap-1.5">
                  {client.condition_tags.map((tag) => (
                    <span key={tag} className="text-xs bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {client.restrictions.length > 0 && (
              <div>
                <p className="text-xs text-stone-400 mb-1">Dietary Restrictions</p>
                <div className="flex flex-wrap gap-1.5">
                  {client.restrictions.map((r) => (
                    <span key={r} className="text-xs bg-brand-sage/20 text-brand-forest border border-brand-sage/40 px-2 py-0.5 rounded-full capitalize">
                      {r.replace(/([A-Z])/g, " $1").trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Engagement summary */}
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-400 mb-3">
            Engagement — Last 30 Days
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-stone-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-brand-forest">{daysWithData}</p>
              <p className="text-xs text-stone-500 mt-0.5">days logged</p>
            </div>
            <div className="bg-stone-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-brand-forest">{weeklySummary.daysLogged}</p>
              <p className="text-xs text-stone-500 mt-0.5">days this week</p>
            </div>
            <div className="bg-stone-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-brand-forest">{logs.length}</p>
              <p className="text-xs text-stone-500 mt-0.5">total meal entries</p>
            </div>
          </div>
        </div>

        {/* Priority targets */}
        {criticals.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-400 mb-3">
              Priority Targets — 30-Day Compliance
            </h2>
            <div className="space-y-4">
              {criticals.map((t) => {
                const pct = compliance[t.nutrient] ?? 0;
                const avg = dailyAvg[t.nutrient] ?? 0;
                const status = complianceStatus(pct);
                const barColor = STATUS_COLORS[status];
                return (
                  <div key={t.nutrient}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="font-medium text-brand-black">{NUTRIENT_LABELS[t.nutrient]}</span>
                      <span className="text-stone-500 tabular-nums text-xs">
                        avg {t.nutrient === "calories" ? `${displayEnergy(avg)} / ${displayEnergy(t.dailyTarget)}` : `${avg}${NUTRIENT_UNITS[t.nutrient]} / ${t.dailyTarget}${NUTRIENT_UNITS[t.nutrient]}`} &middot; {pct}% of days met
                      </span>
                    </div>
                    <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden">
                      <div
                        className={`h-3 ${barColor} rounded-full`}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Other targets */}
        {recommended.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-400 mb-3">
              Other Targets — 30-Day Averages
            </h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-stone-400 border-b border-stone-100">
                  <th className="text-left pb-2 font-medium">Nutrient</th>
                  <th className="text-right pb-2 font-medium">Daily Target</th>
                  <th className="text-right pb-2 font-medium">30-Day Avg</th>
                  <th className="text-right pb-2 font-medium">Days Met</th>
                </tr>
              </thead>
              <tbody>
                {recommended.map((t) => {
                  const avg = dailyAvg[t.nutrient] ?? 0;
                  const pct = compliance[t.nutrient] ?? 0;
                  return (
                    <tr key={t.nutrient} className="border-b border-stone-50">
                      <td className="py-2 text-stone-700">{NUTRIENT_LABELS[t.nutrient]}</td>
                      <td className="py-2 text-right text-stone-500 tabular-nums">{t.nutrient === "calories" ? displayEnergy(t.dailyTarget) : `${t.dailyTarget}${NUTRIENT_UNITS[t.nutrient]}`}</td>
                      <td className="py-2 text-right tabular-nums font-medium text-brand-black">{t.nutrient === "calories" ? displayEnergy(avg) : `${avg}${NUTRIENT_UNITS[t.nutrient]}`}</td>
                      <td className={`py-2 text-right tabular-nums font-medium ${pct >= 90 ? "text-brand-olive" : pct >= 50 ? "text-amber-500" : "text-stone-400"}`}>{pct}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Top foods */}
        {topFoods.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-400 mb-3">
              Most Logged Foods
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {topFoods.map((f, i) => (
                <div key={f.name} className="flex items-center gap-2 text-sm">
                  <span className="w-5 h-5 rounded-full bg-brand-sage/30 text-brand-forest text-xs font-semibold flex items-center justify-center flex-shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-stone-700 flex-1 min-w-0 truncate">{f.name}</span>
                  <span className="text-stone-400 tabular-nums text-xs">{f.count}×</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-stone-100 pt-4 text-xs text-stone-400 flex justify-between">
          <span>Nutrition data: Australian Food Composition Database (FSANZ)</span>
          <span>Report generated via Alchemy Meal Builder</span>
        </div>
      </div>
    </div>
  );
}
