import { AuthShell } from "../ui";
import LoginForm from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ verified?: string; reset?: string; error?: string }>;
}) {
  const { verified, reset, error } = await searchParams;
  const notice = error
    ? "This email link is invalid or expired. Please request a new one."
    : verified
      ? "Your email is confirmed. You can log in now."
      : reset
        ? "Your password has been changed. Log in with the new one."
        : null;

  return (
    <AuthShell title="Welcome back" subtitle="Log in to your library.">
      <LoginForm notice={notice} />
    </AuthShell>
  );
}
