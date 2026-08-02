/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * KnowledgeRepository
 * ------------------------------------------------------------
 * Punto único de acceso al conocimiento del sistema.
 *
 * IMPORTANTE
 *
 * Este componente NO interpreta la normativa.
 *
 * NO ejecuta reglas.
 *
 * NO toma decisiones.
 *
 * Su única responsabilidad consiste en proporcionar al
 * RuleEngine el conocimiento disponible.
 *
 * En futuras versiones podrá obtener información desde:
 *
 * • Normativa
 * • Ontologías
 * • Ejemplos
 * • PCAP
 * • PPT
 * • Memorias
 * • YAML
 * • JSON
 * • Base documental
 * • IA semántica
 *
 * ============================================================
 */

export interface KnowledgeSource {

    /**
     * Identificador.
     */
    id: string;

    /**
     * Nombre.
     */
    name: string;

    /**
     * Tipo.
     */
    type: string;

    /**
     * Ubicación.
     */
    location?: string;

    /**
     * Activa.
     */
    enabled: boolean;

}

export class KnowledgeRepository {

    /**
     * Fuentes registradas.
     */
    private readonly sources: KnowledgeSource[] = [];

    /**
     * Registra una nueva fuente.
     */
    public register(
        source: KnowledgeSource
    ): void {

        this.sources.push(source);

    }

    /**
     * Devuelve todas las fuentes activas.
     */
    public getSources(): KnowledgeSource[] {

        return this.sources.filter(
            source => source.enabled
        );

    }

    /**
     * Busca una fuente concreta.
     */
    public find(
        id: string
    ): KnowledgeSource | undefined {

        return this.sources.find(
            source => source.id === id
        );

    }

    /**
     * Número de fuentes registradas.
     */
    public count(): number {

        return this.sources.length;

    }

    /**
     * Elimina todas las fuentes.
     */
    public clear(): void {

        this.sources.length = 0;

    }

}
