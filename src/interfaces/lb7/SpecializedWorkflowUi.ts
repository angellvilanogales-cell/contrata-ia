export const SPECIALIZED_WORKFLOW_UI = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#176b45">
<title>Contrata-IA · Revisión especializada</title>
<style>
body{font-family:Arial,sans-serif;margin:0;background:#f4f6f7;color:#17202a}header{background:#fff;border-bottom:1px solid #ddd;padding:18px;position:sticky;top:0}main{max-width:1050px;margin:24px auto;padding:0 16px}.card{background:#fff;border:1px solid #ddd;border-radius:8px;padding:20px;margin-bottom:16px}.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.checks{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}label{font-weight:600}input,textarea,select{box-sizing:border-box;width:100%;padding:10px;margin:5px 0 12px;border:1px solid #bbb;border-radius:4px;font-size:16px}textarea{min-height:76px}.check{display:flex;gap:8px;align-items:center;font-weight:400}.check input{width:auto;margin:0}button{padding:11px 14px;border:0;border-radius:5px;background:#176b45;color:#fff;cursor:pointer;margin:4px;min-height:44px}.secondary{background:#566573}.warning{background:#fff3cd}.ok{background:#e8f5e9}.muted{color:#626567}pre{white-space:pre-wrap;background:#f8f9f9;padding:12px;overflow:auto}.status{font-weight:700}@media(max-width:720px){.grid,.checks{grid-template-columns:1fr}button{width:100%;margin:4px 0}}
</style>
</head>
<body>
<header><strong>Contrata-IA</strong> · Configuración especializada y revisión prejurídica</header>
<main>
<div class="card"><h2>Expediente</h2><div class="grid"><div><label>Identificador del expediente</label><input id="caseId" placeholder="Ej.: CONTR-2026-..." /></div><div><label>Credencial de acceso</label><input id="token" type="password" autocomplete="off" placeholder="Bearer token del piloto" /></div></div><button onclick="loadReview()">Cargar estado</button><button class="secondary" onclick="location.href='/'">Volver al asistente principal</button><div id="current" class="muted"></div></div>

<div class="card"><h2>1. EVENT_SERVICES</h2><p class="muted">Active únicamente las prestaciones que formen parte del contrato. Los datos que active y no cumplimente quedarán como pendientes; Contrata-IA no los inventará.</p><div class="checks" id="features"></div><div id="eventFields" class="grid"></div><button onclick="saveEvent()">Guardar configuración de evento</button></div>

<div class="card"><h2>2. Revisión jurídica preventiva</h2><p class="muted">Esta pantalla detecta configuraciones que requieren revisión antes de remitir el expediente a Asesoría Jurídica. No sustituye el informe del Letrado.</p><div class="grid">
<div><label>Tipo de contrato</label><select id="contractType"><option value="SERVICES">Servicios</option><option value="SUPPLIES">Suministros</option></select></div>
<div><label>¿Parte del modelo oficial recomendado de PCAP?</label><select id="officialModel"><option value="true">Sí</option><option value="false">No</option></select></div>
<div><label>¿Contrato en función de necesidades / DA 33.ª?</label><select id="needsBased"><option value="false">No</option><option value="true">Sí</option></select></div>
<div><label>Meses de prórroga previstos</label><input id="extensionMonths" type="number" min="0" value="0" /></div>
<div><label>¿La prórroga añade/restituye presupuesto?</label><select id="extensionAddsBudget"><option value="false">No</option><option value="true">Sí</option></select></div>
<div><label>¿El VEC vuelve a sumar el presupuesto de prórroga?</label><select id="vecAddsExtension"><option value="false">No</option><option value="true">Sí</option></select></div>
<div><label>¿Se propone un único criterio de adjudicación?</label><select id="singleCriterion"><option value="false">No</option><option value="true">Sí</option></select></div>
<div><label>¿El plazo de entrega/ejecución es variable?</label><select id="deliveryVariable"><option value="false">No</option><option value="true">Sí</option></select></div>
<div><label>¿Existe modificación contractual prevista?</label><select id="plannedModification"><option value="false">No</option><option value="true">Sí</option></select></div>
<div><label>¿La modificación admite elementos nuevos sin precio unitario?</label><select id="newUnpriced"><option value="false">No</option><option value="true">Sí</option></select></div>
<div><label>¿El catálogo/prestación queda abierto a elementos no definidos?</label><select id="openCatalogue"><option value="false">No</option><option value="true">Sí</option></select></div>
</div><button onclick="savePreLegal()">Ejecutar revisión preventiva</button></div>

<div id="result"></div>
</main>
<script>
const featureOptions=[
['MULTI_EVENT','Varios eventos'],['MULTI_LOT','Varios lotes'],['MULTI_PROVINCE','Varias provincias/localidades'],['VENUE','Sede/espacio'],['AUDIOVISUAL','Audiovisual'],['STREAMING','Streaming'],['PEOPLE','Personal/ponentes/actuaciones'],['ACCESSIBILITY','Accesibilidad'],['CATERING','Catering'],['RESERVED_CATERING_LOT','Lote reservado de catering'],['TRAVEL','Viajes/alojamiento'],['AWARDS','Premios/estatuillas'],['PERSONAL_DATA','Datos personales'],['INTELLECTUAL_PROPERTY','Propiedad intelectual']
];
const baseFields=[
['eventOfficialNames','Denominación oficial del evento o eventos'],['eventCount','Número de eventos'],['publicPurposeAndNeed','Finalidad pública y necesidad'],['datesOrTimeWindow','Fechas o ventana temporal'],['locationsAndNuts','Localidades y NUTS'],['lots','Lotes y prestaciones'],['cpvByLotOrPrestacion','CPV por lote o prestación'],['creativeConcept','Concepto creativo'],['productionPlan','Plan de producción'],['runOfShow','Escaleta/secuencia técnica'],['montageDismantling','Montaje, desmontaje y logística'],['licensesAuthorizations','Licencias y autorizaciones'],['insurance','Seguros exigidos'],['finalReportAndMetrics','Informe final, indicadores y entregables']
];
const conditional={VENUE:[['venue','Espacio o sede'],['expectedAttendance','Asistencia o aforo previsto']],AUDIOVISUAL:[['soundLightingProjection','Sonido, iluminación y proyección'],['photoVideoRequirements','Fotografía y vídeo']],STREAMING:[['streamingRequirements','Streaming/retransmisión']],PEOPLE:[['presenterSpeakersPerformers','Presentación, ponentes o actuaciones'],['supportStaff','Equipo de producción y auxiliares']],ACCESSIBILITY:[['signLanguageAccessibility','Lengua de signos y accesibilidad']],CATERING:[['catering','Alcance del catering'],['expectedCovers','Servicios/cubiertos previstos']],RESERVED_CATERING_LOT:[['reservedCateringLot','Configuración del lote reservado']],TRAVEL:[['travel','Traslados'],['accommodation','Alojamiento']],AWARDS:[['awardsStatuettesGifts','Estatuillas, premios u obsequios']],PERSONAL_DATA:[['personalDataProcessing','Tratamiento de datos personales']],INTELLECTUAL_PROPERTY:[['intellectualProperty','Propiedad intelectual e imagen']]};
function headers(){const token=document.getElementById('token').value.trim();return {'content-type':'application/json',...(token?{authorization:'Bearer '+token}:{})};}
function id(){const value=document.getElementById('caseId').value.trim();if(!value)throw new Error('Indique el identificador del expediente.');return value;}
async function api(url,opt={}){opt.headers={...(opt.headers||{}),...headers()};const r=await fetch(url,opt);if(!r.ok){let e;try{e=await r.json()}catch{e={error:await r.text()}}throw new Error(e.error||'Error');}return r.json();}
function bool(id){return document.getElementById(id).value==='true';}
function selectedFeatures(){return featureOptions.filter(([key])=>document.getElementById('f_'+key).checked).map(([key])=>key);}
function renderFeatures(){document.getElementById('features').innerHTML=featureOptions.map(([key,label])=>'<label class="check"><input type="checkbox" id="f_'+key+'" onchange="renderEventFields()"> '+label+'</label>').join('');renderEventFields();}
function fieldHtml([key,label]){return '<div><label>'+label+'</label><textarea id="e_'+key+'"></textarea></div>';}
function renderEventFields(){let fields=[...baseFields];for(const f of selectedFeatures())if(conditional[f])fields.push(...conditional[f]);const seen=new Set();fields=fields.filter(([key])=>!seen.has(key)&&seen.add(key));document.getElementById('eventFields').innerHTML=fields.map(fieldHtml).join('');}
function collectEventAnswers(){const answers={};document.querySelectorAll('[id^="e_"]').forEach(el=>{const value=el.value.trim();if(value)answers[el.id.slice(2)]=value;});return answers;}
async function saveEvent(){try{const out=await api('/api/cases/'+encodeURIComponent(id())+'/event-services',{method:'POST',body:JSON.stringify({features:selectedFeatures(),answers:collectEventAnswers()})});show(out.review);}catch(e){alert(e.message);}}
async function savePreLegal(){try{const input={contractType:document.getElementById('contractType').value,usesOfficialRecommendedPcapModel:bool('officialModel'),needsBasedUnderDa33:bool('needsBased'),extensionMonths:Number(document.getElementById('extensionMonths').value||0),extensionAddsBudget:bool('extensionAddsBudget'),estimatedValueIncludesExtensionBudgetAgain:bool('vecAddsExtension'),singleAwardCriterion:bool('singleCriterion'),deliveryTimeVariable:bool('deliveryVariable'),plannedModification:bool('plannedModification'),modificationAllowsNewUnpricedItems:bool('newUnpriced'),catalogueOpenEnded:bool('openCatalogue')};const out=await api('/api/cases/'+encodeURIComponent(id())+'/pre-legal-review',{method:'POST',body:JSON.stringify(input)});show(out.review);}catch(e){alert(e.message);}}
async function loadReview(){try{const review=await api('/api/cases/'+encodeURIComponent(id())+'/review',{method:'GET'});show(review);}catch(e){alert(e.message);}}
function esc(s){return String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');}
function show(review){const lb7=review.lb7||{};let html='<div class="card"><h2>Estado especializado</h2><p>Estado para remisión jurídica: <span class="status">'+esc(lb7.legalReferralStatus||'NOT_RUN')+'</span></p>';
if(lb7.eventServices){html+='<h3>EVENT_SERVICES</h3>';if(lb7.eventServices.warnings.length)html+='<div class="warning">'+lb7.eventServices.warnings.map(esc).join('<br>')+'</div>';else html+='<div class="ok">Datos técnicos especializados suficientes para componer el borrador de evento.</div>';}
if(lb7.preLegalReview){html+='<h3>Revisión preventiva</h3>';if(lb7.preLegalReview.findings.length)html+=lb7.preLegalReview.findings.map(f=>'<div class="warning"><strong>'+esc(f.topic)+'</strong><br>'+esc(f.message)+'<br><em>'+esc(f.actionBeforeLegalReferral)+'</em></div>').join('');else html+='<div class="ok">No se han detectado alertas calibradas con LEGAL-REAL-001. La remisión continúa sometida a revisión humana y normativa vigente.</div>';}
html+='</div>';document.getElementById('result').innerHTML=html;document.getElementById('current').textContent='Estado cargado para '+id();}
renderFeatures();
</script>
</body></html>`;
