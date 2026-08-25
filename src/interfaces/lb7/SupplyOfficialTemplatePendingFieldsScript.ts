export const SUPPLY_OFFICIAL_TEMPLATE_PENDING_FIELDS_SCRIPT = `"use strict";
(function(){
var work=document.getElementById("work");
if(!work)return;
var answersKey="contrataIaAdaptiveAnswers";
var LF=String.fromCharCode(10);
var SOURCE_INITIAL_PBL_EX_VAT=10552.44;
var SOURCE_VAT_RATE=21;
var SOURCE_INITIAL_PBL_INC_VAT=12768.45;
var SOURCE_BUDGET_APPLICATION="1439010000 G/32L/22000/00 01";
var SOURCE_ANNUALITIES=[{year:2026,amount:1596.06},{year:2027,amount:6384.23},{year:2028,amount:4788.16}];
function readJson(storage,key){try{return JSON.parse(storage.getItem(key)||"{}");}catch(e){return {};}}
function readAnswers(){var a=readJson(sessionStorage,answersKey);if(Object.keys(a).length)return a;a=readJson(localStorage,answersKey);if(Object.keys(a).length)sessionStorage.setItem(answersKey,JSON.stringify(a));return a;}
function saveAnswers(a,kind){var raw=JSON.stringify(a);sessionStorage.setItem(answersKey,raw);localStorage.setItem(answersKey,raw);document.dispatchEvent(new CustomEvent("contrata-ia:adaptive-saved",{detail:{kind:kind||"supply-official-template-pending-fields"}}));}
function esc(v){return String(v==null?"":v).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;");}
function parseNumber(v){var s=String(v==null?"":v).trim().replaceAll(" ","");if(!s)return NaN;var comma=s.lastIndexOf(",");var dot=s.lastIndexOf(".");if(comma>=0&&dot>=0){if(comma>dot)s=s.replaceAll(".","").replace(",",".");else s=s.replaceAll(",","");}else if(comma>=0){s=s.replace(",",".");}var n=Number(s);return Number.isFinite(n)?n:NaN;}
function money(v){return Number(v||0).toLocaleString("es-ES",{minimumFractionDigits:2,maximumFractionDigits:2})+" €";}
function ready(a){return a.supplyOfficialTemplateParameterizationValidated===true&&a.supplyOfficialTemplateParameterizationModel==="JDA-PCAP-SUPPLY-OSA-SELF-2025-12";}
function completed(a){return a.supplyCurrentTenderBudgetValidated===true&&a.supplyCurrentBudgetAllocationValidated===true&&a.supplyAbnormallyLowParametersValidated===true&&a.supplyTieBreakValidated===true&&a.supplySpecificPenaltiesDecisionValidated===true;}
function annualitiesToText(a){if(!Array.isArray(a.supplyCurrentBudgetAnnualities))return "";return a.supplyCurrentBudgetAnnualities.map(function(x){return String(x.year)+" = "+Number(x.amount).toLocaleString("es-ES",{minimumFractionDigits:2,maximumFractionDigits:2});}).join(LF);}
function parseAnnualities(text){var raw=String(text||"").split(LF);var out=[];for(var i=0;i<raw.length;i++){var line=raw[i].trim();if(!line)continue;var pos=line.indexOf("=");if(pos<0)pos=line.indexOf(":");if(pos<0)return null;var year=Number(line.slice(0,pos).trim());var amount=parseNumber(line.slice(pos+1));if(!Number.isInteger(year)||year<2000||year>2100||!Number.isFinite(amount)||amount<0)return null;out.push({year:year,amount:Math.round(amount*100)/100});}return out.length?out:null;}
function annualitiesTotal(list){var total=0;for(var i=0;i<list.length;i++)total+=Number(list[i].amount||0);return Math.round(total*100)/100;}
function sourceAnnualities(){return SOURCE_ANNUALITIES.map(function(x){return {year:x.year,amount:x.amount};});}
function migrateIncorrectEquality(a){var budget=Number(a.supplyMaximumApprovedBudgetExVat||0);var current=Number(a.supplyCurrentTenderBudgetExVat||0);var oldRelation=a.supplyCurrentTenderBudgetRelationship==="DA33_PBL_EQUALS_MAXIMUM_APPROVED_BUDGET";var copiedBudget=budget>0&&current>0&&Math.abs(current-budget)<=0.01;if(!oldRelation&&!copiedBudget)return false;a.supplyCurrentTenderBudgetExVat=SOURCE_INITIAL_PBL_EX_VAT;a.supplyCurrentTenderVatRate=SOURCE_VAT_RATE;a.supplyCurrentTenderBudgetInclVat=SOURCE_INITIAL_PBL_INC_VAT;a.supplyCurrentTenderBudgetRelationship="INITIAL_PBL_DISTINCT_FROM_DA33_MAXIMUM_BUDGET";a.supplyCurrentTenderBudgetSource="PCAP_FERRETERIA_V5_ANEXO_I_APARTADO_2";a.supplyCurrentBudgetApplication=SOURCE_BUDGET_APPLICATION;a.supplyCurrentBudgetAnnualities=sourceAnnualities();a.supplyCurrentBudgetAllocationValidated=true;a.supplyCurrentTenderBudgetValidated=true;a.supplyOfficialAnnexDraftGenerated=false;delete a.supplyOfficialAnnexDraftGeneratedAt;delete a.supplyOfficialAnnexDraftScope;return true;}
function card(a){
var budget=Number(a.supplyMaximumApprovedBudgetExVat||0);
var ve=Number(a.supplyEstimatedValueExVat||0);
var pbl=Number(a.supplyCurrentTenderBudgetExVat||SOURCE_INITIAL_PBL_EX_VAT);
var vat=Number(a.supplyCurrentTenderVatRate||SOURCE_VAT_RATE);
var total=Number(a.supplyCurrentTenderBudgetInclVat||SOURCE_INITIAL_PBL_INC_VAT);
var html='<div id="supplyOfficialTemplatePendingFieldsCard" class="card" style="margin-top:14px"><h3>8. Cierre de campos pendientes del Anexo I</h3>';
html+='<div class="info"><strong>Magnitudes económicas separadas.</strong> PBL de la duración inicial: '+money(pbl)+' sin IVA · '+money(total)+' IVA incluido. Presupuesto máximo DA 33.ª para toda la vigencia: '+money(budget)+' sin IVA. Valor estimado: '+money(ve)+' sin IVA.</div>';
html+='<div class="info"><strong>Comprobación de anualidades.</strong> Las anualidades 2026–2028 suman '+money(annualitiesTotal(Array.isArray(a.supplyCurrentBudgetAnnualities)?a.supplyCurrentBudgetAnnualities:SOURCE_ANNUALITIES))+' IVA incluido y se corresponden con el PBL inicial, no con el presupuesto máximo de toda la vigencia.</div>';
if(completed(a)){
html+='<div class="info"><strong>Paso 8 completado.</strong> Los campos pendientes del Anexo I han quedado validados con las magnitudes económicas diferenciadas.</div>';
html+='<ul><li><strong>PBL inicial:</strong> '+money(pbl)+' sin IVA · '+money(total)+' IVA incluido.</li><li><strong>Presupuesto máximo DA 33.ª:</strong> '+money(budget)+' sin IVA para toda la vigencia.</li><li><strong>Aplicación presupuestaria:</strong> '+esc(a.supplyCurrentBudgetApplication||"")+'.</li><li><strong>Oferta anormalmente baja:</strong> parámetros objetivos validados.</li><li><strong>Desempate:</strong> '+esc(a.supplyTieBreakMode==="LEGAL_ART_147_2"?"aplicación supletoria del artículo 147.2 LCSP":"criterios específicos validados")+'.</li><li><strong>Penalidades específicas:</strong> '+esc(a.supplySpecificPenaltiesMode==="NONE"?"no se añaden penalidades particulares adicionales":"penalidades particulares validadas")+'.</li></ul></div>';
return html;
}
html+='<div class="warning"><strong>Complete únicamente los cuatro bloques pendientes.</strong> Los importes económicos recuperados del PCAP fuente se muestran como propuesta documentada y requieren validación humana.</div>';
html+='<h4>8.1 PBL vigente de la duración inicial</h4><p class="muted">El PBL inicial no se confunde con el presupuesto máximo DA 33.ª para toda la vida del contrato.</p><label><strong>PBL sin IVA (€)</strong></label><input id="pendingPblExVat" inputmode="decimal" value="'+esc(pbl)+'"><label><strong>IVA (%)</strong></label><input id="pendingPblVatRate" inputmode="decimal" value="'+esc(vat)+'"><div class="info"><strong>Fuente PCAP V5:</strong> '+money(SOURCE_INITIAL_PBL_EX_VAT)+' sin IVA · IVA 21 % · '+money(SOURCE_INITIAL_PBL_INC_VAT)+' IVA incluido.</div>';
html+='<h4>8.2 Aplicación presupuestaria y anualidades</h4><label><strong>Aplicación presupuestaria</strong></label><input id="pendingBudgetApplication" value="'+esc(a.supplyCurrentBudgetApplication||SOURCE_BUDGET_APPLICATION)+'"><label><strong>Anualidades (IVA incluido)</strong></label><textarea id="pendingBudgetAnnualities" placeholder="Ej.: 2026 = 1.000,00">'+esc(annualitiesToText(a)||"2026 = 1.596,06"+LF+"2027 = 6.384,23"+LF+"2028 = 4.788,16")+'</textarea><p class="muted">La suma debe coincidir con el PBL IVA incluido de la duración inicial.</p>';
html+='<h4>8.3 Oferta anormalmente baja y desempate</h4><label><strong>Parámetros objetivos de anormalidad</strong></label><textarea id="pendingAbnormallyLowParameters" placeholder="Regla objetiva que se trasladará al Anexo I">'+esc(a.supplyAbnormallyLowParametersText||"")+'</textarea><label><strong>Desempate</strong></label><select id="pendingTieBreakMode"><option value="">Seleccione</option><option value="LEGAL_ART_147_2"'+(a.supplyTieBreakMode==="LEGAL_ART_147_2"?" selected":"")+'>Aplicar supletoriamente el artículo 147.2 LCSP</option><option value="SPECIFIC"'+(a.supplyTieBreakMode==="SPECIFIC"?" selected":"")+'>Establecer criterios específicos vinculados al objeto</option></select><textarea id="pendingTieBreakSpecificText" placeholder="Solo si establece criterios específicos">'+esc(a.supplyTieBreakSpecificText||"")+'</textarea>';
html+='<h4>8.4 Penalidades específicas</h4><select id="pendingPenaltiesMode"><option value="">Seleccione</option><option value="NONE"'+(a.supplySpecificPenaltiesMode==="NONE"?" selected":"")+'>No añadir penalidades específicas adicionales</option><option value="SPECIFIC"'+(a.supplySpecificPenaltiesMode==="SPECIFIC"?" selected":"")+'>Añadir penalidades específicas</option></select><textarea id="pendingPenaltiesText" placeholder="Solo si se añaden penalidades específicas">'+esc(a.supplySpecificPenaltiesText||"")+'</textarea>';
html+='<button id="validateSupplyPendingAnnexFields" type="button">Guardar y validar campos pendientes</button></div>';
return html;
}
function ensure(){var old=document.getElementById("supplyOfficialTemplatePendingFieldsCard");if(old)old.remove();var a=readAnswers();if(migrateIncorrectEquality(a)){saveAnswers(a,"supply-economic-magnitudes-source-correction");return;}var anchor=document.getElementById("supplyOfficialTemplateParameterizationCard");if(!anchor||!ready(a))return;anchor.insertAdjacentHTML("afterend",card(a));}
function byId(id){return document.getElementById(id);}
work.addEventListener("click",function(event){
var t=event.target;if(!t||t.id!=="validateSupplyPendingAnnexFields")return;
var a=readAnswers();if(!ready(a)){alert("Debe validarse primero el mapa estructural del Anexo I.");return;}
var pblEl=byId("pendingPblExVat");var vatEl=byId("pendingPblVatRate");var appEl=byId("pendingBudgetApplication");var annEl=byId("pendingBudgetAnnualities");var abnormalEl=byId("pendingAbnormallyLowParameters");var tieEl=byId("pendingTieBreakMode");var tieTextEl=byId("pendingTieBreakSpecificText");var penaltiesEl=byId("pendingPenaltiesMode");var penaltiesTextEl=byId("pendingPenaltiesText");
if(!pblEl||!vatEl||!appEl||!annEl||!abnormalEl||!tieEl||!tieTextEl||!penaltiesEl||!penaltiesTextEl){alert("No se han podido recuperar todos los campos del Paso 8.");return;}
var pbl=parseNumber(pblEl.value);var vatRate=parseNumber(vatEl.value);var app=appEl.value.trim();var annualities=parseAnnualities(annEl.value);var abnormal=abnormalEl.value.trim();var tie=tieEl.value;var tieText=tieTextEl.value.trim();var penalties=penaltiesEl.value;var penaltiesText=penaltiesTextEl.value.trim();
if(!Number.isFinite(pbl)||pbl<=0){alert("Debe existir un PBL sin IVA superior a cero.");return;}
if(!Number.isFinite(vatRate)||vatRate<0||vatRate>100){alert("Debe indicar un IVA válido entre 0 y 100.");return;}
if(!app||!annualities){alert("Debe indicar aplicación presupuestaria y anualidades válidas con formato AAAA = importe.");return;}
var incl=Math.round(pbl*(1+vatRate/100)*100)/100;var annualTotal=annualitiesTotal(annualities);if(Math.abs(incl-annualTotal)>0.02){alert("Las anualidades, expresadas con IVA incluido, deben sumar el PBL IVA incluido de la duración inicial. Suma actual: "+money(annualTotal)+"; PBL IVA incluido: "+money(incl)+".");return;}
if(!abnormal){alert("Debe definir los parámetros objetivos de oferta anormalmente baja.");return;}
if(!tie){alert("Debe decidir el régimen de desempate.");return;}
if(tie==="SPECIFIC"&&!tieText){alert("Debe redactar los criterios específicos de desempate.");return;}
if(!penalties){alert("Debe decidir si existen penalidades específicas adicionales.");return;}
if(penalties==="SPECIFIC"&&!penaltiesText){alert("Debe redactar las penalidades específicas.");return;}
a.supplyCurrentTenderBudgetExVat=Math.round(pbl*100)/100;a.supplyCurrentTenderVatRate=vatRate;a.supplyCurrentTenderBudgetInclVat=incl;a.supplyCurrentTenderBudgetValidated=true;a.supplyCurrentTenderBudgetRelationship="INITIAL_PBL_DISTINCT_FROM_DA33_MAXIMUM_BUDGET";a.supplyCurrentTenderBudgetSource="PCAP_FERRETERIA_V5_ANEXO_I_APARTADO_2";a.supplyCurrentBudgetApplication=app;a.supplyCurrentBudgetAnnualities=annualities;a.supplyCurrentBudgetAllocationValidated=true;a.supplyAbnormallyLowParametersText=abnormal;a.supplyAbnormallyLowParametersValidated=true;a.supplyTieBreakMode=tie;a.supplyTieBreakSpecificText=tie==="SPECIFIC"?tieText:"";a.supplyTieBreakValidated=true;a.supplySpecificPenaltiesMode=penalties;a.supplySpecificPenaltiesText=penalties==="SPECIFIC"?penaltiesText:"";a.supplySpecificPenaltiesDecisionValidated=true;a.supplyOfficialTemplatePendingFieldsValidated=true;a.supplyOfficialTemplatePendingFieldsStatus="ANNEX_I_REQUIRED_FIELDS_CLOSED_READY_FOR_EDITABLE_DRAFT";a.supplyOfficialAnnexDraftGenerated=false;saveAnswers(a,"supply-annex-pending-fields-validated");ensure();
},true);
document.addEventListener("contrata-ia:adaptive-saved",function(){setTimeout(ensure,0);});
setTimeout(ensure,0);
})();`;
