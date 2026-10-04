import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProfileForm } from "@/components/account/profile-form";
import { ConsentToggle } from "@/components/account/consent-toggle";
import { DeleteAccountForm } from "@/components/account/delete-account-form";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/actions/auth";
import { pageMetadata } from "@/lib/seo";

// Per-user page: never statically cached.
export const dynamic = "force-dynamic";

export const metadata = pageMetadata({
  title: "Your account",
  description: "Manage your HeistMatch profile, contact handles and e-mail preferences.",
  path: "/account",
  noindex: true,
});

export default async function AccountPage() {
  const user = await requireUser("/account");
  const supabase = await createClient();
  const [{ data: priv }, { data: consent }, { data: myHeists }] = await Promise.all([
    supabase.from("profile_private").select("*").eq("user_id", user.id).maybeSingle(),
    supabase.from("marketing_consents").select("status").eq("user_id", user.id).maybeSingle(),
    supabase.from("heists").select("id, title, status, start_at").eq("host_user_id", user.id).order("created_at", { ascending: false }).limit(10),
  ]);
  const profile = user.profile;

  return (
    <Container className="max-w-3xl pt-8 pb-16">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Your account</h1>
          <p className="mt-1 text-muted">{user.email}</p>
        </div>
        <div className="flex gap-2">
          {profile && (
            <Link href={`/players/${profile.username}`} className="inline-flex h-9 items-center rounded-lg px-3 text-sm text-muted hover:bg-surface-2 hover:text-fg">
              View public profile
            </Link>
          )}
          <form action={signOut}>
            <Button type="submit" variant="secondary" size="sm">Sign out</Button>
          </form>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-6">
        <Card className="p-5 sm:p-6">
          <h2 className="mb-5 text-lg font-semibold">Profile</h2>
          {profile ? (
            <ProfileForm
              initial={{
                username: profile.username,
                platform: profile.platform,
                region: profile.region,
                primary_language: profile.primary_language,
                bio: profile.bio ?? "",
                platform_handle: priv?.platform_handle ?? "",
                discord_handle: priv?.discord_handle ?? "",
              }}
            />
          ) : (
            <p className="text-muted">Your profile is being created. Refresh in a moment.</p>
          )}
        </Card>

        <Card className="p-5 sm:p-6">
          <h2 className="text-lg font-semibold">Your heists</h2>
          {myHeists && myHeists.length > 0 ? (
            <ul className="mt-4 divide-y divide-line">
              {myHeists.map((h) => (
                <li key={h.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <Link href={`/heists/${h.id}`} className="truncate text-fg hover:text-accent">{h.title}</Link>
                  <span className="shrink-0 text-subtle capitalize">{h.status.replace("_", " ")}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-muted">
              You haven&apos;t hosted a heist yet. <Link href="/create" className="text-accent underline">Create one</Link>.
            </p>
          )}
        </Card>

        <Card className="p-5 sm:p-6">
          <h2 className="mb-3 text-lg font-semibold">E-mail preferences</h2>
          <ConsentToggle subscribed={consent?.status === "confirmed"} pending={consent?.status === "pending"} />
        </Card>

        <Card className="p-5 sm:p-6">
          <h2 className="mb-3 text-lg font-semibold">Security</h2>
          <Link href="/account/password" className="text-sm text-accent hover:text-accent-strong">Change password</Link>
          <div className="mt-6 border-t border-line pt-5">
            {profile && <DeleteAccountForm username={profile.username} />}
          </div>
        </Card>
      </div>
    </Container>
  );
}
