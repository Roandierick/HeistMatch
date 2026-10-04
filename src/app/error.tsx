"use client";

import { useEffect } from "react";
import { Container } from "@/components/ui/container";
import { Button, LinkButton } from "@/components/ui/button";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <Container className="max-w-2xl py-20 text-center">
      <h1 className="text-3xl font-semibold tracking-tight">Something went wrong</h1>
      <p className="mt-3 text-muted">An unexpected error occurred. Try again, or head back to the finder.</p>
      {error.digest && <p className="mt-2 font-mono text-xs text-subtle">Ref: {error.digest}</p>}
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button onClick={reset}>Try again</Button>
        <LinkButton href="/find" variant="secondary">Find Heists</LinkButton>
      </div>
    </Container>
  );
}
