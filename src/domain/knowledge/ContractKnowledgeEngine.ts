/**
 * ContractKnowledgeEngine
 * Coordinador del conocimiento del sistema.
 * No contiene reglas jurídicas ni lógica documental.
 */
export interface KnowledgeQuery<TInput=unknown>{
  readonly catalog:string;
  readonly operation:string;
  readonly payload:TInput;
}
export interface KnowledgeResult<TOutput=unknown>{
  readonly success:boolean;
  readonly data?:TOutput;
  readonly errors?:readonly string[];
}
export interface KnowledgeCatalog{
  readonly name:string;
  supports(operation:string):boolean;
  execute(query:KnowledgeQuery):Promise<KnowledgeResult>|KnowledgeResult;
}
export class ContractKnowledgeEngine{
  private readonly catalogs=new Map<string,KnowledgeCatalog>();
  /** Registra un catálogo de conocimiento. */
  public register(catalog:KnowledgeCatalog):void{
    this.catalogs.set(catalog.name,catalog);
  }
  /** Obtiene un catálogo registrado. */
  public getCatalog(name:string):KnowledgeCatalog|undefined{
    return this.catalogs.get(name);
  }
  /** Ejecuta una consulta delegando en el catálogo correspondiente. */
  public execute(query:KnowledgeQuery):Promise<KnowledgeResult>|KnowledgeResult{
    const catalog=this.catalogs.get(query.catalog);
    if(!catalog){throw new Error(`Knowledge catalog '${query.catalog}' is not registered.`);}
    return catalog.execute(query);
  }
  // TODO: LCSP catalog registration point.
  // TODO: CPV catalog registration point.
  // TODO: Procedure catalog registration point.
  // TODO: Solvency catalog registration point.
  // TODO: Evaluation catalog registration point.
  // TODO: Clauses catalog registration point.
  // TODO: Dates catalog registration point.
}
