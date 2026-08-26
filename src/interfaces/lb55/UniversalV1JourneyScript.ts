export const UNIVERSAL_V1_JOURNEY_SCRIPT = String.raw`(function(){
'use strict';
let definitions=[];
const byId=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]||c));
function showStatus(message,kind='muted'){const el=byId('status');if(!el)return;el.className=kind;el.textContent=message;}
function token(){return String(byId('token')?.value||'').trim();}
function headers(){const t=token();return {'content-type':'application/json',...(t?{authorization:'Bearer '+t}:{})};}
async function api(url,options={}){
  const response=await fetch(url,{...options,headers:{...headers(),...(options.headers||{})},credentials:'same-origin'});
  const text=await response.text();
  let data={};
  try{data=text?JSON.parse(text):{};}catch{data={error:text||'Respuesta no JSON'};}
  if(!response.ok)throw new Error(data.error||('HTTP '+response.status));
  return data;
}
function editor(def,field){
  const value=field?.value??'';
  if(def.control==='BOOLEAN')return '<select data-value><option value="true" '+(value===true?'selected':'')+'>Sí</option><option value="false" '+(value===false?'selected':'')+'>No</option></select>';
  if(def.control==='TEXTAREA'||def.control==='TABLE')return '<textarea data-value>'+esc(typeof value==='string'?value:JSON.stringify(value,null,2))+'</textarea>';
  return '<input data-value value="'+esc(value)+'">';
}
function parse(def,raw){
  if(def.control==='BOOLEAN')return raw==='true';
  if(def.control==='INTEGER'||def.control==='MONEY_CENTS'){const n=Number(raw);if(!Number.isFinite(n))throw new Error('Número inválido');return n;}
  if(def.control==='TABLE'){try{return JSON.parse(raw)}catch{return raw.split('\n').map(x=>x.trim()).filter(Boolean)}}
  return raw;
}
async function load(){
  const id=String(byId('caseId')?.value||'').trim();
  if(!id)throw new Error('Indique expediente.');
  if(!token())throw new Error('Introduzca la credencial de acceso.');
  showStatus('Abriendo expediente…','warning');
  const manifest=await api('/api/universal/manifest');
  definitions=manifest.fields||[];
  const response=await api('/api/universal/cases/'+encodeURIComponent(id)+'/evidence');
  const record=response.record||response;
  const box=byId('fields');
  box.innerHTML='';
  for(const def of definitions){
    const f=record.fields?.[def.fieldPath];
    const div=document.createElement('div');
    div.className='field';div.dataset.path=def.fieldPath;
    div.innerHTML='<div><strong>'+esc(def.label)+'</strong> <span class="state '+esc(f?.status||'PENDING')+'">'+esc(f?.status||'PENDING')+'</span></div><div class="muted">'+esc(def.fieldPath)+(def.help?' · '+esc(def.help):'')+'</div>'+editor(def,f)+'<div class="toolbar" style="margin-top:7px"><button data-save>Guardar declaración</button><button data-validate class="secondary">Validar humanamente</button></div><div class="muted">Fuentes: '+esc((f?.sources||[]).map(s=>s.sourceId).join(', ')||'sin fuente registrada')+'</div>';
    box.appendChild(div);
  }
  showStatus('Expediente abierto. Los cambios se guardan como SOURCE_DECLARED hasta revisión.','ok');
}
async function fieldAction(event){
  const target=event.target;
  if(!(target instanceof Element))return;
  const btn=target.closest('button');if(!btn)return;
  const row=btn.closest('.field');if(!row)return;
  const path=row.dataset.path;const def=definitions.find(x=>x.fieldPath===path);const id=String(byId('caseId')?.value||'').trim();
  try{
    if(btn.hasAttribute('data-save')){const raw=row.querySelector('[data-value]').value;await api('/api/universal/cases/'+encodeURIComponent(id)+'/evidence/'+encodeURIComponent(path),{method:'PUT',body:JSON.stringify({value:parse(def,raw)})});}
    else if(btn.hasAttribute('data-validate')){await api('/api/universal/cases/'+encodeURIComponent(id)+'/evidence/'+encodeURIComponent(path)+'/validate',{method:'POST',body:'{}'});}
    await load();
  }catch(error){showStatus(error instanceof Error?error.message:String(error),'warning');}
}
async function readiness(){try{const id=String(byId('caseId')?.value||'').trim();if(!id)throw new Error('Indique expediente.');const r=await api('/api/universal/cases/'+encodeURIComponent(id)+'/production-readiness');byId('gate').textContent=JSON.stringify(r,null,2);byId('gate').className=r.ready?'ok':'warning';}catch(error){showStatus(error instanceof Error?error.message:String(error),'warning');}}
async function generate(){try{const id=String(byId('caseId')?.value||'').trim();if(!id)throw new Error('Indique expediente.');const r=await fetch('/api/universal/cases/'+encodeURIComponent(id)+'/generate',{method:'POST',headers:headers(),body:'{}',credentials:'same-origin'});if(!r.ok){const data=await r.json().catch(()=>({error:'La generación protegida no pudo completarse.'}));throw new Error(data.error||('HTTP '+r.status));}const type=r.headers.get('content-type')||'';if(!type.includes('application/zip'))throw new Error('La respuesta de generación no es un paquete ZIP protegido.');const blob=await r.blob();const disposition=r.headers.get('content-disposition')||'';const match=/filename="([^"]+)"/i.exec(disposition);const name=match?.[1]||('Contrata-IA_'+id.replaceAll('/','-')+'_PCAP-Memoria-PPT.zip');const link=document.createElement('a');const href=URL.createObjectURL(blob);link.href=href;link.download=name;document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(href),1000);byId('gate').textContent='Paquete protegido generado y descargado: '+name+'\nIncluye PCAP, Memoria, PPT y manifest.json. La aceptación humana final sigue siendo obligatoria.';byId('gate').className='ok';}catch(error){showStatus(error instanceof Error?error.message:String(error),'warning');}}
function boot(){
  byId('load')?.addEventListener('click',()=>load().catch(error=>showStatus(error instanceof Error?error.message:String(error),'warning')));
  byId('readiness')?.addEventListener('click',readiness);
  byId('generate')?.addEventListener('click',generate);
  byId('fields')?.addEventListener('click',fieldAction);
  showStatus('Interfaz preparada. Introduzca expediente y credencial.','muted');
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();`;
