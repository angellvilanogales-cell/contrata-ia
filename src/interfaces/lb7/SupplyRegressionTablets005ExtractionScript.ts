import { SUPPLY_REGRESSION_CASE_005_TABLETS_PLATFORM } from "../../regression/SupplyRegressionCase005TabletsPlatform";

const CASE_JSON = JSON.stringify(SUPPLY_REGRESSION_CASE_005_TABLETS_PLATFORM);

export const SUPPLY_REGRESSION_TABLETS_005_EXTRACTION_SCRIPT = `"use strict";
(function(){
var work=document.getElementById("work");if(!work)return;
var key="contrataIaAdaptiveAnswers";
var VERSION="REG-SUPPLY-005-TABLETS-EXTRACTION-11.7.8-v1";
var CASE=${CASE_JSON};
function readJson(s,k){try{return JSON.parse(s.getItem(k)||"{}");}catch(e){return {};}}
function readAnswers(){var a=readJson(sessionStorage,key);if(Object.keys(a).length)return a;return readJson(localStorage,key);}
function save(a){var raw=JSON.stringify(a);sessionStorage.setItem(key,raw);localStorage.setItem(key,raw);document.dispatchEvent(new CustomEvent("contrata-ia:adaptive-saved",{detail:{kind:"tablets-extraction-11.7.8"}}));}
function esc(v){return String(v==null?"":v).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;");}
function yes(v){return v?"Sí":"No";}
function manifest(validated){return {version:VERSION,id:CASE.id,expediente:CASE.expediente,status:validated?"SOURCE_EXTRACTION_HUMAN_VALIDATED":"SOURCE_EXTRACTED_PENDING_HUMAN_VALIDATION",facts:CASE.facts,contrastWithGolden:CASE.contrastWithGolden,regressionGuards:CASE.regressionGuards,extractionScope:CASE.extractionScope,sourceDocuments:CASE.sourceDocuments,humanValidationRequired:true,humanValidated:validated===true,validatedAt:validated?new Date().toISOString():null};}
function downloadJson(data){var blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="Contrata-IA_REG-SUPPLY-005_Tablets_11-7-8.json";document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(url);},1500);}
function row(label,value,contrast){return '<tr><td>'+esc(label)+'</td><td>'+esc(value)+'</td><td>'+esc(contrast)+'</td></tr>';}
function card(){var a=readAnswers();if(a.supplyRegressionSas004AutomaticGuardRegistered!==true)return "";var f=CASE.facts,validated=a.supplyRegressionTablets005ExtractionValidated===true;var html='<div id="supplyRegressionTablets005ExtractionCard" class="card" style="margin-top:14px"><h3>11.7.8 REG-SUPPLY-005 · Tablets + plataforma de gestión</h3><div class="info"><strong>Extracción estructurada de cobertura.</strong> El caso prueba un suministro complejo que incorpora una plataforma de gestión. Solo se congelan los hechos ya identificados en las fuentes y la matriz; no se recalifica el contrato ni se infiere el peso jurídico/económico de la plataforma.</div><table style="width:100%;border-collapse:collapse"><thead><tr><th>Dato</th><th>Tablets + plataforma</th><th>Contraste golden</th></tr></thead><tbody>';
html+=row("Tipo","Suministro","IGUAL");
html+=row("Componente de plataforma",yes(f.complexSupplyWithPlatformComponent),"DIFERENTE · el objeto incorpora una plataforma de gestión además del suministro");
html+=row("Procedimiento","Abierto","DIFERENTE · golden: simplificado abreviado");
html+=row("Lotes",f.lots?"Sí":"No","IGUAL · lote único");
html+=row("DA 33.ª",yes(f.needsBasedDA33),"IGUAL · contrato en función de necesidades");
html+=row("Precio","Precios unitarios","IGUAL en modalidad");
html+=row("Adjudicación","Criterios múltiples","DIFERENTE · golden: precio único 100 puntos");
html+=row("Evaluación mediante fórmulas",yes(f.formulaEvaluatedCriteria),"DIFERENTE · pluralidad de criterios automáticos/formulables");
html+=row("Prórroga",yes(f.extensions),"Existe, pero el detalle temporal queda fuera de 11.7.8");
html+=row("Modificación prevista",yes(f.plannedModification),"Existe, pero porcentaje y causa concreta quedan fuera de 11.7.8");
html+='</tbody></table><div class="warning"><strong>Guardas para la siguiente regresión:</strong> el motor deberá conservar el contrato como suministro, el componente de plataforma, el procedimiento abierto, lote único, DA 33.ª, precios unitarios y criterios múltiples evaluables mediante fórmulas. No podrá heredar el precio único ni el procedimiento abreviado del golden.</div><div class="warning"><strong>Alcance controlado.</strong> No se congela todavía la calificación detallada de la plataforma, su peso económico, importes, CPV, duración exacta, prórrogas, modificación, fórmulas/ponderaciones, garantías, condiciones especiales, protección de datos, seguridad o niveles de servicio.</div>';
if(!validated){html+='<p><strong>Estado:</strong> extracción de cobertura pendiente de validación humana.</p><button id="validateTablets005Extraction" type="button">Validar extracción documental 11.7.8</button>';}else{html+='<div class="info"><strong>11.7.8 validado por la persona usuaria.</strong> El caso queda preparado para su regresión automática específica, sin convertirse en golden case.</div><button id="downloadTablets005Extraction" type="button" class="secondary">Descargar extracción 11.7.8 JSON</button>';}
html+='</div>';return html;}
function ensure(){var old=document.getElementById("supplyRegressionTablets005ExtractionCard");if(old)old.remove();var anchor=document.getElementById("supplyRegressionSas004GuardCard");if(anchor){var html=card();if(html)anchor.insertAdjacentHTML("afterend",html);}}
document.addEventListener("click",function(e){if(!e.target)return;if(e.target.id==="validateTablets005Extraction"){var a=readAnswers();if(a.supplyRegressionSas004AutomaticGuardRegistered!==true){alert("Primero debe estar registrada la regresión SAS 470 11.7.7.");return;}var m=manifest(true);a.supplyRegressionTablets005ExtractionValidated=true;a.supplyRegressionTablets005ExtractionVersion=VERSION;a.supplyRegressionTablets005ExtractionManifest=m;a.supplyRegressionTablets005Status="SOURCE_EXTRACTION_HUMAN_VALIDATED";a.supplyRegressionNextRecommendedCase="REG-SUPPLY-005";save(a);downloadJson(m);ensure();alert("Extracción 11.7.8 validada. Tablets + plataforma queda listo para construir su regresión automática específica.");return;}if(e.target.id==="downloadTablets005Extraction"){var a2=readAnswers();downloadJson(a2.supplyRegressionTablets005ExtractionManifest||manifest(true));return;}},true);
document.addEventListener("contrata-ia:adaptive-saved",function(){setTimeout(ensure,0);});setTimeout(ensure,0);setTimeout(ensure,500);
})();`;
