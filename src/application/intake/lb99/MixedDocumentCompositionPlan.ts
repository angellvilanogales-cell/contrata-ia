import type { MixedComponentContractType,MixedQualificationComponent,MixedQualificationResult } from "./MixedQualificationGate";
export type MixedConcessionSubtype="SERVICE_CONCESSION"|"WORKS_CONCESSION";
export interface MixedDocumentCompositionPlanInput{qualification:MixedQualificationResult;components:readonly MixedQualificationComponent[];concessionSubtype?:MixedConcessionSubtype|null;}
export interface MixedDocumentCompositionPlan{
  ready:boolean;
  genericMixedTemplateAllowed:false;
  administrativeBaseFamily:MixedComponentContractType|null;
  componentFamilies:readonly MixedComponentContractType[];
  technicalOverlayFamilies:readonly MixedComponentContractType[];
  concessionSubtype:MixedConcessionSubtype|null;
  requiresProjectOverlay:boolean;
  requiresConcessionViabilityOverlay:boolean;
  effectsRegimeByComponentRequired:true;
  blockers:readonly string[];
  humanValidationRequired:true;
}

/**
 * LB99 no selecciona una plantilla MIXED inexistente. La pieza administrativa parte
 * de la familia que gobierna la adjudicación y se le superponen, de forma trazable,
 * las obligaciones técnicas y de ejecución de cada prestación. La fusión física
 * solo podrá habilitarse cuando el compositor preserve todos esos overlays.
 */
export function buildMixedDocumentCompositionPlan(input:MixedDocumentCompositionPlanInput):MixedDocumentCompositionPlan{
  const blockers:string[]=[];
  if(!input.qualification.ready)blockers.push(...input.qualification.blockers);
  const administrativeBaseFamily=input.qualification.governingAwardRegime;
  if(!administrativeBaseFamily)blockers.push("No existe familia administrativa gobernante validada; no puede seleccionarse base documental.");
  const componentFamilies=[...new Set(input.components.map(c=>c.contractType))];
  const technicalOverlayFamilies=componentFamilies.filter(f=>f!==administrativeBaseFamily);
  const hasConcession=componentFamilies.includes("CONCESSION");
  const concessionSubtype=input.concessionSubtype??null;
  if(hasConcession&&!concessionSubtype)blockers.push("El componente concesional exige subtipo SERVICE_CONCESSION o WORKS_CONCESSION para seleccionar su perfil físico y sus gates.");
  if(concessionSubtype==="WORKS_CONCESSION"&&!hasConcession)blockers.push("Se ha declarado subtipo concesión de obras sin componente CONCESSION en la estructura mixta.");
  return{
    ready:blockers.length===0,
    genericMixedTemplateAllowed:false,
    administrativeBaseFamily,
    componentFamilies,
    technicalOverlayFamilies,
    concessionSubtype,
    requiresProjectOverlay:componentFamilies.includes("WORKS")||concessionSubtype==="WORKS_CONCESSION",
    requiresConcessionViabilityOverlay:hasConcession,
    effectsRegimeByComponentRequired:true,
    blockers:[...new Set(blockers)],
    humanValidationRequired:true,
  };
}
