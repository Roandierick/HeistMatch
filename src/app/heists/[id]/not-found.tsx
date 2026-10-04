import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { LinkButton } from "@/components/ui/button";

export default function HeistNotFound() {
  return (
    <Container className="max-w-2xl py-16">
      <EmptyState
        title="This heist is gone"
        description="The listing was removed or never existed. There are plenty of other crews looking for players."
        action={<LinkButton href="/find">Find Heists</LinkButton>}
      />
    </Container>
  );
}
