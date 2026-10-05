import { endpoint, body, json, ApiError, text } from "@/lib/api";
import { createClient } from "@/lib/supabase/server";
import { isValidEmail, normalizeEmail, passwordError } from "@/lib/validation";
export const POST = endpoint(async (req) => {
  const input = await body(req);
  const name = text(input.name, "Name", 100, true)!;
  const email = normalizeEmail(input.email);
  if (!isValidEmail(email))
    throw new ApiError("Please enter a valid email address.");
  const invalid = passwordError(input.password);
  if (invalid) throw new ApiError(invalid);
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password: input.password as string,
    options: {
      data: { name },
      emailRedirectTo: `${process.env.APP_URL}/auth/confirm`,
    },
  });
  if (error)
    throw new ApiError(
      error.status === 429
        ? "Too many attempts. Try again later."
        : "Unable to register. Check the details or try logging in.",
      error.status === 429 ? 429 : 400,
    );
  return json({
    success: true,
    needsVerification: !data.session,
    emailSent: true,
  });
});
