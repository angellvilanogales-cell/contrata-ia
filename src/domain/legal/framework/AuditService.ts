/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * AuditService
 * ------------------------------------------------------------
 * Servicio centralizado de auditoría jurídica.
 *
 * Registra:
 *
 *  • ejecución de reglas
 *  • decisiones
 *  • validaciones
 *  • eventos
 *
 * ============================================================
 */

import { UUID } from "../../common/types";

import {

    AuditResult,
    ResolverDecision,
    RuleExecution

} from "./FrameworkTypes";

export interface AuditEvent {

    id: UUID;

    timestamp: Date;

    type: string;

    description: string;

    data?: unknown;

}

export class AuditService {

    /**
     * Historial completo.
     */
    private readonly events: AuditEvent[] = [];

    /**
     * =====================================================
     * Registrar evento
     * =====================================================
     */

    public log(

        type: string,

        description: string,

        data?: unknown

    ): void {

        this.events.push({

            id: crypto.randomUUID() as UUID,

            timestamp: new Date(),

            type,

            description,

            data

        });

    }

    /**
     * =====================================================
     * Registrar regla
     * =====================================================
     */

    public rule(

        execution: RuleExecution

    ): void {

        this.log(

            "RULE",

            execution.code,

            execution

        );

    }

    /**
     * =====================================================
     * Registrar decisión
     * =====================================================
     */

    public decision(

        decision: ResolverDecision

    ): void {

        this.log(

            "DECISION",

            "Resolver decision",

            decision

        );

    }

    /**
     * =====================================================
     * Registrar validación
     * =====================================================
     */

    public validation(

        decision: ResolverDecision

    ): void {

        this.log(

            "VALIDATION",

            "Validation executed",

            decision.validation

        );

    }

    /**
     * =====================================================
     * Obtener eventos
     * =====================================================
     */

    public history()

    : ReadonlyArray<AuditEvent> {

        return this.events;

    }

    /**
     * =====================================================
     * Filtrar por tipo
     * =====================================================
     */

    public byType(

        type: string

    ): AuditEvent[] {

        return this.events.filter(

            event =>

                event.type === type

        );

    }

    /**
     * =====================================================
     * Último evento
     * =====================================================
     */

    public last()

    : AuditEvent | undefined {

        return this.events.at(-1);

    }

    /**
     * =====================================================
     * Total
     * =====================================================
     */

    public count()

    : number {

        return this.events.length;

    }

    /**
     * =====================================================
     * Vaciar historial
     * =====================================================
     */

    public clear(): void {

        this.events.length = 0;

    }

    /**
     * =====================================================
     * Exportar auditoría
     * =====================================================
     */

    public export()

    : AuditResult {

        return {

            generatedAt: new Date(),

            events:

                this.events.map(

                    e =>

                        `[${e.timestamp.toISOString()}] ${e.type}: ${e.description}`

                )

        };

    }

    /**
     * =====================================================
     * Diagnóstico
     * =====================================================
     */

    public diagnostics() {

        return {

            totalEvents:

                this.count(),

            ruleEvents:

                this.byType("RULE").length,

            decisionEvents:

                this.byType("DECISION").length,

            validationEvents:

                this.byType("VALIDATION").length

        };

    }

}
