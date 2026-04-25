import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const { pin } = await req.json();
  if (!pin || typeof pin !== "string" || !/^\d{4}$/.test(pin)) {
    return NextResponse.json({ error: "Invalid PIN format." }, { status: 400 });
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("SUPABASE_SERVICE_ROLE_KEY is not set");
    return NextResponse.json({ error: "Server configuration error." }, { status: 500 });
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("pin", pin)
    .is("archived_at", null)
    .single();

  if (error) {
    console.error("PIN lookup error:", error.code, error.message);
    return NextResponse.json({ error: "PIN not recognised.", detail: error.message }, { status: 401 });
  }

  if (!data) {
    return NextResponse.json({ error: "PIN not recognised." }, { status: 401 });
  }

  await supabase.from("clients").update({ last_active: new Date().toISOString() }).eq("id", data.id);

  return NextResponse.json({ client: data });
}
