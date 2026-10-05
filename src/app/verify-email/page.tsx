import Link from "next/link";
import { AuthShell, Notice, btnSecondary } from "../ui";
export default function VerifyEmailPage() {
  return (
    <AuthShell title="Confirm your email">
      <Notice tone="info">
        Use the confirmation link sent by Supabase. Old confirmation links no
        longer work.
      </Notice>
      <Link href="/login" className={`${btnSecondary} mt-4 w-full`}>
        Log in or resend confirmation
      </Link>
    </AuthShell>
  );
}
