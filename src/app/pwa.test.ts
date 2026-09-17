import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("PWA packaging", () => {
  it("has an installable manifest and self-hosted assets", () => {
    const manifest = JSON.parse(
      readFileSync(resolve("public/manifest.webmanifest"), "utf8"),
    ) as { display: string; start_url: string; icons: unknown[] };

    expect(manifest.display).toBe("standalone");
    expect(manifest.start_url).toBe("/");
    expect(manifest.icons.length).toBeGreaterThan(0);

    const viteConfig = readFileSync(resolve("vite.config.ts"), "utf8");
    expect(viteConfig).toContain("VitePWA");
    expect(viteConfig).toContain("globPatterns");
  });
});
