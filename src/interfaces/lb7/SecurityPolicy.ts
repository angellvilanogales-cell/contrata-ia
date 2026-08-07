import crypto from "node:crypto";
import type { IncomingMessage, ServerResponse } from "node:http";

export type ApplicationRole = "VIEWER" | "OPERATOR" | "REVIEWER" | "ADMIN";
export interface AuthenticatedActor { readonly id: string; readonly role: ApplicationRole; }

const RANK: Readonly<Record<ApplicationRole, number>> = { VIEWER: 1, OPERATOR: 2, REVIEWER: 3, ADMIN: 4 };

function equalSecret(candidate: string, expected: string): boolean {
  const a = Buffer.from(candidate);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
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

  public authenticate(request: IncomingMessage): AuthenticatedActor {
    const header = request.headers.authorization ?? "";
    const match = /^Bearer\s+(.+)$/i.exec(header);
    if (match) {
      const found = this.tokens.find(entry => equalSecret(match[1]!, entry.token));
      if (found) return found.actor;
      throw new Error("Credencial no válida.");
    }
    if (this.required) throw new Error("Se requiere autenticación Bearer.");
    return { id: "development-user", role: "ADMIN" };
  }

  public require(actor: AuthenticatedActor, minimum: ApplicationRole): void {
    if (RANK[actor.role] < RANK[minimum]) throw new Error(`Permiso insuficiente: se requiere rol ${minimum}.`);
  }

  public applySecurityHeaders(response: ServerResponse): void {
    response.setHeader("x-content-type-options", "nosniff");
    response.setHeader("x-frame-options", "DENY");
    response.setHeader("referrer-policy", "no-referrer");
    response.setHeader("permissions-policy", "camera=(), microphone=(), geolocation=()");
    response.setHeader("content-security-policy", "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src 'self'; img-src 'self' data:; frame-ancestors 'none'; base-uri 'none'; form-action 'self'");
    response.setHeader("cache-control", "no-store");
  }
}
