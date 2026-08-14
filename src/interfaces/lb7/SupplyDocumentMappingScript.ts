export const SUPPLY_DOCUMENT_MAPPING_SCRIPT = `"use strict";
(function(){
var work=document.getElementById("work");if(!work)return;
var answersKey="contrataIaAdaptiveAnswers",catalogueKey="contrataIaSupplyCatalogue";
function esc(v){return String(v==null?"":v).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;");}
function readJson(storage,key){try{return JSON.parse(storage.getItem(key)||"{}");}catch(e){return {};}}
function readAnswers(){var a=readJson(sessionStorage,answersKey);if(Object.keys(a).length)return a;a=readJson(localStorage,answersKey);if(Object.keys(a).length)sessionStorage.setItem(answersKey,JSON.stringify(a));return a;}
function readCatalogue(){var c=readJson(sessionStorage,catalogueKey);if(Array.isArray(c.items)&&c.items.length)return c;c=readJson(localStorage,catalogueKey);if(Array.isArray(c.items)&&c.items.length)sessionStorage.setItem(catalogueKey,JSON.stringify(c));return c;}
function saveAnswers(a,kind){var raw=JSON.stringify(a);sessionStorage.setItem(answersKey,raw);localStorage.setItem(answersKey,raw);document.dispatchEvent(new CustomEvent("contrata-ia:adaptive-saved",{detail:{kind:kind||"supply-document-mapping"}}));}
function parseNumber(v){var s=String(v||"").trim().split(" ").join("").replaceAll("€","");if(!s)return NaN;var c=s.lastIndexOf(","),d=s.lastIndexOf(".");if(c>=0&&d>=0){if(c>d)s=s.replaceAll(".","").replace(",",".");else s=s.replaceAll(",","");}else if(c>=0)s=s.replace(",",".");else if(d>=0){var p=s.split(".");if(p.length>2||((p[p.length-1]||"").length===3&&p.length===2))s=p.join("");}return Number(s);}
function money(v){return Number(v||0).toLocaleString("es-ES",{minimumFractionDigits:2,maximumFractionDigits:2})+" €";}
function ready(){var a=readAnswers();return a.supplyDocumentPreparationValidated===true&&a.supplyDocumentPreparationStatus==="READY_FOR_TEMPLATE_MAPPING";}
function lotGroups(c){var groups={};var named=Array.isArray(c.lots)&&c.lots.length>0;(c.items||[]).forEach(function(x){var key=String(x.lote||"").trim()||(named?"Sin lote asignado":"Lote 1 — lote único");(groups[key]||(groups[key]=[])).push(x);});return groups;}
function lotAmount(items){return items.reduce(function(s,x){var q=parseNumber(x.cantidad),p=parseNumber(x.precio);return s+(Number.isFinite(q)&&q>0&&Number.isFinite(p)&&p>=0?q*p:0);},0);}
function rowList(items){return '<details><summary>'+items.length+' referencias que se incorporarán al anexo técnico</summary><div style="max-height:280px;overflow:auto"><table style="width:100%;border-collapse:collapse"><thead><tr><th>Denominación</th><th>Cantidad base</th><th>Precio unitario</th></tr></thead><tbody>'+items.map(function(x){return '<tr><td>'+esc(x.denominacion)+'</td><td>'+esc(x.cantidad)+'</td><td>'+esc(x.precio)+'</td></tr>';}).join("")+'</tbody></table></div></details>';}
function section(title,status,items){return '<div class="card" style="margin-top:10px"><h4>'+esc(title)+'</h4><div class="'+(status==="READY"?'info':'warning')+'"><strong>'+(status==="READY"?'Preparado para trasladar':'Requiere verificación antes de cerrar')+'</strong></div><ul>'+items.map(function(x){return '<li>'+x+'</li>';}).join("")+'</ul></div>';}
function mappingCard(){var a=readAnswers(),c=readCatalogue(),groups=lotGroups(c);var ext=Array.isArray(a.extensionMonths)?a.extensionMonths:[];var projected=Number(a.supplyCatalogueProjectedTotalConsumptionExVat||a.supplyCatalogueProjectedEstimatedValueExVat||0);var maxBudget=Number(a.supplyMaximumApprovedBudgetExVat||0);var priceOnly=a.supplyAwardCriteriaMode==="PRICE_ONLY";var criteria=priceOnly?"Precio como criterio único":"Pluralidad de criterios objetivos cuantificables mediante fórmula";
var memoria=[
'<strong>Necesidad y objeto:</strong> '+esc(a.needAndPurpose||"")+' '+esc(a.scopeDetail||""),
'<strong>Naturaleza:</strong> contrato de suministro.',
'<strong>Lotes:</strong> '+(Object.keys(groups).length===1?'lote único con motivación validada/pendiente de volcado':'varios lotes según catálogo importado')+'.',
'<strong>CPV:</strong> 44316400-2 · Artículos de ferretería.',
'<strong>Consumo estimado de referencia:</strong> '+money(c.total)+' para '+Number(a.supplyCatalogueReferenceMonths||0)+' meses.',
'<strong>Proyección de consumo:</strong> '+money(projected)+' durante la duración máxima prevista. Esta cifra es orientativa y no constituye automáticamente presupuesto máximo ni valor estimado.',
'<strong>Presupuesto máximo aprobado:</strong> '+money(maxBudget)+' sin IVA para toda la vigencia contractual, incluidas las posibles prórrogas. Las prórrogas no incrementan por sí solas este límite.',
'<strong>Valor estimado:</strong> pendiente de cálculo jurídico final conforme a las opciones y modificaciones que finalmente se prevean en el PCAP; no se toma automáticamente de la proyección de consumo.',
'<strong>Duración:</strong> '+Number(a.initialDurationMonths||0)+' meses'+(ext.length?' + '+ext.map(function(m,i){return 'prórroga '+(i+1)+' de '+m+' meses';}).join('; '):' sin prórrogas')+'.',
'<strong>Procedimiento:</strong> propuesta provisional de abierto simplificado abreviado, sujeta a confirmar el valor estimado y los restantes requisitos legales.',
'<strong>Criterios:</strong> '+criteria+'.'+(priceOnly?' Se incorporará motivación reforzada conforme a los artículos 145.1, 145.3.f y 146.1 LCSP y al patrón documental del expediente de ferretería CONTR/2026/240267.':'')
];
var pcap=[
'<strong>Anexo I / características:</strong> objeto, CPV, lote(s), presupuesto máximo para toda la vigencia, valor estimado una vez cerrado jurídicamente, duración y prórrogas.',
'<strong>Contrato en función de las necesidades:</strong> el presupuesto máximo aprobado opera como límite económico para toda la vigencia, incluidas las prórrogas; una prórroga no produce incremento automático del presupuesto.',
'<strong>Forma de suministro:</strong> '+(a.supplyAcquisitionMode==="SUCCESSIVE_NEEDS"?'pedidos sucesivos según necesidades':'cantidades previamente definidas')+'.',
'<strong>Criterios de adjudicación:</strong> '+criteria+'.'+(priceOnly?' La motivación propuesta parte de que los artículos estén perfectamente definidos, la calidad mínima quede cerrada en el PPT y el plazo de entrega sea uniforme y no mejorable mediante oferta.':'') ,
'<strong>Entrega:</strong> plazo máximo '+Number(a.supplyDeliveryDeadlineDays||0)+' días; centros de entrega '+(a.supplyDeliveryPlacesDefined?'definidos':'pendientes de concreción')+'.',
'<strong>Conformidad:</strong> '+(a.supplyReplacementRequired?'sustitución de artículos defectuosos o no conformes sin coste adicional':'sin regla adicional de sustitución declarada')+'.',
'<strong>Solvencia y garantías:</strong> se incorporará la motivación jurídica validada, incluidos los artículos 159.6.b, 159.4.b y 159.6.f LCSP.',
'<strong>Condición especial de ejecución:</strong> gestión y retirada de embalajes/residuos vinculados a las entregas, conforme a la redacción validada del artículo 202.1 LCSP.',
'<strong>Modificaciones:</strong> no se incorporarán nuevos artículos con precios unitarios no previstos; cualquier previsión de aumento de necesidades deberá mantener el mismo objeto y los precios unitarios ofertados y someterse al régimen legal aplicable.'
];
var ppt=[
'<strong>Objeto y alcance técnico:</strong> relación cerrada de referencias y especificaciones importadas.',
'<strong>Pedidos y entregas:</strong> modalidad, plazo de entrega, lugares y control de conformidad.',
'<strong>Precios unitarios:</strong> cada referencia conserva cantidad base y precio unitario de la tabla.',
'<strong>Importe de la relación:</strong> los subtotales se calculan con el mismo conversor numérico validado del importador ODS/CSV; en lote único deben coincidir con el total importado.',
'<strong>No invención:</strong> no se añadirán artículos, prestaciones o precios que no figuren en el catálogo validado.'
];
Object.keys(groups).forEach(function(name){var subtotal=lotAmount(groups[name]);if(Object.keys(groups).length===1&&Number(c.total)>0)subtotal=Number(c.total);ppt.push('<strong>'+esc(name)+':</strong> '+groups[name].length+' artículos · base económica de la relación '+money(subtotal)+'. '+rowList(groups[name]));});
var html='<div id="supplyDocumentMappingCard" class="card"><h3>5. Mapeo documental del suministro</h3><p>Vista previa de cómo se trasladarán los datos ya validados. Este paso no genera todavía el PCAP completo: el PCAP definitivo debe partir del modelo recomendado oficial vigente y parametrizar su Anexo I.</p>';
html+=section('Memoria justificativa','READY',memoria);
html+=section('PCAP · Anexo I y cláusulas variables',priceOnly?'VERIFY':'READY',pcap);
html+=section('PPT · prescripciones y anexo de artículos','READY',ppt);
html+='<div class="warning"><strong>Valor estimado pendiente de cierre.</strong> Contrata-IA ya distingue consumo previsto, presupuesto máximo y valor estimado. Antes de cerrar procedimiento y PCAP deberá calcularse el valor estimado conforme a la configuración definitiva de opciones y modificaciones; la proyección de consumo no se reutilizará automáticamente como valor estimado.</div>';
if(priceOnly)html+='<div class="warning"><strong>Precio como criterio único: motivación reforzada disponible, no decisión automática general.</strong> Para el expediente de ferretería CONTR/2026/240267, la respuesta a la Asesoría Jurídica justificó el precio único por tratarse de artículos perfectamente definidos, con calidad mínima cerrada y plazo de entrega uniforme de 5 días hábiles, descartando valorar una reducción del plazo por riesgo de compromisos poco realistas. Antes de cerrar el PCAP debe verificarse que esas mismas circunstancias concurren en este expediente y que la configuración es compatible con el artículo 145.3.f LCSP y con el régimen de modificaciones finalmente previsto.</div>';
if(a.supplyDocumentMappingValidated===true)html+='<div class="info"><strong>Mapeo documental validado.</strong> El siguiente paso será seleccionar/verificar el modelo oficial vigente de PCAP de suministros y cerrar el valor estimado antes de generar los borradores editables.</div>';
else html+='<div class="toolbar"><button id="validateSupplyDocumentMapping" type="button">Validar mapeo documental</button><button id="requestSupplyMappingCorrection" type="button" class="secondary">Necesito corregir el mapeo</button></div><div id="supplyMappingCorrectionBox"></div>';
html+='</div>';return html;}
function ensure(){var old=document.getElementById("supplyDocumentMappingCard");if(!ready()){if(old)old.remove();return;}if(old)return;var f=document.getElementById("supplyFinalizationCard");if(f)f.insertAdjacentHTML("afterend",mappingCard());else work.insertAdjacentHTML("beforeend",mappingCard());}
function rerender(){var old=document.getElementById("supplyDocumentMappingCard");if(old)old.remove();ensure();}
work.addEventListener("click",function(event){var t=event.target;if(!t||!t.id)return;var a=readAnswers();if(t.id==="validateSupplyDocumentMapping"){a.supplyDocumentMappingValidated=true;a.supplyDocumentMappingStatus="READY_FOR_OFFICIAL_TEMPLATE_SELECTION";a.supplyPriceOnlyMotivationStatus=a.supplyAwardCriteriaMode==="PRICE_ONLY"?"CASE_SPECIFIC_MOTIVATION_REQUIRES_FINAL_LEGAL_CHECK":"NOT_APPLICABLE";a.supplyEstimatedValueStatus="PENDING_FINAL_LEGAL_CALCULATION";delete a.supplyDocumentMappingCorrection;saveAnswers(a,"supply-document-mapping-validated");rerender();}if(t.id==="requestSupplyMappingCorrection"){var box=document.getElementById("supplyMappingCorrectionBox");if(box)box.innerHTML='<label><strong>Indique qué dato o ubicación documental debe cambiar</strong></label><textarea id="supplyMappingCorrection"></textarea><button id="saveSupplyMappingCorrection" type="button">Guardar corrección pendiente</button>';}if(t.id==="saveSupplyMappingCorrection"){var el=document.getElementById("supplyMappingCorrection");if(!el||!el.value.trim()){alert("Indique la corrección necesaria.");return;}a.supplyDocumentMappingCorrection=el.value.trim();a.supplyDocumentMappingValidated=false;a.supplyDocumentMappingStatus="CORRECTION_REQUIRED";saveAnswers(a,"supply-document-mapping-correction");rerender();}});
document.addEventListener("contrata-ia:adaptive-saved",function(){setTimeout(rerender,0);});
var observer=new MutationObserver(function(){ensure();});observer.observe(work,{childList:true,subtree:true});ensure();
})();`;
