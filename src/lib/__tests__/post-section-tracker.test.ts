import { describe, expect, it } from "vitest";
import { resolveActiveSection, sectionText } from "../post-section-tracker";

function heading(text: string, top: number): Element {
  return {
    textContent: text,
    getBoundingClientRect: () => ({ top, bottom: top + 20, left: 0, right: 0, width: 0, height: 20 }),
  } as Element;
}

describe("resolveActiveSection", () => {
  it("returns first heading before offset", () => {
    const headings = [heading("서론", 200), heading("본론", 400)];
    expect(resolveActiveSection(headings)).toBe("서론");
  });

  it("returns latest heading above offset", () => {
    const headings = [heading("서론", 50), heading("본론", 100), heading("결론", 300)];
    expect(resolveActiveSection(headings)).toBe("본론");
  });

  it("returns null for empty list", () => {
    expect(resolveActiveSection([])).toBeNull();
  });
});

describe("sectionText", () => {
  it("trims heading text", () => {
    expect(sectionText({ textContent: "  A  " } as Element)).toBe("A");
  });
});
