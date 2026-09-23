import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { Group } from "@mantine/core";

export type GameHudHandle = {
  /** Kalles når en melding sendes: starter to-sekunders-teller til timeglass-badgen. */
  onSend: () => void;
  /** Kalles når Bjarne har svart: avbryter tellingen, oppdaterer sliden og popper detektiv-badgen. */
  onReply: (score: number, resolved: boolean) => void;
};

/**
 * Slider (irritasjonsmåler) med to badges ved siden av, fra Gjensidiges spill-UI-bibliotek
 * (three.js). Plasseres mellom dialogboksen og inputfeltet.
 */
export const GameHud = forwardRef<GameHudHandle>(function GameHud(_props, ref) {
  const barContainerRef = useRef<HTMLDivElement>(null);
  const meaningBarContainerRef = useRef<HTMLDivElement>(null);
  const waitingCellRef = useRef<HTMLDivElement>(null);
  const detectiveCellRef = useRef<HTMLDivElement>(null);
  const countrysideCellRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<{
    bar: GgGameUiBarApi | null;
    meaningBar: GgGameUiBarApi | null;
    waiting: GgGameUiBadgeApi | null;
    detective: GgGameUiBadgeApi | null;
    countryside: GgGameUiBadgeApi | null;
  }>({ bar: null, meaningBar: null, waiting: null, detective: null, countryside: null });
  const waitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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
    }
    if (countrysideCellRef.current) {
      apiRef.current.countryside = ui.createBadge(countrysideCellRef.current, {
        kind: "countryside",
        caption: false,
        autoPop: false,
      });
      apiRef.current.countryside.el.style.visibility = "hidden";
    }

    return () => {
      if (waitTimerRef.current) clearTimeout(waitTimerRef.current);
      apiRef.current.bar?.dispose();
      apiRef.current.meaningBar?.dispose();
      apiRef.current.waiting?.dispose();
      apiRef.current.detective?.dispose();
      apiRef.current.countryside?.dispose();
      apiRef.current = { bar: null, meaningBar: null, waiting: null, detective: null, countryside: null };
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
    onReply(score: number, resolved: boolean) {
      if (waitTimerRef.current) {
        clearTimeout(waitTimerRef.current);
        waitTimerRef.current = null;
      }
      const el = apiRef.current.waiting?.el;
      if (el) el.style.visibility = "hidden";

      apiRef.current.bar?.setValue(Math.min(1, score / 15));
      apiRef.current.detective?.pop();

      replyCountRef.current += 1;
      if (replyCountRef.current % 2 === 0) {
        const countrysideEl = apiRef.current.countryside?.el;
        if (countrysideEl) countrysideEl.style.visibility = "visible";
        apiRef.current.countryside?.pop();
      }

      if (resolved) apiRef.current.bar?.setValue(0);
    },
  }));

  return (
    <Group align="center" gap="md" my="md" wrap="wrap" style={{ width: "100%" }}>
      <div ref={barContainerRef} style={{ minWidth: 0, maxWidth: 280, flex: "1 1 140px" }} />
      <div ref={meaningBarContainerRef} style={{ minWidth: 0, maxWidth: 280, flex: "1 1 140px" }} />
      <div ref={waitingCellRef} style={{ width: "clamp(56px, 8vw, 84px)", flexShrink: 0 }} />
      <div ref={detectiveCellRef} style={{ width: "clamp(56px, 8vw, 84px)", flexShrink: 0 }} />
      <div ref={countrysideCellRef} style={{ width: "clamp(56px, 8vw, 84px)", flexShrink: 0 }} />
    </Group>
  );
});
