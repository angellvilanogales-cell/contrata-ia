import { describe, expect, it } from "vitest";
import { SecurityPolicy } from "../src/interfaces/lb7/SecurityPolicy";
import { createLB6Server } from "../src/interfaces/lb6/LB6Server";
import { createLB103AuthoritativeServer } from "../src/interfaces/lb103/LB103AuthoritativeServer";

describe("LB-108 acceso nominativo al expediente adaptativo", () => {
  it("crea una sesión segura desde usuario y contraseña sin exponer el token interno", () => {
    const internalToken = "token-interno-usuario-0001";
    const policy = new SecurityPolicy({
      NODE_ENV: "production",
      CONTRATA_IA_USERS_JSON: JSON.stringify([{ id: "gestor.piloto", role: "OPERATOR", token: internalToken, password: "ClavePiloto-2026" }])
    });
    const cookie = policy.namedUserSessionCookie("gestor.piloto", "ClavePiloto-2026");
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("Secure");
    expect(cookie).toContain(encodeURIComponent(internalToken));
    expect(cookie).not.toContain("ClavePiloto-2026");
  });

  it("publica campos diferenciados de usuario y contraseña", async () => {
    const server = createLB6Server();
    await new Promise<void>((resolve, reject) => { server.once("error", reject); server.listen(0, "127.0.0.1", resolve); });
    try {
      const address = server.address();
      if (!address || typeof address === "string") throw new Error("Servidor de prueba sin puerto.");
      const html = await (await fetch(`http://127.0.0.1:${address.port}/adaptive`)).text();
      expect(html).toContain('name="userId"');
      expect(html).toContain('autocomplete="username"');
      expect(html).toContain('name="password"');
      expect(html).toContain('autocomplete="current-password"');
      expect(html).toContain("Iniciar sesión");
      expect(html).not.toContain('name="token"');
      expect(html).not.toContain("Aplicar credencial");
    } finally {
      await new Promise<void>(resolve => server.close(() => resolve()));
    }
  });

  it("conserva el acceso nominativo en el servidor autoritativo desplegado", async () => {
    const server = createLB103AuthoritativeServer();
    await new Promise<void>((resolve, reject) => { server.once("error", reject); server.listen(0, "127.0.0.1", resolve); });
    try {
      const address = server.address();
      if (!address || typeof address === "string") throw new Error("Servidor de prueba sin puerto.");
      const html = await (await fetch(`http://127.0.0.1:${address.port}/adaptive`)).text();
      expect(html).toContain('name="userId"');
      expect(html).toContain('name="password"');
      expect(html).not.toContain('name="token"');
    } finally {
      await new Promise<void>(resolve => server.close(() => resolve()));
    }
  });
});
