/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * EventBus
 * ------------------------------------------------------------
 *
 * Bus de eventos interno del sistema.
 *
 * RESPONSABILIDADES
 *
 * • Publicar eventos.
 * • Suscribir componentes.
 * • Desuscribir componentes.
 * • Desacoplar módulos.
 * • Facilitar extensibilidad.
 *
 * IMPORTANTE
 *
 * No contiene lógica de contratación.
 * No conoce la LCSP.
 * No conoce CPV.
 *
 * Únicamente transporta eventos.
 * ============================================================
 */

/**
 * Evento base.
 */
export interface DomainEvent<T = unknown> {

    /**
     * Identificador del evento.
     */
    id: string;

    /**
     * Tipo.
     */
    type: string;

    /**
     * Fecha.
     */
    timestamp: Date;

    /**
     * Datos.
     */
    payload: T;

}

/**
 * Manejador.
 */
export type EventHandler<T = unknown> = (

    event: DomainEvent<T>

) => void | Promise<void>;

/**
 * Suscripción.
 */
interface Subscription {

    /**
     * Tipo.
     */
    eventType: string;

    /**
     * Handler.
     */
    handler: EventHandler;

    /**
     * Activo.
     */
    enabled: boolean;

}

/**
 * ============================================================
 * EVENT BUS
 * ============================================================
 */

export class EventBus {

    /**
     * Suscripciones.
     */
    private readonly subscriptions:

        Subscription[] = [];

    /**
     * Historial.
     */
    private readonly history:

        DomainEvent[] = [];

    /**
     * =====================================================
     * SUSCRIBIR
     * =====================================================
     */

    public subscribe(

        eventType: string,

        handler: EventHandler

    ): void {

        this.subscriptions.push({

            eventType,

            handler,

            enabled: true

        });

    }

    /**
     * =====================================================
     * DESUSCRIBIR
     * =====================================================
     */

    public unsubscribe(

        eventType: string,

        handler: EventHandler

    ): void {

        const index =

            this.subscriptions.findIndex(

                subscription =>

                    subscription.eventType === eventType &&

                    subscription.handler === handler

            );

        if (index >= 0) {

            this.subscriptions.splice(

                index,

                1

            );

        }

    }

    /**
     * =====================================================
     * EXISTE
     * =====================================================
     */

    public hasSubscribers(

        eventType: string

    ): boolean {

        return this.subscriptions.some(

            subscription =>

                subscription.eventType === eventType &&

                subscription.enabled

        );

    }

    /**
     * =====================================================
     * TOTAL
     * =====================================================
     */

    public subscriberCount(): number {

        return this.subscriptions.length;

    }

    /**
     * =====================================================
     * HISTORIAL
     * =====================================================
     */

    public events():

        readonly DomainEvent[] {

        return this.history;

    }

}

    /**
     * =====================================================
     * PUBLICAR EVENTO
     * =====================================================
     */

    public async publish<T = unknown>(

        event: DomainEvent<T>

    ): Promise<void> {

        this.history.push(event);

        const handlers =

            this.subscriptions.filter(

                subscription =>

                    subscription.enabled &&

                    subscription.eventType === event.type

            );

        for (

            const subscription of handlers

        ) {

            await this.executeHandler(

                subscription,

                event

            );

        }

    }

    /**
     * =====================================================
     * PUBLICACIÓN SINCRÓNICA
     * =====================================================
     */

    public publishSync<T = unknown>(

        event: DomainEvent<T>

    ): void {

        this.history.push(event);

        const handlers =

            this.subscriptions.filter(

                subscription =>

                    subscription.enabled &&

                    subscription.eventType === event.type

            );

        for (

            const subscription of handlers

        ) {

            try {

                subscription.handler(event);

            }

            catch (error) {

                this.handleError(

                    error,

                    subscription,

                    event

                );

            }

        }

    }

    /**
     * =====================================================
     * EJECUTAR HANDLER
     * =====================================================
     */

    private async executeHandler(

        subscription: Subscription,

        event: DomainEvent

    ): Promise<void> {

        try {

            await subscription.handler(

                event

            );

        }

        catch (error) {

            this.handleError(

                error,

                subscription,

                event

            );

        }

    }

    /**
     * =====================================================
     * GESTIÓN DE ERRORES
     * =====================================================
     */

    private handleError(

        error: unknown,

        subscription: Subscription,

        event: DomainEvent

    ): void {

        console.error(

            "[EventBus]",

            {

                event: event.type,

                subscriber:

                    subscription.eventType,

                error

            }

        );

    }

    /**
     * =====================================================
     * PUBLICAR VARIOS EVENTOS
     * =====================================================
     */

    public async publishMany(

        events: DomainEvent[]

    ): Promise<void> {

        for (

            const event of events

        ) {

            await this.publish(

                event

            );

        }

    }

    /**
     * =====================================================
     * LIMPIAR HISTORIAL
     * =====================================================
     */

    public clearHistory(): void {

        this.history.length = 0;

    }

    /**
     * =====================================================
     * ÚLTIMO EVENTO
     * =====================================================
     */

    public lastEvent():

        DomainEvent | undefined {

        if (

            this.history.length === 0

        ) {

            return undefined;

        }

        return this.history[

            this.history.length - 1

        ];

    }

    /**
     * =====================================================
     * TOTAL DE EVENTOS
     * =====================================================
     */

    public eventCount(): number {

        return this.history.length;

    }


    /**
     * =====================================================
     * PRIORIDAD DE LOS SUSCRIPTORES
     * =====================================================
     */

    private readonly priorities =

        new Map<EventHandler, number>();

    /**
     * Establece prioridad.
     */
    public setPriority(

        handler: EventHandler,

        priority: number

    ): void {

        this.priorities.set(

            handler,

            priority

        );

    }

    /**
     * Obtiene prioridad.
     */
    public getPriority(

        handler: EventHandler

    ): number {

        return this.priorities.get(

            handler

        ) ?? 100;

    }

    /**
     * =====================================================
     * ACTIVAR SUSCRIPTOR
     * =====================================================
     */

    public enable(

        handler: EventHandler

    ): void {

        const subscription =

            this.subscriptions.find(

                s => s.handler === handler

            );

        if (subscription) {

            subscription.enabled = true;

        }

    }

    /**
     * =====================================================
     * DESACTIVAR SUSCRIPTOR
     * =====================================================
     */

    public disable(

        handler: EventHandler

    ): void {

        const subscription =

            this.subscriptions.find(

                s => s.handler === handler

            );

        if (subscription) {

            subscription.enabled = false;

        }

    }

    /**
     * =====================================================
     * SUSCRIPTORES DE UN EVENTO
     * =====================================================
     */

    public subscribersOf(

        eventType: string

    ): Subscription[] {

        return this.subscriptions.filter(

            subscription =>

                subscription.eventType ===

                eventType

        );

    }

    /**
     * =====================================================
     * PUBLICACIÓN ORDENADA
     * =====================================================
     */

    private orderedSubscribers(

        eventType: string

    ): Subscription[] {

        return this.subscribersOf(

            eventType

        )

        .filter(

            s => s.enabled

        )

        .sort(

            (a, b) =>

                this.getPriority(

                    a.handler

                ) -

                this.getPriority(

                    b.handler

                )

        );

    }

    /**
     * =====================================================
     * ESTADÍSTICAS
     * =====================================================
     */

    public statistics() {

        return {

            subscriptions:

                this.subscriptions.length,

            enabled:

                this.subscriptions.filter(

                    s => s.enabled

                ).length,

            disabled:

                this.subscriptions.filter(

                    s => !s.enabled

                ).length,

            publishedEvents:

                this.history.length

        };

    }

    /**
     * =====================================================
     * DIAGNÓSTICO
     * =====================================================
     */

    public diagnostics() {

        return {

            statistics:

                this.statistics(),

            eventTypes:

                [

                    ...new Set(

                        this.subscriptions.map(

                            s => s.eventType

                        )

                    )

                ],

            historySize:

                this.history.length

        };

    }

    /**
     * =====================================================
     * INTERCEPTORES
     * =====================================================
     */

    private readonly interceptors:

        EventInterceptor[] = [];

    /**
     * Registra un interceptor.
     */
    public addInterceptor(

        interceptor: EventInterceptor

    ): void {

        this.interceptors.push(

            interceptor

        );

    }

    /**
     * Elimina un interceptor.
     */
    public removeInterceptor(

        interceptor: EventInterceptor

    ): void {

        const index =

            this.interceptors.indexOf(

                interceptor

            );

        if (index >= 0) {

            this.interceptors.splice(

                index,

                1

            );

        }

    }

    /**
     * Ejecuta todos los interceptores.
     */
    private async executeInterceptors(

        event: DomainEvent

    ): Promise<void> {

        for (

            const interceptor of

            this.interceptors

        ) {

            await interceptor(

                event

            );

        }

    }

    /**
     * =====================================================
     * BROADCAST
     * =====================================================
     */

    public async broadcast(

        event: DomainEvent

    ): Promise<void> {

        await this.executeInterceptors(

            event

        );

        await this.publish(

            event

        );

    }

    /**
     * =====================================================
     * REPLAY
     * =====================================================
     */

    public async replay(

        eventType?: string

    ): Promise<void> {

        const events =

            eventType

                ? this.history.filter(

                    e =>

                        e.type === eventType

                )

                : this.history;

        for (

            const event of events

        ) {

            await this.publish(

                event

            );

        }

    }

    /**
     * =====================================================
     * FILTRADO DE HISTORIAL
     * =====================================================
     */

    public historyOf(

        eventType: string

    ): DomainEvent[] {

        return this.history.filter(

            event =>

                event.type === eventType

        );

    }

    /**
     * =====================================================
     * AUDITORÍA
     * =====================================================
     */

    public audit() {

        return {

            totalEvents:

                this.history.length,

            totalSubscribers:

                this.subscriptions.length,

            interceptors:

                this.interceptors.length,

            eventTypes:

                [

                    ...new Set(

                        this.history.map(

                            e => e.type

                        )

                    )

                ]

        };

    }

    /**
     * =====================================================
     * RESET
     * =====================================================
     */

    public reset(): void {

        this.clearHistory();

        this.subscriptions.length = 0;

        this.interceptors.length = 0;

        this.priorities.clear();

    }

    /**
     * =====================================================
     * EXPORTACIÓN
     * =====================================================
     */

    public exportState() {

        return {

            subscribers:

                this.subscriptions.length,

            interceptors:

                this.interceptors.length,

            events:

                this.history.length,

            diagnostics:

                this.diagnostics()

        };

    }

    /**
     * =====================================================
     * FACTORÍA POR DEFECTO
     * =====================================================
     */

    public static createDefault(): EventBus {

        const bus = new EventBus();

        /**
         * Aquí podrán registrarse interceptores globales.
         *
         * Ejemplo:
         *
         * bus.addInterceptor(new LoggingInterceptor());
         * bus.addInterceptor(new MetricsInterceptor());
         * bus.addInterceptor(new AuditInterceptor());
         */

        return bus;

    }

    /**
     * =====================================================
     * COMPROBACIÓN DE SALUD
     * =====================================================
     */

    public health() {

        return {

            healthy: true,

            subscriptions:

                this.subscriptions.length,

            interceptors:

                this.interceptors.length,

            pendingEvents: 0,

            history:

                this.history.length

        };

    }

    /**
     * =====================================================
     * INFORMACIÓN
     * =====================================================
     */

    public info() {

        return {

            version:

                this.version(),

            statistics:

                this.statistics(),

            diagnostics:

                this.diagnostics(),

            audit:

                this.audit(),

            health:

                this.health()

        };

    }

    /**
     * =====================================================
     * SERIALIZACIÓN
     * =====================================================
     */

    public toJSON(): string {

        return JSON.stringify(

            this.exportState(),

            null,

            4

        );

    }

    /**
     * =====================================================
     * VERSIÓN
     * =====================================================
     */

    public version(): string {

        return "1.0.0";

    }

}

