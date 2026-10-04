import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { SignUpForm } from "@/components/auth/sign-up-form";
import { safeNextPath } from "@/lib/auth";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Create your account",
  description: "Create a free HeistMatch account to host and join GTA 6 heists and build your reputation.",
  path: "/sign-up",
  noindex: true,
});

export default async function SignUpPage({ searchParams }: PageProps<"/sign-up">) {
  const next = safeNextPath((await searchParams).next, "/find");
  return (
    <AuthShell
      title="Create your account"
      subtitle="Free. Takes 30 seconds. Join crews, host heists and build your reputation."
      footer={
        <>
          Already have an account? <Link href={`/sign-in?next=${encodeURIComponent(next)}`} className="font-medium text-fg hover:text-accent">Sign in</Link>
        </>
      }
    >
      <SignUpForm next={next} />
    </AuthShell>
  );
}
