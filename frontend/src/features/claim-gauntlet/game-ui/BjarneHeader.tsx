import { useEffect, useRef } from "react";
import "./BjarneHeader.css";

/**
 * Gjensidiges Bjarne-header: en tegneserieaktig maskott-badge, en tittel som
 * spretter inn bokstav for bokstav, og noen bakgrunnsbadges. Erstatter den
 * tekstbaserte headeren (avatar + tittel + undertekst).
 *
 * Portert fra den ferdige HTML/CSS/JS-referansen — DOM-bygging og animasjon
 * skjer i vanlig JS (ikke React state), akkurat som i kilden, siden alt
 * kommer fra Gjensidiges spill-UI-bibliotek (three.js).
 */
export function BjarneHeader() {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const mascotRef = useRef<HTMLDivElement>(null);
  const toastRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const title = titleRef.current;
    if (!title) return;

    // Del tittelen opp i bokstaver for den sprettende inngangen.
    let i = 0;
    title.innerHTML = title.textContent!
      .split(" ")
      .map(
        (word) =>
          `<span class="bjarne-header__word" aria-hidden="true">${word
            .split("")
            .map(
              (ch) =>
                `<span class="bjarne-header__char" style="animation-delay:${(0.15 + i++ * 0.035).toFixed(3)}s">${ch}</span>`,
            )
            .join("")}</span>`,
      )
      .join(" ");

    if (typeof window === "undefined" || !window.GjensidigeGameUI) return;
    let ui;
    try {
      ui = window.GjensidigeGameUI(window.THREE);
    } catch {
      return;
    }

    const disposers: Array<() => void> = [];

    const bjarne = mascotRef.current
      ? ui.createBadge(mascotRef.current, { kind: "bjarne", caption: false, delay: 250 })
      : null;
    if (bjarne) disposers.push(bjarne.dispose);

    // Klikk på Bjarne: tittelen bølger. Klikker du for mye, går han tom for kaffe.
    const toast = toastRef.current;
    let clicks = 0;
    let timer: ReturnType<typeof setTimeout>;
    function say(text: string) {
      if (!toast) return;
      toast.textContent = text;
      toast.classList.add("is-on");
      clearTimeout(timer);
      timer = setTimeout(() => toast.classList.remove("is-on"), 2600);
    }
    function onMascotClick() {
      clicks++;
      title!.classList.remove("is-wave");
      void title!.offsetWidth;
      title!.classList.add("is-wave");
      const u = bjarne?.emblem().userData as { cups?: number } | undefined;
      if (!u) return;
      if (clicks === 5) {
        u.cups = 0;
        say("0x000000CF · BJARNE_NO_COFFEE_FOUND");
      } else if (clicks > 5 && clicks % 3 === 0) {
        u.cups = 1;
        say("Påfyll funnet. Fortsett.");
      }
    }
    bjarne?.el.addEventListener("click", onMascotClick);

    const chars = title.querySelectorAll(".bjarne-header__char");
    const lastChar = chars[chars.length - 1];
    function onAnimEnd(e: AnimationEvent) {
      if (e.animationName === "bh-wave" && e.target === lastChar) {
        title!.classList.remove("is-wave");
      }
    }
    title.addEventListener("animationend", onAnimEnd as EventListener);

    return () => {
      bjarne?.el.removeEventListener("click", onMascotClick);
      title.removeEventListener("animationend", onAnimEnd as EventListener);
      clearTimeout(timer);
      disposers.forEach((d) => d());
    };
  }, []);

  return (
    <header className="bjarne-header">
      <div className="bjarne-header__inner">
        <div className="bjarne-header__mascot" ref={mascotRef} title="Bjarne" />
        <div style={{ minWidth: 0 }}>
          <h1
            className="bjarne-header__title"
            ref={titleRef}
            aria-label="Bjarnes Erstatningsprøvelse"
          >
            Bjarnes Erstatningsprøvelse
          </h1>
          <p className="bjarne-header__tag">Meld en skade. Om du tør.</p>
        </div>
      </div>
      <div className="bjarne-header__toast" ref={toastRef} role="status" />
    </header>
  );
}
