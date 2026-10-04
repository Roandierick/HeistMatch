import { AuthShell } from "@/components/auth/auth-shell";
import { ForgotPasswordForm } from "@/components/auth/password-forms";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Reset your password",
  description: "Request a password reset link for your HeistMatch account.",
  path: "/forgot-password",
  noindex: true,
});

export default function ForgotPasswordPage() {
  return (
    <AuthShell title="Reset your password" subtitle="We'll e-mail you a link to choose a new password.">
      <ForgotPasswordForm />
    </AuthShell>
  );
}
