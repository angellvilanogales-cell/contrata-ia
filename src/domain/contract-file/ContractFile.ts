/**
 * Contrata-IA
 * ------------------------------
 * Aggregate Root del expediente de contratación.
 *
 * El ContractFile constituye la única fuente de verdad del sistema y
 * agrega todos los modelos que describen un expediente administrativo.
 *
 * No contiene lógica de negocio.
 * No contiene reglas jurídicas.
 * No contiene validaciones complejas.
 * No contiene lógica documental.
 */

import { Expediente } from "./models/Expediente";
import { Organizacion } from "./models/Organizacion";
import { Necesidad } from "./models/Necesidad";
import { ObjetoContrato } from "./models/ObjetoContrato";
import { ClasificacionJuridica } from "./models/ClasificacionJuridica";
import { Presupuesto } from "./models/Presupuesto";
import { Procedimiento } from "./models/Procedimiento";
import { Licitacion } from "./models/Licitacion";
import { Solvencia } from "./models/Solvencia";
import { Criterios } from "./models/Criterios";
import { CondicionesEspeciales } from "./models/CondicionesEspeciales";
import { Ejecucion } from "./models/Ejecucion";
import { Documentacion } from "./models/Documentacion";
import { Auditoria } from "./models/Auditoria";
import { EstadoExpediente } from "./models/EstadoExpediente";

/**
 * Representa un expediente administrativo completo.
 *
 * Todos los compositores documentales deberán obtener la información
 * exclusivamente desde esta clase.
 */
export class ContractFile {
    /**
     * Información general del expediente.
     */
    public expediente: Expediente;

    /**
     * Organización contratante.
     */
    public organizacion: Organizacion;

    /**
     * Necesidad administrativa.
     */
    public necesidad: Necesidad;

    /**
     * Objeto del contrato.
     */
    public objetoContrato: ObjetoContrato;

    /**
     * Clasificación jurídica del contrato.
     */
    public clasificacionJuridica: ClasificacionJuridica;

    /**
     * Información económica.
     */
    public presupuesto: Presupuesto;

    /**
     * Procedimiento de adjudicación.
     */
    public procedimiento: Procedimiento;

    /**
     * Información de la licitación.
     */
    public licitacion: Licitacion;

    /**
     * Requisitos de solvencia.
     */
    public solvencia: Solvencia;

    /**
     * Criterios de adjudicación.
     */
    public criterios: Criterios;

    /**
     * Condiciones especiales de ejecución.
     */
    public condicionesEspeciales: CondicionesEspeciales;

    /**
     * Datos relativos a la ejecución del contrato.
     */
    public ejecucion: Ejecucion;

    /**
     * Documentación asociada al expediente.
     */
    public documentacion: Documentacion;

    /**
     * Información de auditoría.
     */
    public auditoria: Auditoria;

    /**
     * Estado actual del expediente.
     */
    public estado: EstadoExpediente;

    /**
     * Crea un nuevo expediente vacío.
     */
    constructor() {
        this.expediente = new Expediente();
        this.organizacion = new Organizacion();
        this.necesidad = new Necesidad();
        this.objetoContrato = new ObjetoContrato();
        this.clasificacionJuridica = new ClasificacionJuridica();
        this.presupuesto = new Presupuesto();
        this.procedimiento = new Procedimiento();
        this.licitacion = new Licitacion();
        this.solvencia = new Solvencia();
        this.criterios = new Criterios();
        this.condicionesEspeciales = new CondicionesEspeciales();
        this.ejecucion = new Ejecucion();
        this.documentacion = new Documentacion();
        this.auditoria = new Auditoria();
        this.estado = new EstadoExpediente();
    }
}
