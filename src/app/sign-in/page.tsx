import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { SignInForm } from "@/components/auth/sign-in-form";
import { FormMessage } from "@/components/ui/form";
import { safeNextPath } from "@/lib/auth";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Sign in",
  description: "Sign in to HeistMatch to join and create GTA 6 heists.",
  path: "/sign-in",
  noindex: true,
});

export default async function SignInPage({ searchParams }: PageProps<"/sign-in">) {
  const params = await searchParams;
  const next = safeNextPath(params.next, "/find");
  return (
    <AuthShell
      title="Sign in"
      subtitle="Welcome back. Your crew is waiting."
      footer={
        <>
          New to HeistMatch? <Link href={`/sign-up?next=${encodeURIComponent(next)}`} className="font-medium text-fg hover:text-accent">Create an account</Link>
        </>
      }
    >
      {params.error === "link" && (
        <div className="mb-4">
          <FormMessage message="That link is invalid or has expired. Sign in or request a new link." />
        </div>
      )}
      <SignInForm next={next} />
    </AuthShell>
  );
}
