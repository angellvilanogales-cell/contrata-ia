/******************************************************************************
 *
 * ASISTENTE DE CONTRATACIÓN PÚBLICA
 *
 * MEMORY MONITOR
 *
 ******************************************************************************/

export interface MemorySnapshot {

    timestamp: string;

    rss: number;

    heapTotal: number;

    heapUsed: number;

    external: number;

    arrayBuffers: number;

}

export class MemoryMonitor {

    private readonly history: MemorySnapshot[] = [];

    /**************************************************************************
     *
     * Captura
     *
     **************************************************************************/

    public capture()

        : MemorySnapshot {

        const memory =

            process.memoryUsage();

        const snapshot: MemorySnapshot = {

            timestamp:

                new Date()

                    .toISOString(),

            rss:

                memory.rss,

            heapTotal:

                memory.heapTotal,

            heapUsed:

                memory.heapUsed,

            external:

                memory.external,

            arrayBuffers:

                memory.arrayBuffers

        };

        this.history.push(

            snapshot

        );

        return snapshot;

    }

    /**************************************************************************
     *
     * Última captura
     *
     **************************************************************************/

    public latest()

        : MemorySnapshot | undefined {

        return this.history.at(

            -1

        );

    }

    /**************************************************************************
     *
     * Historial
     *
     **************************************************************************/

    public snapshots()

        : readonly MemorySnapshot[] {

        return this.history;

    }

    /**************************************************************************
     *
     * Máximos
     *
     **************************************************************************/

    public maxHeap()

        : number {

        return Math.max(

            ...this.history.map(

                snapshot =>

                    snapshot.heapUsed

            ),

            0

        );

    }

    public maxRSS()

        : number {

        return Math.max(

            ...this.history.map(

                snapshot =>

                    snapshot.rss

            ),

            0

        );

    }

    /**************************************************************************
     *
     * Promedios
     *
     **************************************************************************/

    public averageHeap()

        : number {

        if (

            this.history.length === 0

        ) {

            return 0;

        }

        const total =

            this.history.reduce(

                (

                    sum,

                    snapshot

                ) =>

                    sum +

                    snapshot.heapUsed,

                0

            );

        return total /

               this.history.length;

    }

    /**************************************************************************
     *
     * Diagnóstico
     *
     **************************************************************************/

    public diagnostics() {

        return {

            captures:

                this.history.length,

            latest:

                this.latest(),

            maxHeap:

                this.maxHeap(),

            maxRSS:

                this.maxRSS(),

            averageHeap:

                this.averageHeap()

        };

    }

    /**************************************************************************
     *
     * Limpieza
     *
     **************************************************************************/

    public clear()

        : void {

        this.history.length = 0;

    }

}
