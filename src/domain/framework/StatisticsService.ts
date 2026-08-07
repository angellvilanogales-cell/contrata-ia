export class StatisticsService {
  private readonly counters = new Map<string, number>();
  public increment(scope: string, metric: string, amount = 1): void {
    const key = `${scope}:${metric}`;
    this.counters.set(key, (this.counters.get(key) ?? 0) + amount);
  }
  public get(scope: string, metric: string): number { return this.counters.get(`${scope}:${metric}`) ?? 0; }
}
