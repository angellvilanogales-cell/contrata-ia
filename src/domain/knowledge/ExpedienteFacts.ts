/**
 * ============================================================
 * CONTRATA IA
 * ExpedienteFacts
 * ============================================================
 *
 * Convierte un expediente administrativo en un conjunto
 * de hechos que podrán ser interpretados por el motor
 * de reglas.
 *
 * Ningún motor jurídico accederá directamente al expediente.
 *
 * Todos razonarán sobre hechos.
 *
 * ============================================================
 */

import { Expediente } from "../expediente/Expediente";
import { KnowledgeFact } from "../../knowledge/KnowledgeFact";

export class ExpedienteFacts {

    /**
     * Extrae todos los hechos conocidos
     * del expediente.
     */
    public obtener(
        expediente: Expediente
    ): KnowledgeFact[] {

        const hechos: KnowledgeFact[] = [];

        hechos.push({

            nombre: "tipoContrato",

            valor: expediente.tipoContrato

        });

        hechos.push({

            nombre: "valorEstimado",

            valor: expediente.valorEstimado

        });

        hechos.push({

            nombre: "duracion",

            valor: expediente.duracion

        });

        hechos.push({

            nombre: "prorrogas",

            valor: expediente.prorrogas

        });

        hechos.push({

            nombre: "cpv",

            valor: expediente.cpv

        });

        hechos.push({

            nombre: "divisionLotes",

            valor: expediente.divisionLotes

        });

        hechos.push({

            nombre: "procedimiento",

            valor: expediente.procedimiento

        });

        hechos.push({

            nombre: "urgencia",

            valor: expediente.urgencia

        });

        return hechos;

    }

}
