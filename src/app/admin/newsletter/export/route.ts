import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function csvCell(value: string | null) {
  const v = value ?? "";
  // Neutralise spreadsheet formula injection.
  const safe = /^[=+\-@\t\r]/.test(v) ? `'${v}` : v;
  return `"${safe.replace(/"/g, '""')}"`;
}

/** Confirmed subscribers only, with unsubscribe tokens for the e-mail tool. */
export async function GET() {
  const user = await getCurrentUser();
  if (user?.profile?.role !== "admin") return new NextResponse("Not found", { status: 404 });
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("marketing_consents")
    .select("email, consent_version, source, confirmed_at, unsubscribe_token")
    .eq("status", "confirmed")
    .order("confirmed_at", { ascending: true })
    .limit(100_000);
  if (error) return new NextResponse("Export failed", { status: 500 });

  const lines = [
    "email,consent_version,source,confirmed_at,unsubscribe_token",
    ...data.map((r) => [r.email, r.consent_version, r.source, r.confirmed_at, r.unsubscribe_token].map(csvCell).join(",")),
  ];
  return new NextResponse(lines.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="heistmatch-subscribers-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "private, no-store",
    },
  });
}
