import { forwardRef, useImperativeHandle, useRef } from "react";
import { Box } from "@mantine/core";

export type BjarneFaceHandle = {
  /** Send en tekst til Bjarne, han tolker stemningen selv og lager et ansiktsuttrykk. */
  reactTo: (text: string) => void;
  /** Sett et konkret uttrykk direkte, f.eks. "tenkende" mens vi venter på svar. */
  setExpression: (expression: string) => void;
};

/**
 * Bjarnes ansikt, gjengitt i en iframe fra den ferdige three.js-figuren i public/bjarne.
 * Panelet er skjult (ui=0) — vi styrer ansiktet utelukkende med postMessage.
 */
export const BjarneFace = forwardRef<BjarneFaceHandle>(function BjarneFace(_props, ref) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useImperativeHandle(ref, () => ({
    reactTo(text: string) {
      iframeRef.current?.contentWindow?.postMessage({ tekst: text }, "*");
    },
    setExpression(expression: string) {
      iframeRef.current?.contentWindow?.postMessage({ uttrykk: expression }, "*");
    },
  }));

  function hideChrome() {
    const doc = iframeRef.current?.contentDocument;
    if (!doc || doc.getElementById("ggui-hide-chrome")) return;
    const style = doc.createElement("style");
    style.id = "ggui-hide-chrome";
    style.textContent = ".tag, .topright { display: none !important; }";
    doc.head.appendChild(style);
  }

  return (
    <Box
      w={140}
      h={170}
      style={{
        flexShrink: 0,
        borderRadius: "var(--mantine-radius-md)",
        overflow: "hidden",
        border: "1px solid var(--mantine-color-dark-4)",
        background: "#060b2e",
      }}
    >
      <iframe
        ref={iframeRef}
        src="/bjarne/bjarne.html?ui=0&bg=060b2e"
        title="Bjarnes ansikt"
        onLoad={hideChrome}
        style={{ width: "100%", height: "100%", border: "none", pointerEvents: "none" }}
      />
    </Box>
  );
});
