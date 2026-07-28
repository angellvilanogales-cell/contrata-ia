/**
 * ============================================================
 * CONTRATA IA
 * ArticuloNormativo
 * ============================================================
 *
 * Representa un artículo de una norma jurídica.
 *
 * No almacena únicamente el texto legal.
 *
 * Almacena conocimiento estructurado que podrá ser utilizado
 * por todos los motores del sistema.
 *
 * ============================================================
 */

export class ArticuloNormativo {

    constructor(

        /**
         * Identificador interno.
         */
        public readonly id: string,

        /**
         * Norma.
         * Ej.: LCSP
         */
        public readonly norma: string,

        /**
         * Número del artículo.
         * Ej.: 99
         */
        public readonly articulo: string,

        /**
         * Título.
         */
        public readonly titulo: string,

        /**
         * Texto resumido.
         */
        public readonly resumen: string,

        /**
         * Texto oficial.
         */
        public readonly texto: string,

        /**
         * Palabras clave.
         */
        public readonly palabrasClave: string[] = [],

        /**
         * Artículos relacionados.
         */
        public readonly relacionados: string[] = [],

        /**
         * Documentos afectados.
         */
        public readonly documentos: string[] = [],

        /**
         * Motores afectados.
         */
        public readonly motores: string[] = [],

        /**
         * Fecha de vigencia.
         */
        public readonly vigenteDesde?: Date,

        /**
         * Fecha de fin de vigencia.
         */
        public readonly vigenteHasta?: Date

    ) {}

    /**
     * Comprueba si el artículo está vigente.
     */
    public estaVigente(
        fecha: Date = new Date()
    ): boolean {

        if (
            this.vigenteDesde &&
            fecha < this.vigenteDesde
        ) {
            return false;
        }

        if (
            this.vigenteHasta &&
            fecha > this.vigenteHasta
        ) {
            return false;
        }

        return true;

    }

    /**
     * Comprueba si afecta a un documento.
     */
    public afectaDocumento(
        documento: string
    ): boolean {

        return this.documentos.includes(documento);

    }

    /**
     * Comprueba si afecta a un motor.
     */
    public afectaMotor(
        motor: string
    ): boolean {

        return this.motores.includes(motor);

    }

    /**
     * Comprueba si contiene una palabra clave.
     */
    public contienePalabraClave(
        palabra: string
    ): boolean {

        return this.palabrasClave
            .map(p => p.toLowerCase())
            .includes(palabra.toLowerCase());

    }

}
