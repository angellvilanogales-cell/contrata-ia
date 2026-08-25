export const SUPPLY_PENDING_FIELDS_NORMATIVE_PROPOSAL_SCRIPT = `"use strict";
(function(){
var ABNORMAL_PROPOSAL="Artículo 149.2 LCSP y artículo 85 RGLCAP. Al existir un único criterio de adjudicación (precio), se propone aplicar los parámetros reglamentarios: 1 licitador: oferta inferior al PBL en más de 25 puntos porcentuales; 2 licitadores: oferta inferior en más de 20 puntos porcentuales a la otra; 3 licitadores: oferta inferior en más de 10 puntos porcentuales a la media, con las reglas de depuración previstas en el artículo 85.3 RGLCAP y, en todo caso, baja superior a 25 puntos porcentuales; 4 o más licitadores: oferta inferior en más de 10 puntos porcentuales a la media, aplicando la depuración prevista en el artículo 85.4 RGLCAP.";
var TIE_NOTE="Propuesta normativa: no establecer un criterio específico adicional y aplicar, si persiste un empate tras la puntuación, los criterios supletorios del artículo 147.2 LCSP. El órgano de contratación puede optar por criterios específicos vinculados al objeto conforme al artículo 147.1 LCSP, pero requieren decisión y validación expresa.";
var PENALTY_NOTE="Propuesta normativa: no añadir penalidades particulares adicionales. Para la demora imputable al contratista se aplica el régimen general del artículo 193 LCSP. El artículo 192 LCSP permite establecer penalidades específicas por cumplimiento defectuoso o incumplimiento parcial cuando estén previstas en el pliego y sean proporcionales; solo deben añadirse si las características concretas del contrato lo justifican.";
function addInfo(beforeId,id,text){var target=document.getElementById(beforeId);if(!target||document.getElementById(id))return;var box=document.createElement("div");box.id=id;box.className="info";box.innerHTML='<strong>Propuesta normativa automática — pendiente de validación humana.</strong> '+text;target.parentNode.insertBefore(box,target);}
function apply(){
var card=document.getElementById("supplyOfficialTemplatePendingFieldsCard");if(!card)return;
var abnormal=document.getElementById("pendingAbnormallyLowParameters");
if(abnormal){if(!String(abnormal.value||"").trim())abnormal.value=ABNORMAL_PROPOSAL;addInfo("pendingAbnormallyLowParameters","pendingAbnormalNormativeProposal","Fundamento: artículo 149.2 LCSP y artículo 85 del RGLCAP. El PCAP de referencia del expediente utiliza expresamente estos parámetros para la oferta anormalmente baja.");}
var tie=document.getElementById("pendingTieBreakMode");
if(tie){if(!tie.value)tie.value="LEGAL_ART_147_2";addInfo("pendingTieBreakMode","pendingTieNormativeProposal",TIE_NOTE);}
var penalties=document.getElementById("pendingPenaltiesMode");
if(penalties){if(!penalties.value)penalties.value="NONE";addInfo("pendingPenaltiesMode","pendingPenaltyNormativeProposal",PENALTY_NOTE);}
}
document.addEventListener("contrata-ia:adaptive-saved",function(){setTimeout(apply,25);});
setTimeout(apply,50);setTimeout(apply,250);
})();`;
