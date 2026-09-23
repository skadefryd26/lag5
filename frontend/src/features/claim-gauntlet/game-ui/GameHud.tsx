import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { Group } from "@mantine/core";

export type GameHudHandle = {
  /** Kalles når en melding sendes: starter to-sekunders-teller til timeglass-badgen. */
  onSend: () => void;
  /** Kalles når Bjarne har svart: avbryter tellingen, oppdaterer sliderne og popper detektiv-badgen. */
  onReply: (score: number, energyScore: number, resolved: boolean) => void;
  /** Kalles med antall meldinger kunden har sendt: viser "På rad" på 3, 6, 9 osv. */
  onUserMessageCount: (count: number) => void;
};

const DETECTIVE_VISIBLE_MS = 10_000;
const STREAK_VISIBLE_MS = 20_000;

/**
 * Slidere (irritasjon, meningen med livet, energi) med badges ved siden av,
 * fra Gjensidiges spill-UI-bibliotek (three.js). Plasseres mellom
 * dialogboksen og inputfeltet.
 */
export const GameHud = forwardRef<GameHudHandle>(function GameHud(_props, ref) {
  const barContainerRef = useRef<HTMLDivElement>(null);
  const meaningBarContainerRef = useRef<HTMLDivElement>(null);
  const energyBarContainerRef = useRef<HTMLDivElement>(null);
  const waitingCellRef = useRef<HTMLDivElement>(null);
  const detectiveCellRef = useRef<HTMLDivElement>(null);
  const countrysideCellRef = useRef<HTMLDivElement>(null);
  const streakCellRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<{
    bar: GgGameUiBarApi | null;
    meaningBar: GgGameUiBarApi | null;
    energyBar: GgGameUiBarApi | null;
    waiting: GgGameUiBadgeApi | null;
    detective: GgGameUiBadgeApi | null;
    countryside: GgGameUiBadgeApi | null;
    streak: GgGameUiBadgeApi | null;
  }>({
    bar: null,
    meaningBar: null,
    energyBar: null,
    waiting: null,
    detective: null,
    countryside: null,
    streak: null,
  });
  const waitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const detectiveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const streakTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const replyCountRef = useRef(0);

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
    if (meaningBarContainerRef.current) {
      // En helt overflødig, men interaktiv måler — Bjarnes bidrag til filosofien.
      apiRef.current.meaningBar = ui.createStatBar(meaningBarContainerRef.current, {
        kind: "trust",
        label: "Meningen med livet",
        value: 0.42,
        interactive: true,
      });
    }
    if (energyBarContainerRef.current) {
      apiRef.current.energyBar = ui.createStatBar(energyBarContainerRef.current, {
        kind: "battery",
        label: "Bjarnes energi",
        value: 1,
      });
    }
    if (waitingCellRef.current) {
      apiRef.current.waiting = ui.createBadge(waitingCellRef.current, {
        kind: "waiting",
        caption: false,
        autoPop: false,
      });
      apiRef.current.waiting.el.style.visibility = "hidden";
    }
    if (detectiveCellRef.current) {
      apiRef.current.detective = ui.createBadge(detectiveCellRef.current, {
        kind: "detective",
        caption: false,
        autoPop: false,
      });
      // Rent dekorativt — skal ikke kunne klikkes eller poppes av deltakeren.
      apiRef.current.detective.el.style.pointerEvents = "none";
      apiRef.current.detective.el.style.visibility = "hidden";
    }
    if (countrysideCellRef.current) {
      apiRef.current.countryside = ui.createBadge(countrysideCellRef.current, {
        kind: "countryside",
        caption: false,
        autoPop: false,
      });
      apiRef.current.countryside.el.style.visibility = "hidden";
    }
    if (streakCellRef.current) {
      apiRef.current.streak = ui.createBadge(streakCellRef.current, {
        kind: "streak",
        caption: false,
        autoPop: false,
      });
      apiRef.current.streak.el.style.visibility = "hidden";
    }

    return () => {
      if (waitTimerRef.current) clearTimeout(waitTimerRef.current);
      if (detectiveTimerRef.current) clearTimeout(detectiveTimerRef.current);
      if (streakTimerRef.current) clearTimeout(streakTimerRef.current);
      apiRef.current.bar?.dispose();
      apiRef.current.meaningBar?.dispose();
      apiRef.current.energyBar?.dispose();
      apiRef.current.waiting?.dispose();
      apiRef.current.detective?.dispose();
      apiRef.current.countryside?.dispose();
      apiRef.current.streak?.dispose();
      apiRef.current = {
        bar: null,
        meaningBar: null,
        energyBar: null,
        waiting: null,
        detective: null,
        countryside: null,
        streak: null,
      };
    };
  }, []);

  useImperativeHandle(ref, () => ({
    onSend() {
      if (waitTimerRef.current) clearTimeout(waitTimerRef.current);
      waitTimerRef.current = setTimeout(() => {
        const el = apiRef.current.waiting?.el;
        if (el) el.style.visibility = "visible";
        apiRef.current.waiting?.pop();
      }, 2000);
    },
    onReply(score: number, energyScore: number, resolved: boolean) {
      if (waitTimerRef.current) {
        clearTimeout(waitTimerRef.current);
        waitTimerRef.current = null;
      }
      const el = apiRef.current.waiting?.el;
      if (el) el.style.visibility = "hidden";

      apiRef.current.bar?.setValue(Math.min(1, score / 15));
      apiRef.current.energyBar?.setValue(Math.max(0, Math.min(1, energyScore / 100)));

      const detectiveEl = apiRef.current.detective?.el;
      if (detectiveEl) detectiveEl.style.visibility = "visible";
      apiRef.current.detective?.pop();
      if (detectiveTimerRef.current) clearTimeout(detectiveTimerRef.current);
      detectiveTimerRef.current = setTimeout(() => {
        if (detectiveEl) detectiveEl.style.visibility = "hidden";
      }, DETECTIVE_VISIBLE_MS);

      replyCountRef.current += 1;
      if (replyCountRef.current % 2 === 0) {
        const countrysideEl = apiRef.current.countryside?.el;
        if (countrysideEl) countrysideEl.style.visibility = "visible";
        apiRef.current.countryside?.pop();
      }

      if (resolved) {
        apiRef.current.bar?.setValue(0);
        apiRef.current.energyBar?.setValue(1);
      }
    },
    onUserMessageCount(count: number) {
      if (count === 0 || count % 3 !== 0) return;
      const el = apiRef.current.streak?.el;
      if (el) el.style.visibility = "visible";
      apiRef.current.streak?.pop();
      if (streakTimerRef.current) clearTimeout(streakTimerRef.current);
      streakTimerRef.current = setTimeout(() => {
        if (el) el.style.visibility = "hidden";
      }, STREAK_VISIBLE_MS);
    },
  }));

  return (
    <div style={{ margin: "16px 0" }}>
      <Group align="center" gap="md" wrap="nowrap">
        <div ref={barContainerRef} style={{ flex: "1 1 0", minWidth: 0 }} />
        <div ref={meaningBarContainerRef} style={{ flex: "1 1 0", minWidth: 0 }} />
        <div ref={energyBarContainerRef} style={{ flex: "1 1 0", minWidth: 0 }} />
      </Group>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 8,
          marginTop: 4,
        }}
      >
        <div ref={waitingCellRef} style={{ width: 84, flexShrink: 0 }} />
        <div ref={detectiveCellRef} style={{ width: 84, flexShrink: 0 }} />
        <div ref={countrysideCellRef} style={{ width: 84, flexShrink: 0 }} />
        <div ref={streakCellRef} style={{ width: 84, flexShrink: 0 }} />
      </div>
    </div>
  );
});
