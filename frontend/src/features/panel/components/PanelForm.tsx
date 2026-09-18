import { Button, Group, Textarea } from "@mantine/core";
import { useState } from "react";
import { exampleClaims } from "../examples.ts";

type Props = { onSubmit: (claim: string) => void; isLoading: boolean };

export function PanelForm({ onSubmit, isLoading }: Props) {
  const [claim, setClaim] = useState("");

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(claim.trim());
      }}
    >
      <Textarea
        label="Lim inn skademeldingen"
        placeholder="Kunden skriver …"
        autosize
        minRows={5}
        maxLength={4000}
        value={claim}
        onChange={(event) => setClaim(event.currentTarget.value)}
      />
      <Group mt="sm" justify="space-between">
        <Group gap="xs">
          {exampleClaims.map((example) => (
            <Button key={example.title} variant="subtle" size="xs" onClick={() => setClaim(example.claim)}>
              {example.title}
            </Button>
          ))}
        </Group>
        <Button type="submit" disabled={!claim.trim()} loading={isLoading}>
          Kall inn panelet
        </Button>
      </Group>
    </form>
  );
}
