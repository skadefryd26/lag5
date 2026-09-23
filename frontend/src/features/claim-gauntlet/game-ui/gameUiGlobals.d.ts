// Løs typing for de globale scriptene lastet i index.html (three.js UMD-bygget og
// Gjensidiges spill-UI-bibliotek). Begge er ren JavaScript uten egne typedefinisjoner.
export {};

declare global {
  interface GgGameUiBadgeApi {
    el: HTMLElement;
    pop: () => GgGameUiBadgeApi;
    setKind: (kind: string) => GgGameUiBadgeApi;
    dispose: () => void;
  }

  interface GgGameUiBarApi {
    el: HTMLElement;
    setValue: (value: number) => GgGameUiBarApi;
    getValue: () => number;
    dispose: () => void;
  }

  interface GgGameUi {
    badgeKinds: string[];
    barKinds: string[];
    createBadge: (
      container: HTMLElement,
      opts: {
        kind: string;
        caption?: boolean;
        label?: string;
        autoPop?: boolean;
        delay?: number;
      },
    ) => GgGameUiBadgeApi;
    createStatBar: (
      container: HTMLElement,
      opts: { kind: "health" | "frustration" | "trust"; value?: number; label?: string },
    ) => GgGameUiBarApi;
  }

  interface Window {
    THREE: unknown;
    GjensidigeGameUI: (three: unknown, options?: { palette?: Record<string, string> }) => GgGameUi;
  }
}
