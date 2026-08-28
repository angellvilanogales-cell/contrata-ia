export const MIXED_VERTICAL_FIELD_MANIFEST=[
  {fieldPath:"mixed.components",label:"Prestaciones contractuales diferenciadas",control:"COMPONENT_LIST",section:"QUALIFICATION",requiredForWorkflowReview:true,humanValidationRequired:true},
  {fieldPath:"mixed.principalContractType",label:"Prestación principal / régimen principal validado",control:"SELECT",section:"QUALIFICATION",requiredForWorkflowReview:true,humanValidationRequired:true},
  {fieldPath:"mixed.objectivelySeparable",label:"Prestaciones objetivamente separables cuando exista componente concesional",control:"BOOLEAN",section:"QUALIFICATION",requiredForWorkflowReview:false,humanValidationRequired:true},
  {fieldPath:"mixed.singleContractChosen",label:"Si son separables, decisión de adjudicar un único contrato",control:"BOOLEAN",section:"QUALIFICATION",requiredForWorkflowReview:false,humanValidationRequired:true},
  {fieldPath:"mixed.nonConcessionThresholdExceeded",label:"Prestación no concesional supera el umbral del art. 18.1.b.2º",control:"BOOLEAN",section:"PROCEDURE",requiredForWorkflowReview:false,humanValidationRequired:true},
  {fieldPath:"mixed.effectsRegimeSeparatedByComponent",label:"PCAP diferencia efectos, cumplimiento y extinción por prestación",control:"BOOLEAN",section:"EXECUTION",requiredForWorkflowReview:true,humanValidationRequired:true},
  {fieldPath:"mixed.worksElementValueCents",label:"Valor del elemento de obra",control:"MONEY_CENTS",section:"ECONOMICS",requiredForWorkflowReview:false,humanValidationRequired:true},
  {fieldPath:"mixed.worksProjectAvailable",label:"Proyecto de obra disponible cuando art. 18.3 lo exige",control:"BOOLEAN",section:"PREPARATION",requiredForWorkflowReview:false,humanValidationRequired:true},
  {fieldPath:"mixed.concessionViabilityStudyAvailable",label:"Estudio de viabilidad del componente concesional",control:"BOOLEAN",section:"VIABILITY",requiredForWorkflowReview:false,humanValidationRequired:true},
  {fieldPath:"mixed.concessionAnteprojectResolved",label:"Anteproyecto concesional resuelto cuando proceda",control:"BOOLEAN",section:"VIABILITY",requiredForWorkflowReview:false,humanValidationRequired:true},
] as const;
