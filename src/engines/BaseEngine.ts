/**
 * Base marker for legacy expert engines.
 *
 * Rule loading is owned by each concrete legacy engine. The previous base
 * implementation referenced KnowledgeEngine methods that are not part of its
 * canonical contract and therefore could not be type-safe.
 */
export abstract class BaseEngine {}
