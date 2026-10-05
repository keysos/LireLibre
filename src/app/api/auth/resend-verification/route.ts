import { endpoint, body, json, ApiError } from "@/lib/api";
import { createClient } from "@/lib/supabase/server";
import { isValidEmail, normalizeEmail } from "@/lib/validation";
export const POST = endpoint(async (req) => {
  const input = await body(req);
  const email = normalizeEmail(input.email);
  if (!isValidEmail(email))
    throw new ApiError("Please enter a valid email address.");
  const supabase = await createClient();
  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: { emailRedirectTo: `${process.env.APP_URL}/auth/confirm` },
  });
  if (error?.status === 429)
    throw new ApiError("Too many attempts. Try again later.", 429);
  if (error && error.status && error.status >= 500)
    throw new ApiError("Email service unavailable. Try again later.", 503);
  return json({ success: true });
});
