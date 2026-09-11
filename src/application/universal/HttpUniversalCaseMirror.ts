import { UniversalCaseMirror, UniversalCaseSnapshot } from "./UniversalDurableCaseStore";

export interface HttpUniversalCaseMirrorOptions {
  endpoint: string;
  token: string;
  fetchImpl?: typeof fetch;
}

/** LB92.3. Adaptador HTTP hacia contrata-ia-persistence/universal. */
export class HttpUniversalCaseMirror implements UniversalCaseMirror {
  private readonly fetchImpl: typeof fetch;
  private readonly endpoint: string;

  constructor(private readonly options: HttpUniversalCaseMirrorOptions) {
    if (!options.endpoint || !/^https:\/\//.test(options.endpoint)) throw new Error("UNIVERSAL_PERSISTENCE_ENDPOINT_INVALID");
    if (!options.token) throw new Error("UNIVERSAL_PERSISTENCE_TOKEN_MISSING");
    this.endpoint = options.endpoint.replace(/\/$/, "");
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  private headers(): Record<string, string> {
    return {
      "content-type": "application/json",
      "x-contrata-ia-persistence-token": this.options.token,
    };
  }

  public async save(snapshot: UniversalCaseSnapshot): Promise<void> {
    const response = await this.fetchImpl(`${this.endpoint}/universal/${encodeURIComponent(snapshot.caseId)}`, {
      method: "PUT",
      headers: this.headers(),
      body: JSON.stringify({ schemaVersion: snapshot.schemaVersion, payload: snapshot.payload, checksum: snapshot.checksum }),
    });
    if (!response.ok) throw new Error(`UNIVERSAL_REMOTE_SAVE_HTTP_${response.status}`);
  }

  public async load(caseId: string): Promise<UniversalCaseSnapshot | null> {
    const response = await this.fetchImpl(`${this.endpoint}/universal/${encodeURIComponent(caseId)}`, {
      method: "GET",
      headers: this.headers(),
    });
    if (response.status === 404) return null;
    if (!response.ok) throw new Error(`UNIVERSAL_REMOTE_LOAD_HTTP_${response.status}`);
    const body = await response.json() as Partial<UniversalCaseSnapshot>;
    if (!body || body.caseId !== caseId || typeof body.schemaVersion !== "number" || !body.payload || typeof body.checksum !== "string") {
      throw new Error("UNIVERSAL_REMOTE_RESPONSE_INVALID");
    }
    return body as UniversalCaseSnapshot;
  }
}

export function createUniversalCaseMirrorFromEnv(env: NodeJS.ProcessEnv = process.env): HttpUniversalCaseMirror | null {
  const endpoint = env.CONTRATA_IA_PERSISTENCE_URL;
  const token = env.CONTRATA_IA_PERSISTENCE_TOKEN;
  if (!endpoint || !token) return null;
  return new HttpUniversalCaseMirror({ endpoint, token });
}
