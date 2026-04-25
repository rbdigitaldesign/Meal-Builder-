import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

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
