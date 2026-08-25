import type { AdaptiveCaseStore, AdaptiveStoredCase } from "../lb7/AdaptiveCaseStore";

export interface AdaptiveCaseRemotePort {
  hydrate(store: AdaptiveCaseStore): Promise<number>;
  persist(value: AdaptiveStoredCase): Promise<void>;
  diagnostics(): Readonly<Record<string, unknown>>;
}

export class HttpAdaptiveCaseMirror implements AdaptiveCaseRemotePort {
  private constructor(
    private readonly endpoint: string,
    private readonly credential: string
  ) {}

  public static fromEnvironment(environment: NodeJS.ProcessEnv = process.env): HttpAdaptiveCaseMirror | undefined {
    const endpoint = String(environment.CONTRATA_IA_PERSISTENCE_URL ?? "").trim();
    const credential = String(environment.CONTRATA_IA_PERSISTENCE_TOKEN ?? "").trim();
    if (!endpoint && !credential) return undefined;
    if (!endpoint || !credential) throw new Error("Persistencia externa incompleta.");
    return new HttpAdaptiveCaseMirror(endpoint.replace(/\/$/, ""), credential);
  }

  public diagnostics(): Readonly<Record<string, unknown>> {
    return { configured: true, provider: "http", endpoint: this.endpoint };
  }

  public async hydrate(store: AdaptiveCaseStore): Promise<number> {
    const response = await this.request(this.endpoint, { method: "GET" });
    const body = await response.json() as { cases?: readonly AdaptiveStoredCase[] };
    let restored = 0;
    for (const value of body.cases ?? []) {
      store.restore(value);
      restored += 1;
    }
    return restored;
  }

  public async persist(value: AdaptiveStoredCase): Promise<void> {
    const response = await this.request(`${this.endpoint}/${encodeURIComponent(value.caseId)}`, {
      method: "PUT",
      headers: { "content-type": "application/json; charset=utf-8" },
      body: JSON.stringify(value)
    });
    await response.arrayBuffer();
  }

  private async request(url: string, init: RequestInit): Promise<Response> {
    const headers = new Headers(init.headers);
    headers.set("x-contrata-ia-persistence-token", this.credential);
    const response = await fetch(url, { ...init, headers, signal: AbortSignal.timeout(12_000) });
    if (!response.ok) throw new Error(`Persistencia externa no disponible (${response.status}).`);
    return response;
  }
}
