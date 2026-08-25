import { afterEach, describe, expect, it } from "vitest";
import type http from "node:http";
import { createLB6Server } from "../src/interfaces/lb6/LB6Server";
import { PWA_MANIFEST, PWA_SERVICE_WORKER } from "../src/interfaces/lb7/PwaAssets";

let server: http.Server | undefined;
afterEach(async () => {
  if (!server) return;
  await new Promise<void>(resolve => server!.close(() => resolve()));
  server = undefined;
});

async function baseUrl(): Promise<string> {
  server = createLB6Server();
  await new Promise<void>((resolve, reject) => {
    server!.once("error", reject);
    server!.listen(0, "127.0.0.1", () => resolve());
  });
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Servidor de prueba sin puerto TCP.");
  return `http://127.0.0.1:${address.port}`;
}

describe("LB-7 installable PWA", () => {
  it("publishes a standalone manifest and service worker", async () => {
    const base = await baseUrl();
    const manifestResponse = await fetch(`${base}/manifest.webmanifest`);
    expect(manifestResponse.status).toBe(200);
    expect(manifestResponse.headers.get("content-type")).toContain("application/manifest+json");
    const manifest = await manifestResponse.json() as Record<string, unknown>;
    expect(manifest.name).toContain("Contrata-IA");
    expect(manifest.display).toBe("standalone");
    expect(manifest.start_url).toBe("/");

    const swResponse = await fetch(`${base}/sw.js`);
    expect(swResponse.status).toBe(200);
    expect(await swResponse.text()).toContain("contrata-ia-shell-v1");
  });

  it("never includes API or expediente routes in the offline shell", () => {
    expect(PWA_SERVICE_WORKER).toContain("url.pathname.startsWith('/api/')");
    expect(PWA_SERVICE_WORKER).not.toContain("/api/cases");
    expect(PWA_SERVICE_WORKER).not.toContain("questionnaire/import");
    expect(PWA_MANIFEST).not.toContain("token");
  });

  it("links PWA metadata from the responsive application shell", async () => {
    const base = await baseUrl();
    const response = await fetch(base);
    const html = await response.text();
    expect(html).toContain('rel="manifest" href="/manifest.webmanifest"');
    expect(html).toContain("apple-mobile-web-app-capable");
    expect(html).toContain("serviceWorker.register('/sw.js'");
    expect(html).toContain("beforeinstallprompt");
    expect(html).toMatch(/@media\(max-width:\d+px\)/);
  });
});
