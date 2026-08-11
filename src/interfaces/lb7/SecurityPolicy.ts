import crypto from "node:crypto";
import type { IncomingMessage, ServerResponse } from "node:http";

export type ApplicationRole = "VIEWER" | "OPERATOR" | "REVIEWER" | "ADMIN";
export interface AuthenticatedActor { readonly id: string; readonly role: ApplicationRole; }

const RANK: Readonly<Record<ApplicationRole, number>> = { VIEWER: 1, OPERATOR: 2, REVIEWER: 3, ADMIN: 4 };
const SESSION_COOKIE = "contrata_ia_token";

function equalSecret(candidate: string, expected: string): boolean {
  const a = Buffer.from(candidate);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function cookieValue(request: IncomingMessage, name: string): string | undefined {
  const raw = request.headers.cookie ?? "";
  for (const pair of raw.split(";")) {
    const index = pair.indexOf("=");
    if (index < 0) continue;
    const key = pair.slice(0, index).trim();
    if (key !== name) continue;
    try { return decodeURIComponent(pair.slice(index + 1).trim()); } catch { return undefined; }
  }
  return undefined;
}

export class SecurityPolicy {
  private readonly tokens: readonly { token: string; actor: AuthenticatedActor }[];
  private readonly required: boolean;

  public constructor(environment: NodeJS.ProcessEnv = process.env) {
    this.required = environment.CONTRATA_IA_AUTH_REQUIRED === "1" || environment.NODE_ENV === "production";
    const tokens: { token: string; actor: AuthenticatedActor }[] = [];
    const add = (token: string | undefined, id: string, role: ApplicationRole): void => {
      if (token) tokens.push({ token, actor: { id, role } });
    };
    add(environment.CONTRATA_IA_VIEWER_TOKEN, "viewer", "VIEWER");
    add(environment.CONTRATA_IA_OPERATOR_TOKEN, "operator", "OPERATOR");
    add(environment.CONTRATA_IA_REVIEWER_TOKEN, "reviewer", "REVIEWER");
    add(environment.CONTRATA_IA_ADMIN_TOKEN, "admin", "ADMIN");
    this.tokens = tokens;
    if (this.required && this.tokens.length === 0) throw new Error("Producción requiere al menos una credencial CONTRATA_IA_*_TOKEN.");
  }

  public authenticateToken(token: string): AuthenticatedActor {
    const found = this.tokens.find(entry => equalSecret(token, entry.token));
    if (found) return found.actor;
    if (!this.required && token === "") return { id: "development-user", role: "ADMIN" };
    throw new Error("Credencial no válida.");
  }

  public authenticate(request: IncomingMessage): AuthenticatedActor {
    const header = request.headers.authorization ?? "";
    const match = /^Bearer\s+(.+)$/i.exec(header);
    if (match) return this.authenticateToken(match[1]!);
    const cookieToken = cookieValue(request, SESSION_COOKIE);
    if (cookieToken) return this.authenticateToken(cookieToken);
    if (this.required) throw new Error("Se requiere autenticación Bearer o sesión segura.");
    return { id: "development-user", role: "ADMIN" };
  }

  public sessionCookie(token: string): string {
    this.authenticateToken(token);
    return `${SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=28800`;
  }

  public clearSessionCookie(): string {
    return `${SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;
  }

  public require(actor: AuthenticatedActor, minimum: ApplicationRole): void {
    if (RANK[actor.role] < RANK[minimum]) throw new Error(`Permiso insuficiente: se requiere rol ${minimum}.`);
  }

  public applySecurityHeaders(response: ServerResponse): void {
    response.setHeader("x-content-type-options", "nosniff");
    response.setHeader("x-frame-options", "DENY");
    response.setHeader("referrer-policy", "no-referrer");
    response.setHeader("permissions-policy", "camera=(), microphone=(), geolocation=()");
    response.setHeader("content-security-policy", "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self'; img-src 'self' data:; frame-ancestors 'none'; base-uri 'none'; form-action 'self'");
    response.setHeader("cache-control", "no-store");
  }
}
