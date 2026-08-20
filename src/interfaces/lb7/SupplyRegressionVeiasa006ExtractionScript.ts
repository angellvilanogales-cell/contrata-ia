import { SUPPLY_REGRESSION_CASE_006_VEIASA_WINDOWS } from "../../regression/SupplyRegressionCase006VeiasaWindows";

const CASE_JSON = JSON.stringify(SUPPLY_REGRESSION_CASE_006_VEIASA_WINDOWS);

export const SUPPLY_REGRESSION_VEIASA_006_EXTRACTION_SCRIPT = `"use strict";
(function(){
var work=document.getElementById("work");if(!work)return;
var key="contrataIaAdaptiveAnswers";
var VERSION="REG-SUPPLY-006-VEIASA-EXTRACTION-11.7.10-v1";
var CASE=${CASE_JSON};
function readJson(s,k){try{return JSON.parse(s.getItem(k)||"{}");}catch(e){return {};}}
function readAnswers(){var a=readJson(sessionStorage,key);if(Object.keys(a).length)return a;return readJson(localStorage,key);}
function save(a){var raw=JSON.stringify(a);sessionStorage.setItem(key,raw);localStorage.setItem(key,raw);document.dispatchEvent(new CustomEvent("contrata-ia:adaptive-saved",{detail:{kind:"veiasa-extraction-11.7.10"}}));}
function esc(v){return String(v==null?"":v).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;");}
function yes(v){return v?"Sí":"No";}
function manifest(validated){return {version:VERSION,id:CASE.id,expediente:CASE.expediente,status:validated?"SOURCE_EXTRACTION_HUMAN_VALIDATED":"SOURCE_EXTRACTED_PENDING_HUMAN_VALIDATION",facts:CASE.facts,contrastWithGolden:CASE.contrastWithGolden,regressionGuards:CASE.regressionGuards,extractionScope:CASE.extractionScope,sourceDocuments:CASE.sourceDocuments,humanValidationRequired:true,humanValidated:validated===true,validatedAt:validated?new Date().toISOString():null};}
function downloadJson(data){var blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="Contrata-IA_REG-SUPPLY-006_VEIASA_11-7-10.json";document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(url);},1500);}
function row(label,value,contrast){return '<tr><td>'+esc(label)+'</td><td>'+esc(value)+'</td><td>'+esc(contrast)+'</td></tr>';}
function card(){var a=readAnswers();if(a.supplyRegressionTablets005AutomaticGuardRegistered!==true)return "";var f=CASE.facts,validated=a.supplyRegressionVeiasa006ExtractionValidated===true;var html='<div id="supplyRegressionVeiasa006ExtractionCard" class="card" style="margin-top:14px"><h3>11.7.10 REG-SUPPLY-006 · VEIASA Windows Server</h3><div class="info"><strong>Segundo control independiente de suministro ordinario.</strong> Se congela únicamente el alcance ya clasificado en la matriz: suministro sin DA 33.ª, lote único, procedimiento abierto simplificado, precio global, criterio económico único, sin prórroga y sin modificación prevista.</div><table style="width:100%;border-collapse:collapse"><thead><tr><th>Dato</th><th>VEIASA</th><th>Contraste golden</th></tr></thead><tbody>';
html+=row("Tipo","Suministro","IGUAL");
html+=row("Procedimiento","Abierto simplificado ordinario","DIFERENTE · golden: simplificado abreviado");
html+=row("Lotes",f.lots?"Sí":"No","IGUAL · lote único");
html+=row("DA 33.ª",yes(f.needsBasedDA33),"DIFERENTE · debe permanecer desactivada");
html+=row("Sistema de precio","Precio global","DIFERENTE · golden: precios unitarios");
html+=row("Adjudicación","Criterio económico único","IGUAL en carácter económico único");
html+=row("Prórroga",yes(f.extensions),"DIFERENTE · no puede heredar 12+12");
html+=row("Modificación prevista",yes(f.plannedModification),"DIFERENTE · no puede heredar modificación por mayores necesidades");
html+='</tbody></table><div class="warning"><strong>Guardas para la siguiente regresión:</strong> el motor deberá conservar DA 33.ª desactivada, precio global, ausencia de prórroga y ausencia de modificación prevista. No podrá trasladar presupuesto máximo por necesidades, precios unitarios, catálogo de 98 referencias ni lógica de mayores necesidades del golden case.</div><div class="warning"><strong>Alcance controlado.</strong> No se congelan todavía importes, CPV, duración exacta, entrega/implantación, garantía, solvencia, fórmula económica ni condiciones especiales. Esos datos requieren extracción documental específica.</div>';
if(!validated){html+='<p><strong>Estado:</strong> extracción de cobertura pendiente de validación humana.</p><button id="validateVeiasa006Extraction" type="button">Validar extracción documental 11.7.10</button>';}else{html+='<div class="info"><strong>11.7.10 validado por la persona usuaria.</strong> VEIASA queda preparado para su regresión automática específica, sin convertirse en golden case.</div><button id="downloadVeiasa006Extraction" type="button" class="secondary">Descargar extracción 11.7.10 JSON</button>';}
html+='</div>';return html;}
function ensure(){var old=document.getElementById("supplyRegressionVeiasa006ExtractionCard");if(old)old.remove();var anchor=document.getElementById("supplyRegressionTablets005GuardCard");if(anchor){var html=card();if(html)anchor.insertAdjacentHTML("afterend",html);}}
document.addEventListener("click",function(e){if(!e.target)return;if(e.target.id==="validateVeiasa006Extraction"){var a=readAnswers();if(a.supplyRegressionTablets005AutomaticGuardRegistered!==true){alert("Primero debe estar registrada la regresión Tablets 11.7.9.");return;}var m=manifest(true);a.supplyRegressionVeiasa006ExtractionValidated=true;a.supplyRegressionVeiasa006ExtractionVersion=VERSION;a.supplyRegressionVeiasa006ExtractionManifest=m;a.supplyRegressionVeiasa006Status="SOURCE_EXTRACTION_HUMAN_VALIDATED";a.supplyRegressionNextRecommendedCase="REG-SERVICE-005";save(a);downloadJson(m);ensure();alert("Extracción 11.7.10 validada. VEIASA queda listo para construir su regresión automática específica.");return;}if(e.target.id==="downloadVeiasa006Extraction"){var a2=readAnswers();downloadJson(a2.supplyRegressionVeiasa006ExtractionManifest||manifest(true));return;}},true);
document.addEventListener("contrata-ia:adaptive-saved",function(){setTimeout(ensure,0);});setTimeout(ensure,0);setTimeout(ensure,500);
})();`;
