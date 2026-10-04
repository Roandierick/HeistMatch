import { AuthShell } from "@/components/auth/auth-shell";
import { TokenActionForm } from "@/components/newsletter/token-action";
import { confirmNewsletter } from "@/actions/newsletter";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Confirm your subscription",
  description: "Confirm your HeistMatch newsletter subscription.",
  path: "/newsletter/confirm",
  noindex: true,
});

export default async function ConfirmPage({ searchParams }: PageProps<"/newsletter/confirm">) {
  const { token } = await searchParams;
  return (
    <AuthShell title="Confirm your subscription" subtitle="GTA 6 news, heist updates and new guides, straight to your inbox.">
      {typeof token === "string" ? (
        <TokenActionForm action={confirmNewsletter} token={token} label="Yes, subscribe me" />
      ) : (
        <p className="text-muted">This confirmation link is incomplete. Open the link from the e-mail again.</p>
      )}
    </AuthShell>
  );
}
