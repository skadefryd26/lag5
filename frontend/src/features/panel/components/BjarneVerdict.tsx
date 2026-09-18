import { Card, Text, Title } from "@mantine/core";
import type { BjarneVerdict as Verdict } from "../../../../../shared/panel.ts";

type Props = { verdict: Verdict; winnerName: string };

export function BjarneVerdict({ verdict, winnerName }: Props) {
  return (
    <Card withBorder padding="lg" radius="md" bg="var(--mantine-color-default-hover)">
      <Title order={3} mb="xs">
        ☕ Bjarne, ordstyrer mot sin vilje
      </Title>
      <Text fs="italic" c="dimmed" mb="sm">
        {verdict.sigh}
      </Text>
      <Text fw={700} mb="xs">
        Vinner: {winnerName}
      </Text>
      <Text style={{ whiteSpace: "pre-line" }}>{verdict.verdict}</Text>
    </Card>
  );
}
