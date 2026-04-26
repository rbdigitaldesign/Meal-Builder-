import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import type { DailyLog, MealType } from "@/lib/types";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get("clientId");
  const date = searchParams.get("date");

  if (!clientId || !date) {
    return NextResponse.json({ error: "Missing fields." }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("meal_logs")
    .select("meal_type, items")
    .eq("client_id", clientId)
    .eq("date", date);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const log: DailyLog = {
    date,
    meals: { breakfast: null, lunch: null, dinner: null, snack: null },
  };
  for (const row of data ?? []) {
    const mealType = row.meal_type as MealType;
    log.meals[mealType] = { id: mealType, type: mealType, items: row.items };
  }

  return NextResponse.json({ log });
}

export async function POST(req: NextRequest) {
  const { clientId, date, mealType, items } = await req.json();
  if (!clientId || !date || !mealType || !items) {
    return NextResponse.json({ error: "Missing fields." }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { error } = await supabase
    .from("meal_logs")
    .upsert(
      { client_id: clientId, date, meal_type: mealType, items, updated_at: new Date().toISOString() },
      { onConflict: "client_id,date,meal_type" }
    );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
