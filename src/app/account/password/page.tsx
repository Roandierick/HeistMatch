import { AuthShell } from "@/components/auth/auth-shell";
import { UpdatePasswordForm } from "@/components/auth/password-forms";
import { requireUser } from "@/lib/auth";
import { pageMetadata } from "@/lib/seo";

// Per-user page: never statically cached.
export const dynamic = "force-dynamic";

export const metadata = pageMetadata({
  title: "Change password",
  description: "Choose a new password for your HeistMatch account.",
  path: "/account/password",
  noindex: true,
});

export default async function PasswordPage() {
  await requireUser("/account/password");
  return (
    <AuthShell title="Choose a new password">
      <UpdatePasswordForm />
    </AuthShell>
  );
}
