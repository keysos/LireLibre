import { endpoint, body, json, ApiError, authenticated } from "@/lib/api";
import { passwordError } from "@/lib/validation";
import { cookies } from "next/headers";
export const POST = endpoint(async (req) => {
  const { supabase } = await authenticated();
  const marker = (await cookies()).get("recovery_verified")?.value;
  if (!marker) throw new ApiError("Reset link is missing or expired", 403);
  // Verify the recovery token with Auth, not by decoding it ourselves.
  const { data, error: tokenError } = await supabase.auth.getUser(marker);
  const { data: current } = await supabase.auth.getUser();
  if (tokenError || !data.user || data.user.id !== current.user?.id)
    throw new ApiError("Reset link is invalid or expired", 403);
  const input = await body(req);
  const invalid = passwordError(input.password);
  if (invalid) throw new ApiError(invalid);
  const { error } = await supabase.auth.updateUser({
    password: input.password as string,
  });
  if (error)
    throw new ApiError(
      "Unable to update password. Check the password requirements.",
    );
  await supabase.auth.signOut({ scope: "global" });
  const response = json({ success: true });
  response.cookies.delete("recovery_verified");
  return response;
});
