import { AuthShell } from "@/components/auth/auth-shell";
import { TokenActionForm } from "@/components/newsletter/token-action";
import { unsubscribeNewsletter } from "@/actions/newsletter";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Unsubscribe",
  description: "Unsubscribe from HeistMatch e-mails.",
  path: "/unsubscribe",
  noindex: true,
});

export default async function UnsubscribePage({ searchParams }: PageProps<"/unsubscribe">) {
  const { token } = await searchParams;
  return (
    <AuthShell title="Unsubscribe" subtitle="Stop receiving HeistMatch news and marketing e-mails.">
      {typeof token === "string" ? (
        <TokenActionForm action={unsubscribeNewsletter} token={token} label="Unsubscribe" />
      ) : (
        <p className="text-muted">This unsubscribe link is incomplete. Use the link from one of our e-mails, or manage preferences in your account.</p>
      )}
    </AuthShell>
  );
}
