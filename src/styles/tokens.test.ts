import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const tokens = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "tokens.css"), "utf8");

describe("classical tokens", () => {
  it("exposes the design-system color, type, space, radius, and shadow tokens", () => {
    expect(tokens).toContain("--color-bg: #f3f2f2");
    expect(tokens).toContain("--color-accent: #b68235");
    expect(tokens).toContain('--font-heading: "Cormorant Garamond"');
    expect(tokens).toContain('--font-body: "Lora"');
    expect(tokens).toContain("--font-gothic:");
    expect(tokens).toContain("--color-won: #2563eb");
    expect(tokens).toContain("--color-lost: #dc2626");
    expect(tokens).toContain("--space-4:");
    expect(tokens).toContain("--radius-md: 4px");
    expect(tokens).toContain("--shadow-lg:");
  });

  it("self-hosts heading and body fonts", () => {
    expect(tokens).toContain("@fontsource/cormorant-garamond");
    expect(tokens).toContain("@fontsource/lora");
  });

  it("fills won and lost scoring actions and uses gothic for undo", () => {
    const scoring = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "scoring.css"), "utf8");

    expect(scoring).toContain("background: var(--color-won)");
    expect(scoring).toContain("background: var(--color-lost)");
    expect(scoring).toContain("color: #fff");
    expect(scoring).toMatch(/\.utility-grid \.btn\s*\{[^}]*font-family:\s*var\(--font-gothic\)/);
    expect(scoring).toMatch(/\.summary-screen\s*\{[^}]*font-family:\s*var\(--font-gothic\)/);
  });

  it("draws primary buttons as outlines, not fills", () => {
    expect(tokens).toMatch(/\.btn-primary\s*\{[^}]*background:\s*transparent/);
    expect(tokens).toMatch(/\.btn-primary\s*\{[^}]*border-color:\s*var\(--color-accent\)/);
  });
});
