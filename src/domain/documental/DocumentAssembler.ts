import { DocumentResult } from "./DocumentResult";
import { DocumentContext } from "./DocumentContext";
import { MemoryGenerator } from "./generators/MemoryGenerator";
import { PCAPGenerator } from "./generators/PCAPGenerator";
import { PPTGenerator } from "./generators/PPTGenerator";
import { ResolutionGenerator } from "./generators/ResolutionGenerator";
import { AwardReportGenerator } from "./generators/AwardReportGenerator";
import { PublicationGenerator } from "./generators/PublicationGenerator";
import { NeedReportGenerator } from "./generators/NeedReportGenerator";
import { MeansInsufficiencyGenerator } from "./generators/MeansInsufficiencyGenerator";

export interface ExpedienteDocuments {
  memoria: DocumentResult;
  pcap: DocumentResult;
  ppt: DocumentResult;
}

export interface CompleteExpediente extends ExpedienteDocuments {
  necesidad: DocumentResult;
  insuficienciaMedios: DocumentResult;
  informeAdjudicacion?: DocumentResult;
  resolucionInicio?: DocumentResult;
  anuncioLicitacion?: DocumentResult;
  indice: string[];
}

export class DocumentAssembler {
  constructor(private readonly context: DocumentContext) {}

  public generate(): ExpedienteDocuments {
    return {
      memoria: new MemoryGenerator(this.context).generate(),
      pcap: new PCAPGenerator(this.context).generate(),
      ppt: new PPTGenerator(this.context).generate()
    };
  }

  public generateComplete(): CompleteExpediente {
    const memoria = new MemoryGenerator(this.context).generate();
    const pcap = new PCAPGenerator(this.context).generate();
    const ppt = new PPTGenerator(this.context).generate();
    const necesidad = new NeedReportGenerator(this.context).generate();
    const insuficienciaMedios = new MeansInsufficiencyGenerator(this.context).generate();
    const resolucionInicio = new ResolutionGenerator(this.context).generate();
    const anuncioLicitacion = new PublicationGenerator(this.context).generate();
    const informeAdjudicacion = new AwardReportGenerator(this.context).generate();

    const documents = [
      memoria,
      pcap,
      ppt,
      necesidad,
      insuficienciaMedios,
      resolucionInicio,
      anuncioLicitacion,
      informeAdjudicacion
    ];

    return {
      memoria,
      pcap,
      ppt,
      necesidad,
      insuficienciaMedios,
      resolucionInicio,
      anuncioLicitacion,
      informeAdjudicacion,
      indice: documents.map(document => document.metadata.title)
    };
  }

  public validate(expediente: CompleteExpediente): string[] {
    const errors: string[] = [];
    if (!expediente.memoria.sections.length) errors.push("La Memoria está vacía.");
    if (!expediente.pcap.sections.length) errors.push("El PCAP está vacío.");
    if (!expediente.ppt.sections.length) errors.push("El PPT está vacío.");
    return errors;
  }
}
