import Link from "next/link";
import { Container } from "@/components/ui/container";
import { LinkButton } from "@/components/ui/button";

export default function NotFound() {
  return (
    <Container className="max-w-2xl py-20 text-center">
      <p className="font-mono text-sm text-accent">404</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">This page went dark</h1>
      <p className="mt-3 text-muted">The page you&apos;re looking for doesn&apos;t exist or was moved.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <LinkButton href="/find">Find Heists</LinkButton>
        <LinkButton href="/" variant="secondary">Home</LinkButton>
      </div>
      <p className="mt-8 text-sm text-subtle">
        Looking for guides? <Link href="/blog" className="text-accent underline">Browse the blog</Link>.
      </p>
    </Container>
  );
}
