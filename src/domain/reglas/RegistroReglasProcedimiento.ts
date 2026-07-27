/**
 * CONTRATA IA
 * =========================================================
 * Registro central de reglas del procedimiento.
 *
 * Todas las reglas disponibles se registrarán aquí.
 * =========================================================
 */

import { ReglaProcedimiento } from "./ReglaProcedimiento";
import { ReglaContratoMenor } from "./ReglaContratoMenor";
import { ReglaAbierto } from "./ReglaAbierto";
import { ReglaAbiertoSimplificado } from "./ReglaAbiertoSimplificado";
import { ReglaRestringido } from "./ReglaRestringido";
import { ReglaNegociado } from "./ReglaNegociado";

export class RegistroReglasProcedimiento {

    static obtener(): ReglaProcedimiento[] {

        return [

            new ReglaContratoMenor(),

            new ReglaAbiertoSimplificado(),

            new ReglaAbierto(),

            new ReglaRestringido(),

            new ReglaNegociado()

        ];

    }

}
