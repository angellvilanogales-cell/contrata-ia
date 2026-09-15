import type {StrictServicePilotSnapshot} from "../../intake/lb102/StrictServicePilotPackageGenerator";

const SEVILLA_OBJECT="Servicio de mantenimiento integral y gestión técnica de las instalaciones de los edificios de la red de oficinas y centros de la Dirección Provincial del Servicio Andaluz de Empleo de Sevilla";

/**
 * Snapshot de regresión extraído de la tríada primaria CONTR 2026 38892.
 * No constituye modelo general Service ni resuelve por analogía decisiones de otros expedientes.
 */
export const LB102_SERVICE_SEVILLA:StrictServicePilotSnapshot={
 caseId:"CONTR 2026 38892",sourceAuthority:"JDA_SAE_SEVILLA_MEMORIA_PCAP_PPT",sourceConfirmed:true,sourceConflict:false,
 sourceReferences:["Memoria justificativa CONTR 2026 38892 (13 páginas)","PCAP CONTR 2026 38892 (113 páginas)","PPT CONTR 2026 38892 (53 páginas)"],
 auditTerms:{object:"mantenimiento",cpv:"50700000",pbl:"1.003.195,13",estimatedValue:"1.823.991,14"},
 values:{
  PCAP:{
   caseId:"CONTR 2026 38892",title:SEVILLA_OBJECT,locationSummary:"Red de 34 oficinas y centros de la Dirección Provincial del SAE de Sevilla.",
   cpvSummary:"50700000-2 servicios de reparación y mantenimiento de equipos de edificios; 50413200-5 instalaciones contra incendios; 50710000-5 equipos eléctricos y mecánicos; además de los CPV de albañilería, fontanería y pintura declarados por la fuente.",
   objectSummary:SEVILLA_OBJECT,lotsSummary:"División en 4 lotes: climatización; protección contra incendios; electricidad/equipos electromecánicos; fontanería, albañilería, pintura y saneamiento.",
   reservedContractSummary:"No consta reserva singular en la Memoria primaria utilizada para este piloto.",needsBasedContractSummary:"No aplica la disposición adicional 33.ª, propia de determinados suministros en función de necesidades.",
   specificLegalRegimeSummary:"Contrato administrativo de servicios sujeto a la LCSP y a sus documentos contractuales específicos.",
   economicSummary:"Coste sin IVA 829.086,88 €; IVA 21 % 174.108,25 €; total con IVA 1.003.195,13 €; valor estimado 1.823.991,14 €.",
   budgetSummary:"Presupuesto total con IVA: 1.003.195,13 €; importe previo al IVA: 829.086,88 €.",estimatedValueSummary:"Valor estimado declarado: 1.823.991,14 €, incorporando modificación prevista máxima del 20 % y posible prórroga de 24 meses.",
   priceSummary:"Precio mixto según la fuente: actuaciones preventivas de los lotes 1, 2 y 3 a tanto alzado; actuaciones correctivas y lote 4 mediante precio unitario/coste medio hora.",
   durationSummary:"24 meses, prorrogables por otros 24 meses.",solvencySummary:"Solvencia económica-financiera y técnica-profesional según el apartado 6 de la Memoria y el PCAP; se admite acreditación mediante clasificación o requisitos específicos cuando proceda.",
   buyerProfileSummary:"Dirección Provincial del Servicio Andaluz de Empleo de Sevilla.",procedureSummary:"Procedimiento abierto, tramitación ordinaria y contrato sujeto a regulación armonizada según la Memoria.",
   guaranteesSummary:"Garantía definitiva: 5 % del precio final ofertado sin IVA para actuaciones preventivas de los lotes 1, 2 y 3; 5 % del presupuesto base correspondiente para actuaciones correctivas y lote 4, conforme a la fuente.",
   awardCriteriaSummary:"Criterios de adjudicación conforme al PCAP y a la Memoria específicos de CONTR 2026 38892.",specialExecutionConditionsSummary:"Recogida selectiva de residuos generados y retirada de embalajes/envases a los sistemas de gestión autorizados, según la Memoria.",
   subcontractingSummary:"Subcontratación conforme al PCAP y a la LCSP.",penaltiesSummary:"Penalidades conforme al PCAP específico.",paymentSummary:"Pagos parciales mensuales; mantenimiento preventivo mediante cuantía fija mensual y correctivo según actuaciones/horas efectivamente ejecutadas, con informe justificativo.",
   executionSummary:"Mantenimiento preventivo, técnico-legal, correctivo y gestión técnica de las instalaciones de la red provincial.",suspensionSummary:"Suspensión conforme a LCSP y PCAP.",
   modificationSummary:"Modificación prevista de hasta el 20 % computada en el valor estimado, según la Memoria.",dataProtectionSummary:"Protección de datos conforme al PCAP y a los tratamientos que efectivamente implique la prestación.",subrogationSummary:"No se presume subrogación fuera de lo que resulte expresamente de la documentación laboral y contractual del expediente."
  },
  MEMORY:{
   caseId:"CONTR 2026 38892",needAndOwnMeans:"La Dirección Provincial justifica la necesidad de conservar y mantener operativas sus instalaciones y declara carecer de medios personales y materiales suficientes para realizar el servicio.",
   object:SEVILLA_OBJECT,cpvMain:"50700000-2",lotsRegime:"Cuatro lotes especializados para promover concurrencia y especialización; la fuente prevé limitaciones de adjudicación conforme al artículo 99.4 LCSP.",
   economicSummary:"829.086,88 € sin IVA; IVA 174.108,25 €; total 1.003.195,13 €; valor estimado 1.823.991,14 €.",durationSummary:"24 meses prorrogables por otros 24 meses.",
   procedureAndSolvencySummary:"Procedimiento abierto, tramitación ordinaria y SARA; solvencia conforme a los criterios específicos de Memoria y PCAP.",awardCriteriaSummary:"Criterios de adjudicación conforme a los documentos primarios del expediente.",
   personnelAndExecutionSummary:"Dotaciones mínimas y especialidades por lote; mantenimiento sobre la red de 34 oficinas/centros de la provincia de Sevilla y gestión mediante las herramientas previstas en el PPT.",
   modificationSummary:"Modificación prevista máxima del 20 %, expresamente computada en el valor estimado."
  },
  PPT:{
   caseId:"CONTR 2026 38892",object:SEVILLA_OBJECT,contractManagement:"Dirección Provincial del SAE de Sevilla y persona responsable del contrato.",durationSummary:"24 meses con posibilidad de prórroga por otros 24 meses, conforme a la documentación primaria.",
   executionLocations:"Red de 34 oficinas y centros del SAE en la provincia de Sevilla, relacionados en el Anexo I del PPT.",
   technicalRequirements:"Mantenimiento integral preventivo, técnico-legal, correctivo y modificativo de las instalaciones, con gestión documental y técnica asociada.",
   serviceVariantRequirements:"Cuatro especialidades/lotes: climatización; protección contra incendios; electricidad/equipos electromecánicos; fontanería, albañilería, pintura y saneamiento.",
   personnelAndMeansRequirements:"Personal especializado, medios técnicos y documentación exigidos por el PPT para cada lote.",serviceControlAndExecutionConditions:"Plan de mantenimiento, gestión de incidencias, documentación técnica, control por la Dirección Provincial y condiciones de ejecución desarrolladas en el PPT."
  }
 }
};
