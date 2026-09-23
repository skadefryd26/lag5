import { forwardRef, useImperativeHandle, useRef } from "react";
import { Box } from "@mantine/core";

export type BjarneFaceHandle = {
  /** Send en tekst til Bjarne, han tolker stemningen selv og lager et ansiktsuttrykk. */
  reactTo: (text: string) => void;
  /** Sett et konkret uttrykk direkte, f.eks. "tenkende" mens vi venter på svar. */
  setExpression: (expression: string) => void;
};

type BjarneFaceProps = {
  size?: number;
};

/**
 * Bjarnes ansikt, gjengitt i en iframe fra den ferdige three.js-figuren i public/bjarne.
 * Kontrollpanelet og navnelappen er skjult direkte i selve filen (embed-bruk) — vi styrer
 * ansiktet utelukkende med postMessage.
 */
export const BjarneFace = forwardRef<BjarneFaceHandle, BjarneFaceProps>(function BjarneFace(
  { size = 280 },
  ref,
) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useImperativeHandle(ref, () => ({
    reactTo(text: string) {
      iframeRef.current?.contentWindow?.postMessage({ tekst: text }, "*");
    },
    setExpression(expression: string) {
      iframeRef.current?.contentWindow?.postMessage({ uttrykk: expression }, "*");
    },
  }));

  return (
    <Box
      w={size}
      h={size * 1.15}
      style={{
        flexShrink: 0,
        overflow: "hidden",
      }}
    >
      <iframe
        ref={iframeRef}
        src="/bjarne/bjarne.html"
        title="Bjarnes ansikt"
        style={{ width: "100%", height: "100%", border: "none", pointerEvents: "none" }}
      />
    </Box>
  );
});
