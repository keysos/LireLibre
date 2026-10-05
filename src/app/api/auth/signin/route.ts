import { endpoint, body, json, ApiError } from "@/lib/api";
import { createClient } from "@/lib/supabase/server";
import { isValidEmail, normalizeEmail } from "@/lib/validation";
export const POST = endpoint(async (req) => {
  const input = await body(req);
  const email = normalizeEmail(input.email);
  if (!isValidEmail(email) || typeof input.password !== "string")
    throw new ApiError("Invalid credentials", 401);
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: input.password,
  });
  if (error)
    return json(
      {
        error:
          error.code === "email_not_confirmed"
            ? "Please confirm your email."
            : "Invalid credentials",
        code:
          error.code === "email_not_confirmed"
            ? "email_not_verified"
            : undefined,
      },
      error.status === 429 ? 429 : 401,
    );
  return json({ success: true });
});
