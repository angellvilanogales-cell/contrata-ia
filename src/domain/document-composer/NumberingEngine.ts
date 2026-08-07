export class NumberingEngine {
  public number(index: number, prefix = ""): string {
    return `${prefix}${index + 1}`;
  }
}
