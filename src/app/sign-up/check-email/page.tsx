import { AuthShell } from "@/components/auth/auth-shell";
import { ResendVerificationForm } from "@/components/auth/resend-verification-form";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Check your e-mail",
  description: "Verify your e-mail address to activate your HeistMatch account.",
  path: "/sign-up/check-email",
  noindex: true,
});

export default async function CheckEmailPage({ searchParams }: PageProps<"/sign-up/check-email">) {
  const { email } = await searchParams;
  const valid = typeof email === "string" && email.length < 255;
  const address = valid ? email : "your inbox";
  return (
    <AuthShell title="Check your e-mail" subtitle="One last step.">
      <p className="text-muted">
        We sent a verification link to <span className="font-medium text-fg">{address}</span>. Click it to activate your account and start
        finding heists.
      </p>
      <p className="mt-4 text-sm text-subtle">Nothing there after a few minutes? Check your spam folder, or send it again.</p>
      {valid && (
        <div className="mt-4">
          <ResendVerificationForm email={email} />
        </div>
      )}
    </AuthShell>
  );
}
