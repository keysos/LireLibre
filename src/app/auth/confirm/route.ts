import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
export async function GET(request: NextRequest) {
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const type = request.nextUrl.searchParams.get("type");
  const base = process.env.APP_URL!;
  if (
    !tokenHash ||
    (type !== "email" && type !== "recovery" && type !== "invite")
  )
    return NextResponse.redirect(new URL("/login?error=invalid-link", base));
  const supabase = await createClient();
  const { data, error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type,
  });
  const response = NextResponse.redirect(
    new URL(
      error
        ? "/login?error=expired-link"
        : type === "recovery" || type === "invite"
          ? "/reset-password"
          : "/books",
      base,
    ),
  );
  response.headers.set("Cache-Control", "private, no-store");
  // Bind the recovery marker to this specific Supabase session.
  // It is only a UI-flow gate; identity is still validated by Supabase.
  if (!error && (type === "recovery" || type === "invite") && data.session)
    response.cookies.set("recovery_verified", data.session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 600,
    });
  return response;
}
