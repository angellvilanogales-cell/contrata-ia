import crypto from "node:crypto";
import type { IncomingMessage, ServerResponse } from "node:http";

export type ApplicationRole = "VIEWER" | "OPERATOR" | "REVIEWER" | "ADMIN";
export interface AuthenticatedActor { readonly id: string; readonly role: ApplicationRole; readonly displayName?: string; readonly namedIdentity?: boolean; }

const RANK: Readonly<Record<ApplicationRole, number>> = { VIEWER: 1, OPERATOR: 2, REVIEWER: 3, ADMIN: 4 };
const SESSION_COOKIE = "contrata_ia_token";
const LOGIN_PREFIX = "LOGIN\u0000";
const ROLES=new Set<ApplicationRole>(["VIEWER","OPERATOR","REVIEWER","ADMIN"]);

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

interface NamedUserConfig {id:string;role:ApplicationRole;token:string;password?:string;displayName?:string;}
function namedUsers(raw:string|undefined):NamedUserConfig[]{
  if(!raw?.trim())return[];
  let parsed:unknown;try{parsed=JSON.parse(raw);}catch{throw new Error("CONTRATA_IA_USERS_JSON no contiene JSON válido.");}
  if(!Array.isArray(parsed))throw new Error("CONTRATA_IA_USERS_JSON debe ser una lista de usuarios.");
  const users:NamedUserConfig[]=[];const ids=new Set<string>();const tokens=new Set<string>();
  for(const [index,item] of parsed.entries()){
    if(!item||typeof item!=="object"||Array.isArray(item))throw new Error(`Usuario ${index+1} inválido en CONTRATA_IA_USERS_JSON.`);
    const row=item as Record<string,unknown>;const id=typeof row.id==="string"?row.id.trim():"";const role=typeof row.role==="string"?row.role as ApplicationRole:null;const token=typeof row.token==="string"?row.token:"";const password=typeof row.password==="string"?row.password:"";const displayName=typeof row.displayName==="string"&&row.displayName.trim()?row.displayName.trim():undefined;
    if(!id||!/^[A-Za-z0-9._@-]{2,120}$/.test(id))throw new Error(`Identidad nominativa inválida en usuario ${index+1}.`);
    if(!role||!ROLES.has(role))throw new Error(`Rol inválido para ${id}.`);
    if(token.length<16)throw new Error(`La credencial nominativa interna de ${id} debe tener al menos 16 caracteres.`);
    if(password&&password.length<10)throw new Error(`La contraseña de ${id} debe tener al menos 10 caracteres.`);
    if(password&&equalSecret(password,token))throw new Error(`La contraseña de ${id} debe ser distinta del token interno.`);
    if(ids.has(id))throw new Error(`Identidad nominativa duplicada: ${id}.`);if(tokens.has(token))throw new Error("No se permite compartir una credencial entre usuarios nominativos.");
    ids.add(id);tokens.add(token);users.push({id,role,token,...(password?{password}:{}),...(displayName?{displayName}:{})});
  }
  return users;
}

function parseLoginEnvelope(value:string):{id:string;password:string}|null{
  if(!value.startsWith(LOGIN_PREFIX))return null;
  const payload=value.slice(LOGIN_PREFIX.length);const separator=payload.indexOf("\u0000");
  if(separator<1)return null;return{id:payload.slice(0,separator),password:payload.slice(separator+1)};
}

export class SecurityPolicy {
  private readonly tokens: readonly { token: string; actor: AuthenticatedActor }[];
  private readonly required: boolean;
  private readonly namedIdentityCountValue:number;
  private readonly namedUsersValue:readonly NamedUserConfig[];

  public constructor(environment: NodeJS.ProcessEnv = process.env) {
    this.required = environment.CONTRATA_IA_AUTH_REQUIRED === "1" || environment.NODE_ENV === "production";
    const tokens: { token: string; actor: AuthenticatedActor }[] = [];
    const users=namedUsers(environment.CONTRATA_IA_USERS_JSON);this.namedUsersValue=users;this.namedIdentityCountValue=users.length;
    for(const user of users)tokens.push({token:user.token,actor:{id:user.id,role:user.role,...(user.displayName?{displayName:user.displayName}:{}),namedIdentity:true}});
    const add = (token: string | undefined, id: string, role: ApplicationRole): void => { if (token) tokens.push({ token, actor: { id, role, namedIdentity:false } }); };
    add(environment.CONTRATA_IA_VIEWER_TOKEN, "viewer", "VIEWER");
    add(environment.CONTRATA_IA_OPERATOR_TOKEN, "operator", "OPERATOR");
    add(environment.CONTRATA_IA_REVIEWER_TOKEN, "reviewer", "REVIEWER");
    add(environment.CONTRATA_IA_ADMIN_TOKEN, "admin", "ADMIN");
    const duplicateSecrets=new Set<string>();const seen=new Set<string>();for(const entry of tokens){if(seen.has(entry.token))duplicateSecrets.add(entry.token);seen.add(entry.token);}if(duplicateSecrets.size)throw new Error("No se permiten credenciales duplicadas entre identidades/roles.");
    this.tokens = tokens;
    if (this.required && this.tokens.length === 0) throw new Error("Producción requiere al menos una credencial CONTRATA_IA_USERS_JSON o CONTRATA_IA_*_TOKEN.");
  }

  public namedIdentityCount():number{return this.namedIdentityCountValue;}
  public hasNamedIdentities():boolean{return this.namedIdentityCountValue>0;}
  public namedPasswordCount():number{return this.namedUsersValue.filter(user=>Boolean(user.password)).length;}
  public namedUserDirectory():readonly {id:string;displayName?:string;role:ApplicationRole;passwordEnabled:boolean}[]{return this.namedUsersValue.map(user=>({id:user.id,role:user.role,passwordEnabled:Boolean(user.password),...(user.displayName?{displayName:user.displayName}:{})}));}

  public authenticateNamedUser(id:string,password:string):AuthenticatedActor{
    const normalized=id.trim();const user=this.namedUsersValue.find(item=>item.id===normalized);
    if(!user?.password||!equalSecret(password,user.password))throw new Error("Usuario o contraseña no válidos.");
    return {id:user.id,role:user.role,...(user.displayName?{displayName:user.displayName}:{}),namedIdentity:true};
  }

  private internalTokenForNamedUser(id:string,password:string):string{
    const actor=this.authenticateNamedUser(id,password);const user=this.namedUsersValue.find(item=>item.id===actor.id);
    if(!user)throw new Error("Usuario o contraseña no válidos.");return user.token;
  }

  public authenticateToken(token: string): AuthenticatedActor {
    const envelope=parseLoginEnvelope(token);
    if(envelope)return this.authenticateNamedUser(envelope.id,envelope.password);
    const found = this.tokens.find(entry => equalSecret(token, entry.token));
    if (found) return found.actor;
    if (!this.required && token === "") return { id: "development-user", role: "ADMIN", namedIdentity:false };
    throw new Error("Credencial no válida.");
  }

  public authenticate(request: IncomingMessage): AuthenticatedActor {
    const header = request.headers.authorization ?? "";
    const match = /^Bearer\s+(.+)$/i.exec(header);
    if (match) return this.authenticateToken(match[1]!);
    const cookieToken = cookieValue(request, SESSION_COOKIE);
    if (cookieToken) return this.authenticateToken(cookieToken);
    if (this.required) throw new Error("Se requiere autenticación Bearer o sesión segura.");
    return { id: "development-user", role: "ADMIN", namedIdentity:false };
  }

  public sessionCookie(token: string): string {
    const envelope=parseLoginEnvelope(token);const internal=envelope?this.internalTokenForNamedUser(envelope.id,envelope.password):token;
    this.authenticateToken(internal);
    return `${SESSION_COOKIE}=${encodeURIComponent(internal)}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=604800`;
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
    response.setHeader("content-security-policy", "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src 'self'; img-src 'self' data:; frame-ancestors 'none'; base-uri 'none'; form-action 'self'");
    response.setHeader("cache-control", "no-store");
  }
}
