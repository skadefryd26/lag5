import { Badge, Card, Group, Text } from "@mantine/core";
import type { ExpertOpinion } from "../../../../../shared/panel.ts";

type Props = { expert: ExpertOpinion; isWinner: boolean };

export function ExpertCard({ expert, isWinner }: Props) {
  return (
    <Card withBorder shadow={isWinner ? "md" : "xs"} padding="lg" radius="md" style={isWinner ? { borderColor: "var(--mantine-color-yellow-6)", borderWidth: 2 } : undefined}>
      <Group justify="space-between" mb="xs">
        <Text fw={700}>{expert.name}</Text>
        {isWinner && <Badge color="yellow">🏆 Bjarnes valg</Badge>}
      </Group>
      <Text size="sm" style={{ whiteSpace: "pre-line" }}>
        {expert.text}
      </Text>
    </Card>
  );
}
