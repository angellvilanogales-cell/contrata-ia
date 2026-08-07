export abstract class BaseDocumentGenerator<TContext = unknown, TResult = unknown> {
  public abstract generate(context: TContext): Promise<TResult> | TResult;
}
