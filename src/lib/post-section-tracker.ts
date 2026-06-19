const SECTION_SELECTOR = ".markdown-viewer h2, .markdown-viewer h3";

export function sectionText(el: Element): string {
  return el.textContent?.trim() ?? "";
}

/** 스크롤 위치 기준 현재 읽는 섹션 제목 */
export function resolveActiveSection(headings: Element[], offset = 120): string | null {
  if (headings.length === 0) return null;

  let active: Element | null = headings[0] ?? null;
  for (const heading of headings) {
    const top = heading.getBoundingClientRect().top;
    if (top <= offset) active = heading;
    else break;
  }

  return active ? sectionText(active) : null;
}

export function observeMarkdownSections(onChange: (title: string | null) => void): () => void {
  if (typeof window === "undefined") return () => {};

  let headings = [...document.querySelectorAll(SECTION_SELECTOR)];

  const update = () => {
    headings = [...document.querySelectorAll(SECTION_SELECTOR)];
    onChange(resolveActiveSection(headings));
  };

  update();

  const onScroll = () => update();
  window.addEventListener("scroll", onScroll, { passive: true });
  document.addEventListener("astro:page-load", update);

  return () => {
    window.removeEventListener("scroll", onScroll);
    document.removeEventListener("astro:page-load", update);
  };
}

export function setContraFirstMode(enabled: boolean): void {
  document.documentElement.classList.toggle("jiin-contra-first", enabled);
}
