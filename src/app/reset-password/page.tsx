import Link from "next/link";
import { cookies } from "next/headers";
import { AuthShell, Notice, btnSecondary } from "../ui";
import { getCurrentUserId } from "@/lib/session";
import ResetForm from "./reset-form";
export default async function ResetPasswordPage() {
  const marker = (await cookies()).get("recovery_verified")?.value;
  if (!marker || !(await getCurrentUserId()))
    return (
      <AuthShell title="Reset link missing">
        <Notice tone="error">
          Use the link from your password reset email.
        </Notice>
        <Link href="/forgot-password" className={`${btnSecondary} mt-4 w-full`}>
          Request a new link
        </Link>
      </AuthShell>
    );
  return (
    <AuthShell title="Choose a new password" subtitle="At least 8 characters.">
      <ResetForm />
    </AuthShell>
  );
}
