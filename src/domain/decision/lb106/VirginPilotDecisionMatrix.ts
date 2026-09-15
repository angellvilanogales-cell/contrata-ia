import {
  CANONICAL_MEMORY_CORE,
  CANONICAL_PPT_CORE,
} from "../../documentModel/CanonicalMemoryPptStructure";

export const LB106_DECISION_MATRIX_VERSION = "LB106-VIRGIN-PILOT-DECISION-MATRIX-V1" as const;
export const LCSP_CONSOLIDATED_AT = "2026-04-09" as const;
const LCSP_URL = "https://www.boe.es/buscar/act.php?id=BOE-A-2017-12902";

export interface Lb106LegalBasis {
  id: string;
  norm: "Ley 9/2017, de 8 de noviembre, de Contratos del Sector Público";
  article: string;
  paragraph: string;
  relevantOfficialExcerpt: string;
  officialUrl: string;
  consolidatedAt: typeof LCSP_CONSOLIDATED_AT;
}

export interface Lb106DiscardedAlternative {
  alternative: string;
  rejectionRule: string;
  legalBasisIds: readonly string[];
}

export interface Lb106DecisionMatrixEntry {
  id: string;
  title: string;
  question: string;
  factPaths: readonly string[];
  proposalRule: string;
  applicationRule: string;
  legalBasisIds: readonly string[];
  discardedAlternatives: readonly Lb106DiscardedAlternative[];
  riskIfUnresolved: string;
  destinations: {
    memorySectionIds: readonly string[];
    pptSectionIds: readonly string[];
    pcapAuthorizedTargets: readonly string[];
  };
  consent: {
    required: true;
    owner: "RESPONSABLE_TECNICO_HUMANO";
    actions: readonly ["VALIDAR", "MODIFICAR", "RECHAZAR"];
    statement: string;
  };
}

function basis(id: string, article: string, paragraph: string, relevantOfficialExcerpt: string): Lb106LegalBasis {
  return {
    id,
    norm: "Ley 9/2017, de 8 de noviembre, de Contratos del Sector Público",
    article,
    paragraph,
    relevantOfficialExcerpt,
    officialUrl: `${LCSP_URL}#a${article.replace(/\D/g, "")}`,
    consolidatedAt: LCSP_CONSOLIDATED_AT,
  };
}

/**
 * Extractos breves y literales del texto consolidado oficial del BOE indicado.
 * No sustituyen la lectura del artículo completo: cada ficha enlaza su fuente.
 */
export const LB106_LEGAL_BASES: readonly Lb106LegalBasis[] = [
  basis("LCSP-28.1", "28", "1", "no podrán celebrar otros contratos que aquellos que sean necesarios para el cumplimiento y realización de sus fines institucionales"),
  basis("LCSP-29.2", "29", "2", "El contrato podrá prever una o varias prórrogas siempre que sus características permanezcan inalterables"),
  basis("LCSP-62.1", "62", "1", "deberán designar un responsable del contrato al que corresponderá supervisar su ejecución"),
  basis("LCSP-74.1", "74", "1", "deberán acreditar estar en posesión de las condiciones mínimas de solvencia económica y financiera y profesional o técnica"),
  basis("LCSP-99.1", "99", "1", "El objeto de los contratos del sector público deberá ser determinado"),
  basis("LCSP-99.2", "99", "2", "No podrá fraccionarse un contrato con la finalidad de disminuir la cuantía del mismo"),
  basis("LCSP-99.3", "99", "3", "Siempre que la naturaleza o el objeto del contrato lo permitan, deberá preverse la realización independiente de cada una de sus partes"),
  basis("LCSP-100.2", "100", "2", "el presupuesto base de licitación sea adecuado a los precios del mercado"),
  basis("LCSP-101.1", "101", "1", "el órgano de contratación tomará el importe total, sin incluir el Impuesto sobre el Valor Añadido"),
  basis("LCSP-101.2", "101", "2", "Cualquier forma de opción eventual y las eventuales prórrogas del contrato"),
  basis("LCSP-101.5", "101", "5", "El método de cálculo aplicado por el órgano de contratación para calcular el valor estimado en todo caso deberá figurar"),
  basis("LCSP-102.1", "102", "1", "Los contratos del sector público tendrán siempre un precio cierto"),
  basis("LCSP-103.2", "103", "2", "Previa justificación en el expediente y de conformidad con lo previsto en el Real Decreto"),
  basis("LCSP-102.7", "102", "7", "En los contratos celebrados con precios provisionales no cabrá la revisión de precios"),
  basis("LCSP-103.1", "103", "1", "Los precios de los contratos del sector público solo podrán ser objeto de revisión periódica y predeterminada"),
  basis("LCSP-103.2-MATERIALES", "103", "2", "la suma de la participación en el presupuesto base de licitación del contrato de las materias primas, bienes intermedios y energía que se hayan de emplear supere el 20 por ciento"),
  basis("LCSP-103.3", "103", "3", "el órgano de contratación podrá establecer el derecho a revisión periódica y predeterminada de precios y fijará la fórmula de revisión"),
  basis("LCSP-103.4", "103", "4", "El pliego de cláusulas administrativas particulares deberá detallar, en tales casos, la fórmula de revisión aplicable, que será invariable durante la vigencia del contrato"),
  basis("LCSP-103.5", "103", "5", "cuando el contrato se hubiese ejecutado, al menos, en el 20 por ciento de su importe y hubiese transcurrido un año desde su formalización"),
  basis("LCSP-106.1", "106", "1", "no procederá la exigencia de garantía provisional, salvo cuando de forma excepcional"),
  basis("LCSP-107.1", "107", "1", "una garantía de un 5 por 100 del precio final ofertado por aquellos, excluido el Impuesto sobre el Valor Añadido"),
  basis("LCSP-107.2", "107", "2", "se preste una complementaria de hasta un 5 por 100 del precio final ofertado"),
  basis("LCSP-116.1", "116", "1", "se iniciará por el órgano de contratación motivando la necesidad del contrato"),
  basis("LCSP-116.3", "116", "3", "Al expediente se incorporarán el pliego de cláusulas administrativas particulares y el de prescripciones técnicas"),
  basis("LCSP-116.4", "116", "4", "En el expediente se justificará adecuadamente"),
  basis("LCSP-122.1", "122", "1", "Los pliegos de cláusulas administrativas particulares deberán aprobarse previamente a la autorización del gasto"),
  basis("LCSP-122.2-DATA-GENERAL", "122", "2", "los pliegos deberán mencionar expresamente la obligación del futuro contratista de respetar la normativa vigente en materia de protección de datos"),
  basis("LCSP-122.2-DATA-PROCESSOR", "122", "2.a-b", "los pliegos deberán hacer constar la finalidad de la cesión y la obligación de someterse a la normativa nacional y de la Unión Europea"),
  basis("LCSP-122.2-DATA-SERVERS", "122", "2.c-e", "la adjudicataria declarará la ubicación de servidores, servicios asociados y subcontratación prevista"),
  basis("LCSP-122.2-DATA-ESSENTIAL", "122", "2", "Las obligaciones de las letras a) a e) deberán ser calificadas como esenciales"),
  basis("LCSP-124", "124", "único", "El órgano de contratación aprobará con anterioridad a la autorización del gasto o conjuntamente con ella"),
  basis("LCSP-125.1", "125", "1", "prescripción técnica: aquella especificación que figure en un documento en la que se definan las características exigidas de un producto o de un servicio"),
  basis("LCSP-126.1", "126", "1", "proporcionarán a los empresarios acceso en condiciones de igualdad al procedimiento de contratación"),
  basis("LCSP-126.2", "126", "2", "siempre que estén vinculados al objeto del contrato y guarden proporción con el valor y los objetivos de este"),
  basis("LCSP-126.3", "126", "3", "se tengan en cuenta la Convención de las Naciones Unidas sobre los derechos de las personas con discapacidad, así como los criterios de accesibilidad universal"),
  basis("LCSP-126.4", "126", "4", "las prescripciones técnicas se definirán aplicando criterios de sostenibilidad y protección ambiental"),
  basis("LCSP-126.5", "126", "5", "las prescripciones técnicas se formularán de una de las siguientes maneras"),
  basis("LCSP-126.6", "126", "6", "las prescripciones técnicas no harán referencia a una fabricación o una procedencia determinada"),
  basis("LCSP-128.1", "128", "1", "Los órganos de contratación podrán exigir que los operadores económicos proporcionen un informe de pruebas"),
  basis("LCSP-131.2", "131", "2", "La adjudicación se realizará, ordinariamente utilizando una pluralidad de criterios de adjudicación basados en el principio de mejor relación calidad-precio"),
  basis("LCSP-145.5", "145", "5", "Los criterios a que se refiere el apartado 1 que han de servir de base para la adjudicación del contrato"),
  basis("LCSP-159.6", "159", "6", "En contratos de suministros y de servicios de valor estimado inferior a 60.000 euros"),
  basis("LCSP-198.4", "198", "4", "La Administración tendrá la obligación de abonar el precio dentro de los treinta días siguientes"),
  basis("LCSP-197", "197", "único", "La ejecución del contrato se realizará a riesgo y ventura del contratista"),
  basis("LCSP-198.2", "198", "2", "El pago del precio podrá hacerse de manera total o parcial, mediante abonos a cuenta o, en el caso de contratos de tracto sucesivo, mediante pago en cada uno de los vencimientos que se hubiesen estipulado"),
  basis("LCSP-202.1", "202", "1", "será obligatorio el establecimiento en el pliego de cláusulas administrativas particulares de al menos una de las condiciones especiales de ejecución"),
  basis("LCSP-202.1-DATA", "202", "1", "cuando la ejecución implique cesión de datos será obligatoria una condición especial sobre sometimiento a la normativa de protección de datos"),
  basis("LCSP-202.3", "202", "3", "Los pliegos podrán establecer penalidades"),
  basis("LCSP-202.4", "202", "4", "serán exigidas igualmente a todos los subcontratistas que participen de la ejecución"),
  basis("LCSP-204.1", "204", "1", "hasta un máximo del veinte por ciento del precio inicial"),
  basis("LCSP-204.1.a", "204", "1.a", "La cláusula de modificación deberá estar formulada de forma clara, precisa e inequívoca"),
  basis("LCSP-203.2", "203", "2", "Los contratos administrativos celebrados por los órganos de contratación solo podrán modificarse durante su vigencia cuando se dé alguno de los siguientes supuestos"),
  basis("LCSP-204.1.b", "204", "1.b", "la cláusula de modificación deberá precisar con el detalle suficiente: su alcance, límites y naturaleza"),
  basis("LCSP-204.1-PRECIO", "204", "1", "la modificación no podrá suponer el establecimiento de nuevos precios unitarios no previstos en el contrato"),
  basis("LCSP-204.2", "204", "2", "no podrán prever en el pliego de cláusulas administrativas particulares modificaciones que puedan alterar la naturaleza global del contrato inicial"),
  basis("LCSP-210.2", "210", "2", "se exigirá por parte de la Administración un acto formal y positivo de recepción o conformidad"),
  basis("LCSP-210.3", "210", "3", "En los contratos se fijará un plazo de garantía a contar de la fecha de recepción o conformidad"),
  basis("LCSP-210.4", "210", "4", "dentro del plazo de treinta días a contar desde la fecha del acta de recepción o conformidad, deberá acordarse en su caso"),
  basis("LCSP-215.1", "215", "1", "El contratista podrá concertar con terceros la realización parcial de la prestación"),
  basis("LCSP-214.1", "214", "1", "Los derechos y obligaciones dimanantes del contrato podrán ser cedidos por el contratista a un tercero cuando las cualidades técnicas o personales del cedente no hayan sido razón determinante de la adjudicación"),
  basis("LCSP-214.2", "214", "2", "Para que los contratistas puedan ceder sus derechos y obligaciones a terceros, los pliegos deberán contemplar, como mínimo, la exigencia de los siguientes requisitos"),
  basis("LCSP-215.2.a", "215", "2.a", "Los pliegos podrán establecer que los licitadores deberán indicar en la oferta la parte del contrato que tengan previsto subcontratar"),
  basis("LCSP-215.2.b", "215", "2.b", "el contratista deberá comunicar por escrito, tras la adjudicación del contrato y, a más tardar, cuando inicie la ejecución de este"),
  basis("LCSP-215.2.e", "215", "2.e", "determinadas tareas críticas no puedan ser objeto de subcontratación, debiendo ser estas ejecutadas directamente por el contratista principal"),
  basis("LCSP-215.4", "215", "4", "Los subcontratistas quedarán obligados solo ante el contratista principal que asumirá, por tanto, la total responsabilidad de la ejecución del contrato frente a la Administración"),
  basis("LCSP-217.1", "217", "1", "Las Administraciones Públicas y demás entes públicos contratantes podrán comprobar el estricto cumplimiento de los pagos"),
  basis("LCSP-217.2", "217", "2", "serán obligatorias para las Administraciones Públicas y demás entes públicos contratantes, en los contratos de obras y en los contratos de servicios cuyo valor estimado supere los 5 millones de euros"),
  basis("LCSP-300.1", "300", "1", "El contratista estará obligado a entregar los bienes objeto de suministro en el tiempo y lugar fijados"),
  basis("LCSP-301.1", "301", "1", "derecho al abono del precio de los suministros efectivamente entregados y formalmente recibidos"),
  basis("LCSP-304.2", "304", "2", "se hará constar así en el acta de recepción y se darán las instrucciones precisas al contratista para que subsane los defectos observados"),
  basis("LCSP-311.1", "311", "1", "El contrato se ejecutará con sujeción a lo establecido en su clausulado y en los pliegos"),
  basis("LCSP-311.3", "311", "3", "La Administración determinará si la prestación realizada por el contratista se ajusta a las prescripciones establecidas"),
  basis("LCSP-DA4.1", "DA4", "1", "se fijarán porcentajes mínimos de reserva del derecho a participar en los procedimientos de adjudicación"),
  basis("LCSP-DA33", "DA33", "único", "deberá aprobarse un presupuesto máximo"),
] as const;

const consent = {
  required: true as const,
  owner: "RESPONSABLE_TECNICO_HUMANO" as const,
  actions: ["VALIDAR", "MODIFICAR", "RECHAZAR"] as const,
  statement: "La propuesta no se incorpora al expediente hasta que una persona responsable valide, modifique o rechace motivadamente la decisión.",
};

function alt(alternative: string, rejectionRule: string, ...legalBasisIds: string[]): Lb106DiscardedAlternative {
  return { alternative, rejectionRule, legalBasisIds };
}

export const LB106_VIRGIN_PILOT_DECISION_MATRIX: readonly Lb106DecisionMatrixEntry[] = [
  {id:"D01_NEED_COMPETENCE",title:"Necesidad, idoneidad y competencia",question:"¿Qué necesidad institucional concreta debe atenderse, por qué es necesario contratar y qué órgano resulta competente?",factPaths:["need","administrative.contractingAuthority"],proposalRule:"Estructurar los hechos declarados; nunca inventar la necesidad ni la competencia.",applicationRule:"Explicar cómo el objeto propuesto satisface de forma idónea la necesidad declarada.",legalBasisIds:["LCSP-28.1","LCSP-116.1"],discardedAlternatives:[alt("No contratar","Se descarta solo si la necesidad no puede satisfacerse adecuadamente con medios disponibles.","LCSP-28.1")],riskIfUnresolved:"Contrato innecesario o memoria preparatoria inmotivada.",destinations:{memorySectionIds:["BACKGROUND_COMPETENCE","NEED_SUITABILITY"],pptSectionIds:[],pcapAuthorizedTargets:["ANNEX_I.AUTHORITY","ANNEX_I.OBJECT"]},consent},
  {id:"D02_OBJECT_NATURE_CPV",title:"Objeto, naturaleza y CPV",question:"¿Cuál es la prestación completa, su naturaleza contractual y el CPV principal que mejor la identifica?",factPaths:["object","contractType","cpvMain"],proposalRule:"Proponer naturaleza y CPV desde la prestación declarada, mostrando la inferencia para validación.",applicationRule:"Comprobar que el objeto es determinado y abarca toda la necesidad sin fraccionamiento artificioso.",legalBasisIds:["LCSP-99.1","LCSP-99.2"],discardedAlternatives:[alt("Otro tipo contractual o CPV","Se mantiene como alternativa hasta contrastar la prestación principal; no se descarta por semejanza con otro expediente.","LCSP-99.1")],riskIfUnresolved:"Selección errónea de régimen, procedimiento o modelo PCAP.",destinations:{memorySectionIds:["OBJECT_NATURE_CPV"],pptSectionIds:["TECHNICAL_OBJECT_SCOPE"],pcapAuthorizedTargets:["ANNEX_I.OBJECT","ANNEX_I.CPV"]},consent},
  {id:"D03_LOTS_RESERVATION",title:"División en lotes y reserva",question:"¿Las prestaciones son separables, se dividirán en lotes y existe una reserva legalmente aplicable?",factPaths:["lots.divisionIntoLots","lots.noDivisionJustification","lots.lots","administrative.reservedContractDa4"],proposalRule:"Partir de la división como regla cuando el objeto lo permita y exigir motivación concreta para no dividir.",applicationRule:"Contrastar autonomía, coordinación, competencia y configuración económica de cada lote.",legalBasisIds:["LCSP-99.3","LCSP-DA4.1"],discardedAlternatives:[alt("Lote único sin motivación","No es admisible cuando la naturaleza permite división y no se acredita un motivo válido.","LCSP-99.3"),alt("Reserva automática","No se activa sin decisión y supuesto habilitante expresos.","LCSP-DA4.1")],riskIfUnresolved:"Restricción injustificada de competencia o configuración incoherente de lotes.",destinations:{memorySectionIds:["LOTS"],pptSectionIds:["TECHNICAL_OBJECT_SCOPE"],pcapAuthorizedTargets:["ANNEX_I.LOTS","ANNEX_I.RESERVATION"]},consent},
  {id:"D04_BUDGET_PRICE_VAT",title:"Presupuesto, precio e IVA",question:"¿Cuál es el presupuesto adecuado al mercado, su desglose, el IVA y el sistema de determinación del precio?",factPaths:["baseTenderBudgetCents","economic.initialVatAmountCents","economic.initialPblVatIncludedCents","economic.priceDeterminationRegime","economic.unitPrices"],proposalRule:"Calcular únicamente desde importes o unidades declarados y conservar el IVA como partida independiente.",applicationRule:"Verificar adecuación a mercado, coherencia aritmética y correspondencia con lotes o precios unitarios.",legalBasisIds:["LCSP-100.2","LCSP-102.1"],discardedAlternatives:[alt("Importe inferido de un precedente","No es fuente suficiente del precio del expediente nuevo.","LCSP-100.2")],riskIfUnresolved:"Presupuesto inadecuado, inconsistencia económica o precio indeterminado.",destinations:{memorySectionIds:["BUDGET_PRICE"],pptSectionIds:["MINIMUM_TECHNICAL_REQUIREMENTS"],pcapAuthorizedTargets:["ANNEX_I.BUDGET","ANNEX_I.PRICE"]},consent},
  {id:"D05_ESTIMATED_VALUE",title:"Valor estimado y método",question:"¿Cuál es el valor estimado sin IVA y qué componentes y método justifican su cálculo?",factPaths:["economic.legalEstimatedValueCents","economic.estimatedValueCalculationMethod","economic.budgetCoversEntireContractLife","economic.maximumApprovedBudgetCents"],proposalRule:"Sumar solo componentes jurídicamente aplicables y declarados, incluyendo prórrogas y modificaciones al alza cuando procedan.",applicationRule:"Mostrar fórmula, componentes y exclusión del IVA; nunca equiparar automáticamente PBL y valor estimado.",legalBasisIds:["LCSP-101.1","LCSP-101.2","LCSP-101.5"],discardedAlternatives:[alt("Copiar el PBL como valor estimado","Solo coincide si la estructura temporal y todas las opciones acreditan esa igualdad.","LCSP-101.1","LCSP-101.2")],riskIfUnresolved:"Procedimiento o publicidad incorrectos y memoria económica no reproducible.",destinations:{memorySectionIds:["ESTIMATED_VALUE"],pptSectionIds:[],pcapAuthorizedTargets:["ANNEX_I.ESTIMATED_VALUE","ANNEX_I.ESTIMATED_VALUE_METHOD"]},consent},
  {id:"D06_DA33_NEEDS",title:"Suministro por necesidades",question:"¿Las unidades son estimativas y se ejecutarán pedidos sucesivos contra un presupuesto máximo?",factPaths:["economic.needsBasedContractDa33","technical.hasSuccessiveOrders","economic.maximumApprovedBudgetCents"],proposalRule:"Activar la DA 33.ª solo por hechos expresos; separar cantidades estimadas, precios unitarios y presupuesto máximo.",applicationRule:"Impedir que consumos estimados se conviertan en obligación de gasto o que se añadan referencias no previstas.",legalBasisIds:["LCSP-DA33","LCSP-102.1"],discardedAlternatives:[alt("Cantidades cerradas","Se descarta únicamente si existen pedidos sucesivos dependientes de necesidades reales.","LCSP-DA33")],riskIfUnresolved:"Confusión entre consumo, presupuesto máximo y valor estimado.",destinations:{memorySectionIds:["ESTIMATED_VALUE"],pptSectionIds:["MINIMUM_TECHNICAL_REQUIREMENTS","RECEPTION_CONFORMITY"],pcapAuthorizedTargets:["ANNEX_I.DA33"]},consent},
  {id:"D07_FUNDING_ANNUALITIES",title:"Financiación y anualidades",question:"¿Qué fuente de financiación y distribución anual del gasto constarán en el expediente?",factPaths:["economic.fundingSource","economic.annualityBudgetRows"],proposalRule:"Conservar la declaración presupuestaria por anualidad sin inventar aplicaciones ni normalizar diferencias.",applicationRule:"Seleccionar el perfil PCAP únicamente después de validar la financiación.",legalBasisIds:["LCSP-116.3","LCSP-122.1"],discardedAlternatives:[alt("Financiación desconocida","No habilita una plantilla física específica.","LCSP-116.3")],riskIfUnresolved:"Selección de modelo incompatible o falta de cobertura presupuestaria documentada.",destinations:{memorySectionIds:["FUNDING_ANNUALITIES"],pptSectionIds:[],pcapAuthorizedTargets:["ANNEX_I.FUNDING","ANNEX_I.ANNUALITIES"]},consent},
  {id:"D08_DURATION_EXTENSIONS",title:"Duración y prórrogas",question:"¿Cuál es la duración necesaria y qué prórrogas, estructura y preaviso se prevén?",factPaths:["durationMonths","extensionMonths","execution.extensionStructure","execution.extensionNoticeMonths"],proposalRule:"Proponer coherencia temporal sin presumir prórrogas.",applicationRule:"Relacionar duración con la naturaleza de la prestación y mantener inalterables las características durante la prórroga.",legalBasisIds:["LCSP-29.2"],discardedAlternatives:[alt("Prórroga tácita o indefinida","No se incorpora al expediente.","LCSP-29.2")],riskIfUnresolved:"Duración desproporcionada o prórroga inválidamente configurada.",destinations:{memorySectionIds:["DURATION_EXTENSIONS"],pptSectionIds:["TERM_LOCATION_DELIVERY"],pcapAuthorizedTargets:["ANNEX_I.DURATION","ANNEX_I.EXTENSIONS"]},consent},
  {id:"D09_PROCEDURE_PROCESSING",title:"Procedimiento y tramitación",question:"¿Qué procedimiento resulta aplicable y la tramitación será ordinaria o urgente?",factPaths:["procedure","processing.processingType"],proposalRule:"El motor propone desde tipo, valor estimado, criterios y régimen; la persona confirma el supuesto legal.",applicationRule:"Justificar expresamente la elección y bloquear ASA si no cumple todos sus requisitos.",legalBasisIds:["LCSP-116.4","LCSP-131.2","LCSP-159.6"],discardedAlternatives:[alt("Procedimiento elegido solo por comodidad","No constituye motivación jurídica suficiente.","LCSP-116.4"),alt("ASA fuera de su ámbito","Debe utilizarse otro procedimiento compatible.","LCSP-159.6")],riskIfUnresolved:"Procedimiento de adjudicación incorrecto.",destinations:{memorySectionIds:["PROCEDURE_PROCESSING"],pptSectionIds:[],pcapAuthorizedTargets:["ANNEX_I.PROCEDURE","ANNEX_I.PROCESSING"]},consent},
  {id:"D10_SOLVENCY_CAPACITY",title:"Capacidad, habilitación y solvencia",question:"¿Qué habilitación y solvencia, vinculadas y proporcionales al objeto, se exigirán cuando proceda?",factPaths:["criteria.economicSolvency","criteria.technicalSolvency"],proposalRule:"No inventar umbrales; pedir la decisión concreta cuando el procedimiento la requiera.",applicationRule:"Vincular cada medio y umbral a riesgos o capacidades necesarias para ejecutar la prestación.",legalBasisIds:["LCSP-74.1","LCSP-116.4"],discardedAlternatives:[alt("Solvencia genérica o copiada","No acredita proporcionalidad respecto del contrato nuevo.","LCSP-74.1")],riskIfUnresolved:"Restricción desproporcionada o falta de aptitud exigible.",destinations:{memorySectionIds:["CAPACITY_SOLVENCY"],pptSectionIds:["PERSONNEL_MATERIAL_MEANS"],pcapAuthorizedTargets:["ANNEX_I.SOLVENCY"]},consent},
  {id:"D11_AWARD_CRITERIA",title:"Criterios de adjudicación",question:"¿Qué criterios, ponderaciones y fórmulas permiten seleccionar la mejor oferta para este objeto?",factPaths:["criteria.awardCriteria","criteria.singleCriterionMotivation"],proposalRule:"Comprobar suma, objetividad, vinculación al objeto y compatibilidad procedimental.",applicationRule:"Justificar la elección y, cuando exista un criterio único, su suficiencia para el objeto.",legalBasisIds:["LCSP-116.4","LCSP-131.2","LCSP-145.5"],discardedAlternatives:[alt("Criterio sin relación con el objeto","No puede incorporarse a la propuesta.","LCSP-145.5")],riskIfUnresolved:"Evaluación arbitraria o procedimiento incompatible.",destinations:{memorySectionIds:["AWARD_CRITERIA"],pptSectionIds:["COORDINATION_QUALITY"],pcapAuthorizedTargets:["ANNEX_I.AWARD_CRITERIA"]},consent},
  {id:"D12_GUARANTEES",title:"Garantías",question:"¿Qué garantías proceden, sobre qué base se calculan y qué plazo de garantía contractual resulta adecuado?",factPaths:["guarantees.provisionalGuaranteeRequired","guarantees.provisionalGuaranteePercent","guarantees.provisionalGuaranteeJustification","guarantees.definitiveGuaranteePercent","guarantees.definitiveGuaranteeRegime","guarantees.complementaryGuaranteePercent","guarantees.complementaryGuaranteeJustification","guarantees.warrantyPeriodMonths","guarantees.warrantyPeriodRegime"],proposalRule:"Aplicar la regla legal del procedimiento, distinguir garantía provisional, definitiva, complementaria y plazo de garantía, y exigir motivación para toda excepción.",applicationRule:"Materializar únicamente la opción validada en los huecos del Anexo I; la garantía técnica del PPT no sustituye las garantías contractuales.",legalBasisIds:["LCSP-106.1","LCSP-107.1","LCSP-107.2","LCSP-159.6","LCSP-210.3"],discardedAlternatives:[alt("Garantía provisional automática","La regla general es su improcedencia salvo excepción motivada.","LCSP-106.1"),alt("Plazo de garantía omitido sin explicación","Debe fijarse o justificarse expresamente que la naturaleza o características no lo requieren.","LCSP-210.3")],riskIfUnresolved:"Garantía improcedente, base de cálculo incorrecta o plazo de garantía indeterminado.",destinations:{memorySectionIds:["GUARANTEES"],pptSectionIds:["WARRANTY_SUPPORT"],pcapAuthorizedTargets:["ANNEX_I.GUARANTEES","ANNEX_I.WARRANTY"]},consent},
  {id:"D13_SPECIAL_EXECUTION",title:"Condiciones especiales de ejecución",question:"¿Qué condición social, ambiental, ética o de otro orden, vinculada al objeto, verificable y aplicable a subcontratistas, se establece?",factPaths:["execution.specialExecutionConditions","execution.specialExecutionConditionsJustification","execution.specialExecutionConditionsVerification","execution.specialExecutionConditionsConsequences","execution.specialExecutionConditionsApplyToSubcontractors"],proposalRule:"Proponer alternativas relacionadas con la prestación, detectar los supuestos obligatorios de datos y alimentación pública, sin convertirlas en decisión automática.",applicationRule:"Comprobar vínculo, no discriminación, verificabilidad, consecuencia del incumplimiento, extensión a subcontratistas y constancia en anuncio y pliegos.",legalBasisIds:["LCSP-202.1","LCSP-202.3","LCSP-202.4"],discardedAlternatives:[alt("No establecer ninguna condición","El PCAP debe contener al menos una.","LCSP-202.1"),alt("Condición genérica no verificable","No permite controlar el cumplimiento durante la ejecución.","LCSP-202.1")],riskIfUnresolved:"Incumplimiento de una exigencia legal obligatoria o condición imposible de controlar.",destinations:{memorySectionIds:["SPECIAL_EXECUTION"],pptSectionIds:["ENVIRONMENT_WASTE"],pcapAuthorizedTargets:["ANNEX_I.SPECIAL_EXECUTION"]},consent},
  {id:"D14_SUBCONTRACT_ASSIGNMENT",title:"Subcontratación y cesión",question:"¿Qué régimen de subcontratación, tareas críticas, comunicaciones, control de pagos y condiciones de cesión resultan aplicables?",factPaths:["execution.subcontractingRegime","execution.subcontractingCriticalTasks","execution.subcontractingPriorOfferDisclosure","execution.subcontractingCommunicationRegime","execution.subcontractingPaymentControlRegime","execution.assignmentRegime","execution.assignmentRequirements"],proposalRule:"Separar subcontratación y cesión; aplicar el régimen legal general y proponer únicamente restricciones derivadas de hechos declarados.",applicationRule:"Identificar y motivar tareas críticas; declarar comunicaciones y control de pagos; admitir o excluir la cesión solo por sus condiciones legales y hacer constar expresamente lo no aplicable.",legalBasisIds:["LCSP-214.1","LCSP-214.2","LCSP-215.1","LCSP-215.2.a","LCSP-215.2.b","LCSP-215.2.e","LCSP-215.4","LCSP-217.1","LCSP-217.2"],discardedAlternatives:[alt("Prohibición genérica de subcontratar","No puede imponerse sin identificar una tarea crítica legalmente admisible y justificarla.","LCSP-215.1","LCSP-215.2.e"),alt("Cesión automática","Requiere previsión inequívoca y el cumplimiento de todas las condiciones legales.","LCSP-214.1","LCSP-214.2")],riskIfUnresolved:"Restricción de competencia, tarea crítica inmotivada, ausencia de control obligatorio o cesión configurada contra la ley.",destinations:{memorySectionIds:["SUBCONTRACTING_ASSIGNMENT"],pptSectionIds:["TECHNICAL_OBLIGATIONS"],pcapAuthorizedTargets:["ANNEX_I.SUBCONTRACTING","ANNEX_I.ASSIGNMENT"]},consent},
  {id:"D15_MODIFICATIONS",title:"Modificaciones previstas",question:"¿Existe una necesidad objetivamente anticipable de modificar, con qué causas, alcance, límites, procedimiento y máximo acumulado?",factPaths:["modificationPercent","economic.modificationAmountExVatCents","execution.plannedModificationRegime","execution.plannedModificationJustification","execution.plannedModificationProcedure","execution.plannedModificationNoNewUnitPrices","execution.plannedModificationValueEstimatedTreatment"],proposalRule:"Partir de que no se prevén modificaciones; solo proponer una cláusula del artículo 204 cuando los hechos permitan delimitarla íntegramente.",applicationRule:"Comprobar máximo acumulado del 20 %, causas y condiciones objetivas, alcance, límites, procedimiento, conservación de la naturaleza global, ausencia de precios unitarios nuevos y cómputo de todo incremento en el valor estimado.",legalBasisIds:["LCSP-101.2","LCSP-203.2","LCSP-204.1","LCSP-204.1.a","LCSP-204.1.b","LCSP-204.1-PRECIO","LCSP-204.2"],discardedAlternatives:[alt("Cláusula abierta o genérica","No satisface claridad, precisión ni permite conocer su alcance exacto.","LCSP-204.1.a","LCSP-204.1.b"),alt("Superar el 20 por ciento acumulado","Excede el máximo de la modificación prevista del artículo 204.","LCSP-204.1"),alt("Introducir precios unitarios nuevos","Está expresamente prohibido para la modificación prevista.","LCSP-204.1-PRECIO"),alt("Preautorizar futuras circunstancias imprevisibles","El artículo 205 solo puede examinarse excepcionalmente cuando concurra el supuesto durante la vigencia.","LCSP-203.2")],riskIfUnresolved:"Cláusula inválida, alteración sustancial, modificación sin cobertura o valor estimado infracalculado.",destinations:{memorySectionIds:["MODIFICATIONS"],pptSectionIds:[],pcapAuthorizedTargets:["ANNEX_I.MODIFICATIONS"]},consent},
  {id:"D16_PRICE_REVISION",title:"Revisión de precios",question:"¿Existe habilitación para una revisión periódica y predeterminada y, si se establece, qué justificación, fórmula, costes, índices y límites temporales se aplican?",factPaths:["economic.priceRevisionRegime","economic.priceRevisionJustification","economic.priceRevisionFormula","economic.priceRevisionCostStructure","economic.priceRevisionIndices","economic.priceRevisionAccrualLimits","economic.priceRevisionPhysicalProfileSupported"],proposalRule:"Partir de «No procede», analizar los hechos del contrato y elevar cualquier supuesto potencialmente revisable a decisión humana con fórmula e índices acreditados.",applicationRule:"Excluir precios provisionales; comprobar tipo contractual, recuperación de inversión o peso de costes; exigir fórmula invariable, índices oficiales y límites de devengo, y bloquear perfiles físicos incompatibles.",legalBasisIds:["LCSP-102.7","LCSP-103.1","LCSP-103.2","LCSP-103.2-MATERIALES","LCSP-103.3","LCSP-103.4","LCSP-103.5"],discardedAlternatives:[alt("Actualización automática por IPC","La revisión no puede ser genérica: debe ser periódica, predeterminada y ajustarse al régimen legal.","LCSP-103.1"),alt("Fórmula creada a partir de un precedente","La fórmula aplicable debe justificarse para el contrato y permanecer invariable.","LCSP-103.3","LCSP-103.4"),alt("Revisión de un precio provisional","Está expresamente excluida.","LCSP-102.7")],riskIfUnresolved:"Indexación ilegal, fórmula no aplicable, coste revisable incorrecto o generación con un modelo físico no acreditado.",destinations:{memorySectionIds:["PRICE_REVISION"],pptSectionIds:[],pcapAuthorizedTargets:["ANNEX_I.PRICE_REVISION"]},consent},
  {id:"D17_EXECUTION_RECEIPT_PAYMENT",title:"Responsable, ejecución, recepción y pago",question:"¿Qué persona o unidad supervisará el contrato, con qué facultades, cómo se ejecutará y comprobará la prestación, qué acto formal acreditará la conformidad y qué régimen de factura y pago se aplicará?",factPaths:["administrative.contractManager","technical.executionLocations","execution.contractManagerFunctions","execution.performanceMonitoringRegime","execution.receiptAndAcceptanceRegime","execution.invoiceSubmissionRegime","execution.paymentRegime"],proposalRule:"Proponer funciones, controles y secuencia documental desde el tipo y objeto; no inventar identidad del responsable, unidades administrativas, códigos de facturación ni lugares.",applicationRule:"Separar y conectar ejecución, evidencias de seguimiento, recepción o conformidad formal, subsanación, factura electrónica y pago; hacer constar expresamente todos los elementos aunque alguno se configure como no aplicable.",legalBasisIds:["LCSP-62.1","LCSP-197","LCSP-198.2","LCSP-198.4","LCSP-210.2","LCSP-210.4","LCSP-300.1","LCSP-301.1","LCSP-304.2","LCSP-311.1","LCSP-311.3"],discardedAlternatives:[alt("Responsable sin identificar o sin facultades","La organización interna debe declararse y la supervisión necesita facultades atribuidas.","LCSP-62.1"),alt("Recepción implícita o silencio como conformidad","Debe existir un acto formal y positivo de recepción o conformidad.","LCSP-210.2"),alt("Pago desligado de la prestación conformada","El abono exige bienes entregados o servicios prestados y documentos de conformidad aprobados.","LCSP-198.4","LCSP-301.1")],riskIfUnresolved:"Falta de dirección y control, recepción no acreditada, defectos sin subsanación o factura y pago sin soporte documental.",destinations:{memorySectionIds:["MANAGEMENT_EXECUTION_PAYMENT"],pptSectionIds:["TECHNICAL_MANAGEMENT","TERM_LOCATION_DELIVERY","COORDINATION_QUALITY","RECEPTION_CONFORMITY"],pcapAuthorizedTargets:["ANNEX_I.EXECUTION","ANNEX_I.RECEIPT","ANNEX_I.INVOICING","ANNEX_I.PAYMENT"]},consent},
  {id:"D18_TECHNICAL_SPECIFICATIONS",title:"Prescripciones técnicas",question:"¿Qué finalidad y requisitos técnicos mínimos son necesarios, cómo se comprobarán y qué reglas de accesibilidad, ambiente, equivalencia y subfamilia resultan aplicables?",factPaths:["technical.supplyVariant","technical.technicalPurpose","technical.technicalRequirements","technical.verificationMethods","technical.accessibilityRegime","technical.environmentalTechnicalRegime","technical.equivalenceRegime","technical.specialRequirements","technical.executionLocations","technical.hasServicePlatformComponent","technical.hasInstallationOrAssembly"],proposalRule:"Transformar el objeto y la necesidad validados en una propuesta revisable de requisitos mínimos; los precedentes solo permiten detectar cuestiones y nunca se copian como hechos o prescripciones.",applicationRule:"Exigir necesidad, proporcionalidad y método de comprobación por requisito; motivar toda referencia excepcional y admitir equivalencia; resolver expresamente accesibilidad, impacto ambiental y overlay técnico de subfamilia.",legalBasisIds:["LCSP-124","LCSP-125.1","LCSP-126.1","LCSP-126.2","LCSP-126.3","LCSP-126.4","LCSP-126.5","LCSP-126.6","LCSP-128.1","LCSP-300.1","LCSP-311.3"],discardedAlternatives:[alt("Prescripción tomada de otro expediente","No se incorpora sin acreditar necesidad, proporcionalidad y aplicación al objeto nuevo.","LCSP-126.1","LCSP-126.2"),alt("Marca o procedencia sin equivalencia","Puede restringir injustificadamente la competencia; la excepción exige justificación y «o equivalente».","LCSP-126.6"),alt("Requisito subjetivo sin método de prueba","No permite comprobar de manera igualitaria la conformidad de las ofertas o prestaciones.","LCSP-128.1")],riskIfUnresolved:"PPT insuficiente, discriminatorio, desproporcionado o imposible de verificar.",destinations:{memorySectionIds:["NEED_SUITABILITY","OBJECT_NATURE_CPV","DATA_SECURITY"],pptSectionIds:["TECHNICAL_OBJECT_SCOPE","TECHNICAL_MANAGEMENT","TERM_LOCATION_DELIVERY","MINIMUM_TECHNICAL_REQUIREMENTS","PERSONNEL_MATERIAL_MEANS","COORDINATION_QUALITY","RECEPTION_CONFORMITY","TECHNICAL_OBLIGATIONS","WARRANTY_SUPPORT","INFORMATION_SECURITY","ENVIRONMENT_WASTE","TECHNICAL_DOCUMENTATION_ANNEXES"],pcapAuthorizedTargets:["ANNEX_I.TECHNICAL_REFERENCES"]},consent},
  {id:"D19_DATA_SECURITY",title:"Protección de datos y seguridad",question:"¿No habrá acceso, existirá acceso incidental o se tratarán datos por cuenta de la Administración; qué servidores, transferencias, seguridad y ENS resultan aplicables?",factPaths:["dataProtection.processingScenario","dataProtection.personalDataRegime","dataProtection.processorAgreementRegime","dataProtection.serverLocationAndSubprocessingRegime","dataProtection.internationalTransferRegime","security.informationSecurityRegime","security.ensRegime","security.incidentContinuityRegime","administrative.pcapAnnexIResidualDecisions"],proposalRule:"Proponer uno de tres escenarios desde los hechos y valorar separadamente servidores, subencargados, transferencias y sistemas sujetos al ENS.",applicationRule:"Expresar aplicación o no aplicación motivada; exigir anexo del artículo 28 RGPD cuando haya encargo y requisitos ENS solo dentro de su ámbito.",legalBasisIds:["LCSP-122.2-DATA-GENERAL","LCSP-122.2-DATA-PROCESSOR","LCSP-122.2-DATA-SERVERS","LCSP-122.2-DATA-ESSENTIAL","LCSP-202.1-DATA"],discardedAlternatives:[alt("Cláusula genérica","No determina finalidad, datos, interesados, operaciones ni obligaciones.","LCSP-122.2-DATA-PROCESSOR"),alt("Aplicar ENS por similitud","Ámbito y categoría deben resultar del expediente nuevo.","LCSP-122.2-DATA-GENERAL"),alt("Omitir el apartado","Debe constar el régimen y la obligación general.","LCSP-122.2-DATA-GENERAL")],riskIfUnresolved:"Tratamiento sin instrucciones, encargo incompleto, servidores o subencargados desconocidos o seguridad desproporcionada.",destinations:{memorySectionIds:["DATA_SECURITY"],pptSectionIds:["INFORMATION_SECURITY"],pcapAuthorizedTargets:["ANNEX_I.DATA_PROTECTION"]},consent},
  {id:"D20_DOCUMENT_APPROVAL",title:"Conclusión y propuesta documental",question:"¿Confirma la persona responsable que los hechos, decisiones, fundamentos y tres documentos son coherentes y pueden elevarse para aprobación?",factPaths:["administrative.pcapAnnexIResidualDecisions"],proposalRule:"Generar una síntesis de decisiones y bloqueos; nunca convertir una prueba automática en aprobación.",applicationRule:"Exigir consentimiento final con huella de las decisiones y de la selección documental.",legalBasisIds:["LCSP-116.3","LCSP-122.1","LCSP-124"],discardedAlternatives:[alt("Aprobación automática","La máquina no sustituye al órgano ni a la persona responsable.","LCSP-116.3")],riskIfUnresolved:"Documentos divergentes o aprobación sin trazabilidad.",destinations:{memorySectionIds:["CONCLUSION_PROPOSAL"],pptSectionIds:["TECHNICAL_DOCUMENTATION_ANNEXES"],pcapAuthorizedTargets:["PACKAGE.FINAL_HUMAN_CONSENT"]},consent},
] as const;

const byLegalId = new Map(LB106_LEGAL_BASES.map(item => [item.id, item]));

export function lb106DecisionForField(fieldPath: string): Lb106DecisionMatrixEntry | undefined {
  return LB106_VIRGIN_PILOT_DECISION_MATRIX.find(item => item.factPaths.includes(fieldPath));
}

export function lb106DecisionCardForField(fieldPath: string) {
  const decision = lb106DecisionForField(fieldPath);
  if (!decision) return undefined;
  return lb106DecisionCard(decision);
}

export function lb106DecisionCard(decision: Lb106DecisionMatrixEntry) {
  return {
    ...decision,
    legalBases: decision.legalBasisIds.map(id => byLegalId.get(id)),
    discardedAlternatives: decision.discardedAlternatives.map(item => ({
      ...item,
      legalBases: item.legalBasisIds.map(id => byLegalId.get(id)),
    })),
  };
}

export function lb106DecisionCards() {
  return LB106_VIRGIN_PILOT_DECISION_MATRIX.map(lb106DecisionCard);
}

export function auditLb106DecisionMatrix(requiredFieldPaths: readonly string[] = []) {
  const blockers: string[] = [];
  const decisionIds = LB106_VIRGIN_PILOT_DECISION_MATRIX.map(item => item.id);
  const legalIds = LB106_LEGAL_BASES.map(item => item.id);
  if (new Set(decisionIds).size !== decisionIds.length) blockers.push("Existen decisiones LB106 duplicadas.");
  if (new Set(legalIds).size !== legalIds.length) blockers.push("Existen fundamentos jurídicos LB106 duplicados.");
  for (const legal of LB106_LEGAL_BASES) {
    if (!legal.article || !legal.paragraph || !legal.relevantOfficialExcerpt.trim()) blockers.push(`${legal.id}: referencia jurídica incompleta.`);
    if (!legal.officialUrl.startsWith("https://www.boe.es/")) blockers.push(`${legal.id}: la fuente no es el BOE oficial.`);
    if (legal.consolidatedAt !== LCSP_CONSOLIDATED_AT) blockers.push(`${legal.id}: versión consolidada incorrecta.`);
  }
  for (const decision of LB106_VIRGIN_PILOT_DECISION_MATRIX) {
    for (const id of decision.legalBasisIds) if (!byLegalId.has(id)) blockers.push(`${decision.id}: fundamento inexistente ${id}.`);
    if (!decision.consent.required || decision.consent.owner !== "RESPONSABLE_TECNICO_HUMANO") blockers.push(`${decision.id}: falta consentimiento humano.`);
    if (!decision.question.trim() || !decision.proposalRule.trim() || !decision.applicationRule.trim()) blockers.push(`${decision.id}: ficha de decisión incompleta.`);
    for (const alternative of decision.discardedAlternatives) {
      if (!alternative.legalBasisIds.length || !alternative.rejectionRule.trim()) blockers.push(`${decision.id}: alternativa descartada sin fundamento.`);
      for (const id of alternative.legalBasisIds) if (!byLegalId.has(id)) blockers.push(`${decision.id}: fundamento de alternativa inexistente ${id}.`);
    }
  }
  const memoryCovered = new Set(LB106_VIRGIN_PILOT_DECISION_MATRIX.flatMap(item => item.destinations.memorySectionIds));
  const pptCovered = new Set(LB106_VIRGIN_PILOT_DECISION_MATRIX.flatMap(item => item.destinations.pptSectionIds));
  for (const section of CANONICAL_MEMORY_CORE) if (!memoryCovered.has(section.id)) blockers.push(`Memoria ${section.number}. ${section.title}: sin decisión LB106.`);
  for (const section of CANONICAL_PPT_CORE) if (!pptCovered.has(section.id)) blockers.push(`PPT ${section.number}. ${section.title}: sin decisión LB106.`);
  for (const fieldPath of requiredFieldPaths) if (!lb106DecisionForField(fieldPath)) blockers.push(`${fieldPath}: campo exigible sin ficha LB106.`);
  return {
    ready: blockers.length === 0,
    version: LB106_DECISION_MATRIX_VERSION,
    consolidatedAt: LCSP_CONSOLIDATED_AT,
    decisionCount: LB106_VIRGIN_PILOT_DECISION_MATRIX.length,
    legalBasisCount: LB106_LEGAL_BASES.length,
    coveredMemorySections: memoryCovered.size,
    coveredPptSections: pptCovered.size,
    requiredFieldCount: requiredFieldPaths.length,
    blockers,
    humanConsentRequired: true as const,
    productionReady: false as const,
  };
}
