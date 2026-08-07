export class BaseCache<T> {
  private readonly values = new Map<string, T>();
  public get(key: string): T | undefined { return this.values.get(key); }
  public set(key: string, value: T): void { this.values.set(key, value); }
  public has(key: string): boolean { return this.values.has(key); }
  public clear(): void { this.values.clear(); }
}
