export const SUPPLY_OFFICIAL_PCAP_INSERTION_CONTROL_SCRIPT = `"use strict";
(function(){
var work=document.getElementById("work");if(!work)return;
var answersKey="contrataIaAdaptiveAnswers";
var OFFICIAL_MODEL_URL="https://www.juntadeandalucia.es/sites/default/files/inline-files/2026/02/2025_12_17_pcap_suministro_abierto_simplificado_abreviado_autofinanciada.odt";
function readJson(storage,key){try{return JSON.parse(storage.getItem(key)||"{}");}catch(e){return {};}}
function readAnswers(){var a=readJson(sessionStorage,answersKey);if(Object.keys(a).length)return a;a=readJson(localStorage,answersKey);if(Object.keys(a).length)sessionStorage.setItem(answersKey,JSON.stringify(a));return a;}
function saveAnswers(a,kind){var raw=JSON.stringify(a);sessionStorage.setItem(answersKey,raw);localStorage.setItem(answersKey,raw);document.dispatchEvent(new CustomEvent("contrata-ia:adaptive-saved",{detail:{kind:kind||"supply-official-pcap-insertion-control"}}));}
function esc(v){return String(v==null?"":v).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;");}
function money(v){return Number(v||0).toLocaleString("es-ES",{minimumFractionDigits:2,maximumFractionDigits:2})+" €";}
function ready(a){return a.supplyOfficialAnnexDraftGenerated===true&&a.supplyOfficialAnnexDraftScope==="ANNEX_I_PARAMETERIZED_DRAFT_CORRECTED_NOT_FULL_OFFICIAL_PCAP"&&a.supplyCurrentTenderBudgetRelationship==="INITIAL_PBL_DISTINCT_FROM_DA33_MAXIMUM_BUDGET";}
function card(a){var html='<div id="supplyOfficialPcapInsertionControlCard" class="card" style="margin-top:14px"><h3>10. Contraste e inserción fiel en el DPCAF / PCAP oficial</h3>';if(!ready(a)){html+='<div class="warning"><strong>Paso todavía no habilitado.</strong> Genere primero el borrador corregido del Paso 9, ya con PBL inicial y presupuesto máximo DA 33.ª diferenciados.</div></div>';return html;}
html+='<div class="info"><strong>Modelo oficial fuente.</strong> PCAP Suministro · procedimiento abierto simplificado abreviado · autofinanciado · presentación electrónica de ofertas · actualización diciembre de 2025.</div>';
html+='<p><a href="'+OFFICIAL_MODEL_URL+'" target="_blank" rel="noopener">Abrir ODT oficial de la Junta de Andalucía</a></p>';
html+='<table style="width:100%;border-collapse:collapse"><thead><tr><th>Destino oficial</th><th>Contenido validado a insertar</th><th>Control</th></tr></thead><tbody>';
html+='<tr><td>Cabecera Anexo I</td><td>Expediente, título, Sevilla, ES618 y CPV 44316400-2</td><td>✓ Fuente administrativa</td></tr>';
html+='<tr><td>Anexo I · apartado 1</td><td>Objeto, lote único, contrato DA 33.ª y presupuesto máximo '+money(a.supplyMaximumApprovedBudgetExVat)+' sin IVA para toda la vigencia</td><td>✓ Separado del PBL</td></tr>';
html+='<tr><td>Anexo I · apartado 2.A</td><td>PBL duración inicial '+money(a.supplyCurrentTenderBudgetExVat)+' sin IVA · '+money(a.supplyCurrentTenderBudgetInclVat)+' IVA incluido; desglose y anualidades</td><td>✓ Anualidades = PBL con IVA</td></tr>';
html+='<tr><td>Anexo I · apartado 2.B</td><td>Valor estimado '+money(a.supplyEstimatedValueExVat)+' sin IVA y método de cálculo validado</td><td>✓ Magnitud independiente</td></tr>';
html+='<tr><td>Anexo I · apartado 2.C</td><td>Precios unitarios por referencia del catálogo validado</td><td>✓ Sin precios nuevos</td></tr>';
html+='<tr><td>Anexo I · apartado 3</td><td>24 meses + dos posibles prórrogas de 12 meses; sin incremento automático del presupuesto máximo</td><td>✓ DA 33.ª</td></tr>';
html+='<tr><td>Anexo I · apartado 7</td><td>Precio 100 puntos; anormalidad y desempate validados</td><td>✓ Motivación específica</td></tr>';
html+='<tr><td>Anexo I · apartado 8</td><td>Condición especial de ejecución sobre embalajes y residuos</td><td>✓ Art. 202.1 LCSP</td></tr>';
html+='<tr><td>Anexo I · apartado 10</td><td>Régimen de penalidades validado</td><td>✓ Decisión expresa</td></tr>';
html+='<tr><td>Anexo I · apartado 14</td><td>Modificación por mayores necesidades, máximo 20 %, mismo objeto y precios unitarios; sin nuevos artículos/precios</td><td>✓ DA 33.ª + art. 204</td></tr>';
html+='</tbody></table>';
html+='<div class="warning"><strong>Regla de integridad documental.</strong> Contrata-IA no sustituirá ni reordenará las cláusulas generales del modelo recomendado. El siguiente generador deberá trabajar sobre una copia del ODT oficial y modificar exclusivamente los destinos variables del Anexo I.</div>';
if(a.supplyOfficialFullPcapInsertionMapValidated===true){html+='<div class="info"><strong>Mapa de inserción oficial validado.</strong> El expediente queda preparado para construir una copia parametrizada del ODT oficial, manteniendo intacta su estructura general.</div>';}else{html+='<button id="validateSupplyOfficialPcapInsertionMap" type="button">Validar mapa de inserción al PCAP oficial</button>';}
html+='</div>';return html;}
function ensure(){var old=document.getElementById("supplyOfficialPcapInsertionControlCard");if(old)old.remove();var a=readAnswers();var anchor=document.getElementById("supplyOfficialAnnexDraftCard");if(!anchor)return;anchor.insertAdjacentHTML("afterend",card(a));}
work.addEventListener("click",function(event){var t=event.target;if(!t||t.id!=="validateSupplyOfficialPcapInsertionMap")return;var a=readAnswers();if(!ready(a)){alert("Debe generarse primero el borrador corregido del Paso 9.");return;}a.supplyOfficialFullPcapInsertionMapValidated=true;a.supplyOfficialFullPcapInsertionMapVersion="JDA-SUPPLY-OSA-SELF-2025-12-ANNEX-I";a.supplyOfficialFullPcapSourceUrl=OFFICIAL_MODEL_URL;a.supplyOfficialFullPcapInsertionPolicy="COPY_OFFICIAL_ODT_AND_REPLACE_ONLY_ANNEX_I_VARIABLE_DESTINATIONS";a.supplyOfficialFullPcapInsertionMapValidatedAt=new Date().toISOString();saveAnswers(a,"supply-official-pcap-insertion-map-validated");ensure();},true);
document.addEventListener("contrata-ia:adaptive-saved",function(){setTimeout(ensure,25);});setTimeout(ensure,100);setTimeout(ensure,500);setTimeout(ensure,1500);
})();`;
