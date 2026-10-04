import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  const body = user?.profile
    ? { user: { username: user.profile.username, isAdmin: user.profile.role === "admin" } }
    : { user: null };
  return NextResponse.json(body, { headers: { "Cache-Control": "private, no-store" } });
}
