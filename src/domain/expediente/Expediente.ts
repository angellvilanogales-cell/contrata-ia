/**
 * ============================================================
 * CONTRATA IA
 * Expediente
 * ============================================================
 *
 * Entidad principal del dominio.
 *
 * Representa un expediente completo de contratación.
 *
 * Conforme vayamos desarrollando módulos,
 * esta entidad irá incorporando nueva información.
 *
 * ============================================================
 */

export class Expediente {

    /**
     * Identificador.
     */
    public id: string = "";

    /**
     * Objeto del contrato.
     */
    public objetoContrato: string = "";

    /**
     * Tipo de contrato.
     */
    public tipoContrato: string = "";

    /**
     * Valor estimado.
     */
    public valorEstimado: number = 0;

    /**
     * Código CPV principal.
     */
    public cpvPrincipal?: string;

    /**
     * CPV secundarios.
     */
    public cpvSecundarios: string[] = [];

    /**
     * Procedimiento.
     */
    public procedimiento?: string;

    /**
     * Tramitación.
     */
    public tramitacion?: string;

    /**
     * Responsable.
     */
    public responsableContrato?: string;

    /**
     * Unidad promotora.
     */
    public unidadPromotora?: string;

    /**
     * Fecha de creación.
     */
    public fechaCreacion: Date = new Date();

    /**
     * Estado del expediente.
     */
    public estado: string = "BORRADOR";

    /**
     * Comprueba si el expediente
     * dispone de la información mínima.
     */
    public esValido(): boolean {

        return (

            this.objetoContrato.trim().length > 0 &&

            this.tipoContrato.trim().length > 0 &&

            this.valorEstimado > 0

        );

    }

}
