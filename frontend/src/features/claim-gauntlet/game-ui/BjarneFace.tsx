import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { Box } from "@mantine/core";

export type BjarneFaceHandle = {
  /** Send en tekst til Bjarne, han tolker stemningen selv og lager et ansiktsuttrykk. */
  reactTo: (text: string) => void;
  /** Sett et konkret uttrykk direkte, f.eks. "tenkende" mens vi venter på svar. */
  setExpression: (expression: string) => void;
  /** Bytt Bjarnes hode ut med QR-merket i 10 sekunder, så bytt tilbake selv. */
  showQrBadge: () => void;
};

type BjarneFaceProps = {
  size?: number;
};

const QR_BADGE_MS = 10_000;

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
  const [showQr, setShowQr] = useState(false);
  const qrTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useImperativeHandle(ref, () => ({
    reactTo(text: string) {
      iframeRef.current?.contentWindow?.postMessage({ tekst: text }, "*");
    },
    setExpression(expression: string) {
      iframeRef.current?.contentWindow?.postMessage({ uttrykk: expression }, "*");
    },
    showQrBadge() {
      if (qrTimerRef.current) clearTimeout(qrTimerRef.current);
      setShowQr(true);
      qrTimerRef.current = setTimeout(() => setShowQr(false), QR_BADGE_MS);
    },
  }));

  return (
    <Box
      w={size}
      h={size * 1.15}
      style={{
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {showQr ? (
        // "Meld skade nå!!!" — kunden skal ikke kunne overse hintet. Litt
        // mindre enn boksen, siden merkets navnelapp stikker ut til sidene.
        <qr-merke size={`${Math.round(size * 0.6)}px`} text="Vipps" />
      ) : (
        <iframe
          ref={iframeRef}
          src="/bjarne/bjarne.html"
          title="Bjarnes ansikt"
          style={{ width: "100%", height: "100%", border: "none", pointerEvents: "none" }}
        />
      )}
    </Box>
  );
});
