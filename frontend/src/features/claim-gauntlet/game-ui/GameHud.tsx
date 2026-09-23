import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { Group, Stack, Text } from "@mantine/core";

export type GameHudHandle = {
  /** Kalles etter hvert svar fra Bjarne: oppdaterer måleren og feirer/klager med et merke. */
  update: (score: number, resolved: boolean) => void;
};

const NEGATIVE_BADGES = ["thumbDown", "escalation", "repeat", "waiting", "countryside"];
const SHOWN_BADGES = ["thumbDown", "waiting", "escalation", "repeat", "thumbUp", "solved"];

/**
 * Rad med badges og en irritasjonsmåler fra Gjensidiges spill-UI-bibliotek (three.js),
 * plassert under svarfeltet. Måleren følger irritasjonsscoren, badgene poppes når noe skjer.
 */
export const GameHud = forwardRef<GameHudHandle>(function GameHud(_props, ref) {
  const barContainerRef = useRef<HTMLDivElement>(null);
  const badgeRowRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<{
    bar: GgGameUiBarApi | null;
    badges: Record<string, GgGameUiBadgeApi>;
  }>({ bar: null, badges: {} });
  const prevScoreRef = useRef(0);

  useEffect(() => {
    if (typeof window === "undefined" || !window.GjensidigeGameUI) return;
    const ui = window.GjensidigeGameUI(window.THREE, { palette: { navy: "#060948" } });

    if (barContainerRef.current) {
      apiRef.current.bar = ui.createStatBar(barContainerRef.current, {
        kind: "frustration",
        label: "Bjarnes irritasjon",
        value: 0,
      });
    }

    if (badgeRowRef.current) {
      const row = badgeRowRef.current;
      for (const kind of SHOWN_BADGES) {
        const cell = document.createElement("div");
        cell.style.width = "84px";
        row.appendChild(cell);
        apiRef.current.badges[kind] = ui.createBadge(cell, { kind, autoPop: false });
      }
    }

    return () => {
      apiRef.current.bar?.dispose();
      Object.values(apiRef.current.badges).forEach((b) => b.dispose());
      apiRef.current = { bar: null, badges: {} };
    };
  }, []);

  useImperativeHandle(ref, () => ({
    update(score: number, resolved: boolean) {
      const prev = prevScoreRef.current;
      prevScoreRef.current = score;
      apiRef.current.bar?.setValue(Math.min(1, score / 15));

      if (resolved) {
        apiRef.current.badges.solved?.pop();
        apiRef.current.badges.thumbUp?.pop();
        return;
      }
      if (score > prev) {
        const pick = NEGATIVE_BADGES[Math.floor(Math.random() * NEGATIVE_BADGES.length)];
        apiRef.current.badges[pick]?.pop();
      }
    },
  }));

  return (
    <Stack gap={4} mt="md">
      <Text size="xs" c="dimmed">
        Bjarnes humørkart
      </Text>
      <div ref={barContainerRef} style={{ maxWidth: 360 }} />
      <Group ref={badgeRowRef} gap="xs" wrap="wrap" mt={4} />
    </Stack>
  );
});
