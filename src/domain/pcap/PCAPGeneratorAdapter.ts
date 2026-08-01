/******************************************************************************************
 *
 * CONTRATA-IA
 *
 * PCAP GENERATOR ADAPTER
 *
 * Archivo:
 * PCAPGeneratorAdapter.ts
 *
 * Adaptador entre el nuevo Framework Documental
 * y el motor histórico del PCAP.
 *
 ******************************************************************************************/

import {

    DocumentType,

    DocumentSection,

    DocumentAnnex

} from "../document-composer/types";

import { BaseDocumentGenerator }
from "../document-composer/BaseDocumentGenerator";

import { PCAPGeneratorEngine }
from "./PCAPGeneratorEngine";

export class PCAPGeneratorAdapter
extends BaseDocumentGenerator {

    public readonly type = DocumentType.PCAP;

    private readonly engine: PCAPGeneratorEngine;

    constructor() {

        super();

        this.engine = new PCAPGeneratorEngine();

    }

    /**
     * Punto de entrada del Framework.
     */

    protected async buildDocument(): Promise<void> {

        const expediente = this.getExpediente<any>();

        /**
         * El motor antiguo continúa siendo
         * el responsable de construir
         * el PCAP.
         */

        const result = await this.engine.generate(

            expediente

        );

        this.importMetadata(result);

        this.importSections(result);

        this.importAnnexes(result);

        this.importMessages(result);

    }

    /**
     * -----------------------------
     * METADATOS
     * -----------------------------
     */

    private importMetadata(

        result: any

    ): void {

        if (!result) {

            return;

        }

        if (result.metadata?.title) {

            this.setTitle(

                result.metadata.title

            );

        }

        if (result.metadata?.subtitle) {

            this.setSubtitle(

                result.metadata.subtitle

            );

        }

        if (result.metadata?.version) {

            this.updateVersion(

                result.metadata.version

            );

        }

        if (result.metadata?.expediente) {

            this.updateExpediente(

                result.metadata.expediente

            );

        }

    }

    /**
     * -----------------------------
     * SECCIONES
     * -----------------------------
     */

    private importSections(

        result: any

    ): void {

        if (

            !result ||

            !Array.isArray(result.sections)

        ) {

            return;

        }

        result.sections.forEach(

            (section: DocumentSection) => {

                this.addSection(section);

            }

        );

    }

    /**
     * -----------------------------
     * ANEXOS
     * -----------------------------
     */

    private importAnnexes(

        result: any

    ): void {

        if (

            !result ||

            !Array.isArray(result.annexes)

        ) {

            return;

        }

        result.annexes.forEach(

            (annex: DocumentAnnex) => {

                this.addAnnex(annex);

            }

        );

    }

    /**
     * -----------------------------
     * MENSAJES
     * -----------------------------
     */

    private importMessages(

        result: any

    ): void {

        if (

            result?.warnings

        ) {

            result.warnings.forEach(

                (warning: string) =>

                    this.addWarning(warning)

            );

        }

        if (

            result?.errors

        ) {

            result.errors.forEach(

                (error: string) =>

                    this.addError(error)

            );

        }

    }

}

