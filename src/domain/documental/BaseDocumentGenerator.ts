/**
 * BaseDocumentGenerator — base común de los generadores documentales.
 */

import { ExpedienteContext } from "../expediente/ExpedienteContext";

export abstract class BaseDocumentGenerator {
    public async generar(contexto: ExpedienteContext): Promise<string> {
        this.validar(contexto);
        await this.preparar(contexto);
        const resultado = await this.generarDocumento(contexto);
        return this.finalizar(resultado, contexto);
    }

    protected async preparar(_contexto: ExpedienteContext): Promise<void> {}

    protected validar(contexto: ExpedienteContext): void {
        if (!contexto) throw new Error("ExpedienteContext no definido.");
    }

    protected abstract generarDocumento(contexto: ExpedienteContext): Promise<string>;

    protected async finalizar(resultado: string, _contexto: ExpedienteContext): Promise<string> {
        return resultado;
    }

    protected reemplazarVariables(plantilla: string, variables: Record<string, unknown>): string {
        let resultado = plantilla;
        for (const [clave, valor] of Object.entries(variables)) {
            resultado = resultado.replaceAll(`{{${clave}}}`, valor?.toString() ?? "");
        }
        return resultado;
    }

    protected limpiar(texto: string): string {
        return texto
            .replace(/\{\{.*?\}\}/g, "")
            .replace(/[ \t]+\n/g, "\n")
            .replace(/\n{3,}/g, "\n\n")
            .trim();
    }
}
