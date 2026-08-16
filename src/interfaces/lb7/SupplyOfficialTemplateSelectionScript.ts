export const SUPPLY_OFFICIAL_TEMPLATE_SELECTION_SCRIPT = `"use strict";
(function(){
var work=document.getElementById("work");if(!work)return;
var answersKey="contrataIaAdaptiveAnswers";
var OFFICIAL_MODELS={
  "SUPPLIES|OPEN_SIMPLIFIED_ABBREVIATED_CANDIDATE|SELF_FUNDED":{
    id:"JDA-PCAP-SUPPLY-OSA-SELF-2025-12",
    documentKind:"DPCAF/PCAP",
    contractType:"Suministro",
    procedure:"Procedimiento abierto simplificado abreviado",
    financing:"Autofinanciado",
    presentation:"Presentación electrónica de ofertas",
    authority:"Comisión Consultiva de Contratación Pública de la Junta de Andalucía",
    updateLabel:"Actualizado en diciembre de 2025",
    officialIndexUrl:"https://www.juntadeandalucia.es/temas/contratacion-publica/gestion/comision-consultiva/paginas/pliegos.html",
    officialOdtUrl:"https://www.juntadeandalucia.es/sites/default/files/inline-files/2026/02/2025_12_17_pcap_suministro_abierto_simplificado_abreviado_autofinanciada.odt"
  }
};
function readJson(storage,key){try{return JSON.parse(storage.getItem(key)||"{}");}catch(e){return {};}}
function readAnswers(){var a=readJson(sessionStorage,answersKey);if(Object.keys(a).length)return a;a=readJson(localStorage,answersKey);if(Object.keys(a).length)sessionStorage.setItem(answersKey,JSON.stringify(a));return a;}
function saveAnswers(a,kind){var raw=JSON.stringify(a);sessionStorage.setItem(answersKey,raw);localStorage.setItem(answersKey,raw);document.dispatchEvent(new CustomEvent("contrata-ia:adaptive-saved",{detail:{kind:kind||"supply-official-template"}}));}
function esc(v){return String(v==null?"":v).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;");}
function procedureKey(a){return a.procedure||a.procedureProposal||"OPEN_SIMPLIFIED_ABBREVIATED_CANDIDATE";}
function fundingKey(a){return a.supplyFundingSource||"SELF_FUNDED";}
function modelFor(a){return OFFICIAL_MODELS["SUPPLIES|"+procedureKey(a)+"|"+fundingKey(a)]||null;}
function ready(a){return a.supplyDocumentMappingValidated===true&&a.supplyEstimatedValueValidated===true&&a.supplyAwardCriteriaMode==="PRICE_ONLY"&&a.supplyPriceOnlyMotivationValidated===true;}
function card(a){var m=modelFor(a);var html='<div id="supplyOfficialTemplateCard" class="card" style="margin-top:14px"><h3>6. Selección y verificación del modelo oficial DPCAF / PCAP</h3>';
if(!ready(a)){html+='<div class="warning"><strong>Paso todavía no habilitado.</strong> Debe quedar validado el mapeo documental y cerrados el valor estimado y los criterios de adjudicación antes de seleccionar el modelo oficial.</div></div>';return html;}
if(!m){html+='<div class="warning"><strong>No existe una coincidencia exacta en el registro local de modelos oficiales.</strong> Contrata-IA no generará un pliego genérico. Debe identificarse en la fuente oficial de la Junta el modelo que corresponda al tipo de contrato, procedimiento y financiación.</div><p><a href="https://www.juntadeandalucia.es/temas/contratacion-publica/gestion/comision-consultiva/paginas/pliegos.html" target="_blank" rel="noopener noreferrer">Abrir repositorio oficial de modelos de la Junta de Andalucía</a></p></div>';return html;}
html+='<div class="info"><strong>Coincidencia oficial identificada.</strong> Contrata-IA ha seleccionado el modelo por naturaleza contractual, procedimiento y fuente de financiación; no se utilizará una plantilla genérica.</div><ul><li><strong>Tipo contractual:</strong> '+esc(m.contractType)+'</li><li><strong>Procedimiento:</strong> '+esc(m.procedure)+'</li><li><strong>Financiación:</strong> '+esc(m.financing)+'</li><li><strong>Presentación:</strong> '+esc(m.presentation)+'</li><li><strong>Órgano/modelo:</strong> '+esc(m.authority)+'</li><li><strong>Versión de referencia:</strong> '+esc(m.updateLabel)+'</li><li><strong>Identificador Contrata-IA:</strong> '+esc(m.id)+'</li></ul>';
html+='<div class="info"><strong>Modelo seleccionado:</strong> PCAP de suministro mediante procedimiento abierto simplificado abreviado, autofinanciado, con presentación electrónica de ofertas.</div>';
html+='<p><a href="'+esc(m.officialIndexUrl)+'" target="_blank" rel="noopener noreferrer">Consultar repositorio oficial de modelos</a> · <a href="'+esc(m.officialOdtUrl)+'" target="_blank" rel="noopener noreferrer">Abrir modelo ODT oficial seleccionado</a></p>';
if(a.supplyOfficialTemplateValidated===true&&a.supplyOfficialTemplateId===m.id){html+='<div class="info"><strong>Modelo oficial validado.</strong> El expediente queda vinculado a '+esc(m.id)+'. El siguiente paso será parametrizar su Anexo I y las cláusulas variables con los datos ya cerrados, conservando intacta la estructura del modelo recomendado.</div>';}else{html+='<div class="warning"><strong>Validación humana obligatoria.</strong> Confirme que el expediente es autofinanciado y que el modelo mostrado es el que debe utilizarse antes de generar cualquier borrador editable.</div><button id="validateSupplyOfficialTemplate" type="button">Validar modelo oficial seleccionado</button>';}
html+='</div>';return html;}
function ensure(){var a=readAnswers();var old=document.getElementById("supplyOfficialTemplateCard");if(old)old.remove();var map=document.getElementById("supplyDocumentMappingCard");if(!map)return;map.insertAdjacentHTML("afterend",card(a));}
work.addEventListener("click",function(event){var t=event.target;if(!t||t.id!=="validateSupplyOfficialTemplate")return;var a=readAnswers(),m=modelFor(a);if(!m||!ready(a)){alert("No puede validarse el modelo oficial mientras falten controles previos o no exista una coincidencia exacta.");return;}a.supplyFundingSource="SELF_FUNDED";a.supplyOfficialTemplateId=m.id;a.supplyOfficialTemplateDocumentKind=m.documentKind;a.supplyOfficialTemplateContractType="SUPPLIES";a.supplyOfficialTemplateProcedure=procedureKey(a);a.supplyOfficialTemplateFinancing="SELF_FUNDED";a.supplyOfficialTemplateOfficialUrl=m.officialOdtUrl;a.supplyOfficialTemplateIndexUrl=m.officialIndexUrl;a.supplyOfficialTemplateVersion="2025-12";a.supplyOfficialTemplateValidated=true;a.supplyOfficialTemplateStatus="OFFICIAL_MODEL_VALIDATED_READY_FOR_PARAMETERIZATION";saveAnswers(a,"supply-official-template-validated");ensure();},true);
document.addEventListener("contrata-ia:adaptive-saved",function(){setTimeout(ensure,0);});
setTimeout(ensure,0);setTimeout(ensure,150);
})();`;
