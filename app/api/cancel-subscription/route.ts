import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(req: NextRequest) {
  const { userId, plan } = await req.json();
  if (!userId || !plan) {
    return NextResponse.json({ error: "Missing userId or plan" }, { status: 400 });
  }
  const { error } = await supabase
    .from("subscriptions")
    .update({ status: "canceled", end_date: new Date().toISOString() })
    .eq("user_id", userId)
    .eq("plan", plan)
    .eq("status", "active");
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
} 