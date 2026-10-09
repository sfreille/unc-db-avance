'use strict';
const source = window.COHORT;
let data = source.segments.all;
const $ = id => document.getElementById(id);
const fmt = (n, digits=0) => n == null ? '—' : Number(n).toLocaleString('es-AR', {maximumFractionDigits:digits,minimumFractionDigits:digits});
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const percent = n => n == null ? '—' : `${fmt(n,1)}%`;
function options(id, values, label) { $(id).replaceChildren(new Option(label,''), ...values.map(v => new Option(v.label ?? v, v.value ?? v))); }
options('faculty',source.faculties,'Todas las unidades');
options('type',source.types,'Todos los tipos');
const populationLabels = {all:'Todas las personas', single:'Personas con una sola propuesta', multiple:'Personas con más de una propuesta'};
function selectedProgrammes() { return data.programmes.filter(p => (!$('faculty').value || p.faculty === $('faculty').value) && (!$('type').value || p.type === $('type').value) && (!$('programme').value || p.id === $('programme').value)); }
function refreshProgrammes() { const previous=$('programme').value; const list=data.programmes.filter(p => (!$('faculty').value || p.faculty === $('faculty').value) && (!$('type').value || p.type === $('type').value)); options('programme',list.sort((a,b)=>a.name.localeCompare(b.name,'es')).map(p=>({label:`${p.name} · ${p.id}`,value:p.id})),'Todas las propuestas'); if(list.some(p=>p.id===previous)) $('programme').value=previous; }
const empty = {records:0, people:0, valid:0, invalid:0, mean:null, median:null, passed:null,bins:[0,0,0,0,0,0]};
function bar(label,value,detail) { return `<div class="bar-row"><div class="bar-label"><span>${esc(label)}</span><strong>${detail}</strong></div><div class="track"><div class="fill" style="width:${Math.max(0,Math.min(100,value))}%"></div></div></div>`; }
const emptyProfile = {people:0,valid_people:0,partial_people:0,mean:null,passed:null,multiple_people:0,paired_people:0,highest:null,remaining:null,gap:null,cells:[]};
function profileRange(bin) { return bin === 9 ? '90–100%' : `${bin*10}–<${(bin+1)*10}%`; }
function renderPersonProgress(p = emptyProfile) {
 const cards = [
  ['Avance medio por persona',percent(p.mean),'Promedio de los avances de cada persona'],
  ['Aprobadas · media por persona',fmt(p.passed,1),'Promedio personal por propuesta; no suma materias'],
  ['Mayor avance · media',percent(p.highest),'Varias propuestas · perfiles completos'],
  ['Restantes · avance medio',percent(p.remaining),'Media personal sin una propuesta de mayor avance'],
  ['Brecha media',p.gap == null ? '—' : `${fmt(p.gap,1)} pp`,'Mayor avance menos media de las restantes']
 ];
 $('person-kpis').innerHTML=cards.map(([label,value,note])=>`<article class="person-kpi"><div class="kpi-label">${label}</div><div class="metric">${value}</div><div class="footnote">${note}</div></article>`).join('');
 $('person-base').textContent=`Avance medio: ${fmt(p.valid_people)} personas con algún avance válido (${fmt(p.partial_people)} con perfil parcial). Aprobadas: ${fmt(p.people)} personas. Cada promedio personal recibe el mismo peso.`;
 $('profile-base').textContent=`Mayor avance, restantes y brecha: ${fmt(p.paired_people)} de ${fmt(p.multiple_people)} personas con varias propuestas. Se excluyen ${fmt(p.multiple_people-p.paired_people)} perfiles incompletos. En un empate se retira solo una de las propuestas de mayor avance.`;
 if (!p.paired_people) {
  $('progress-plot').innerHTML='<p class="profile-empty">No hay personas con varias propuestas y avance válido en todas ellas en esta selección.</p>';
  $('profile-table').innerHTML='<p>Sin perfiles comparables.</p>';
  return;
 }
 const ticks=[0,20,40,60,80,100];
 const grid=ticks.map(t=>`<line x1="${65+t*4}" y1="30" x2="${65+t*4}" y2="330" class="plot-grid"/><line x1="65" y1="${330-t*3}" x2="465" y2="${330-t*3}" class="plot-grid"/><text x="${65+t*4}" y="351" text-anchor="middle">${t}</text><text x="53" y="${334-t*3}" text-anchor="end">${t}</text>`).join('');
 const max=Math.max(...p.cells.map(c=>c.count));
 const dots=p.cells.map(c=>{
  const label=`Mayor avance ${profileRange(c.y)}; restantes ${profileRange(c.x)}: ${fmt(c.count)} personas`;
  return `<circle cx="${65+(c.x*10+5)*4}" cy="${330-(c.y*10+5)*3}" r="${3+13*Math.sqrt(c.count/max)}" class="profile-dot" tabindex="0" role="img" aria-label="${esc(label)}"><title>${esc(label)}</title></circle>`;
 }).join('');
 $('progress-plot').innerHTML=`<svg viewBox="0 0 510 395" class="profile-svg" role="group" aria-label="Mayor avance frente al promedio de las restantes propuestas. Círculos agrupados en tramos de 10 puntos porcentuales."><text x="65" y="17" class="axis-title">Mayor avance (%)</text>${grid}<line x1="65" y1="330" x2="465" y2="30" class="plot-diagonal"/>${dots}<text x="265" y="384" text-anchor="middle" class="axis-title">Avance medio en las restantes (%)</text></svg><p class="footnote">Cada círculo agrupa personas en tramos de 10 puntos. Un círculo mayor indica más personas (máximo: ${fmt(max)}). Consultá los conteos con el puntero o en la tabla.</p>`;
 $('profile-table').innerHTML=`<table><caption>Personas por combinación de avances</caption><thead><tr><th>Mayor avance</th><th>Restantes</th><th>Personas</th></tr></thead><tbody>${[...p.cells].sort((a,b)=>b.y-a.y || a.x-b.x).map(c=>`<tr><td>${profileRange(c.y)}</td><td>${profileRange(c.x)}</td><td>${fmt(c.count)}</td></tr>`).join('')}</tbody></table>`;
}
function render() {
 const list=selectedProgrammes();
 const s=$('programme').value ? (list[0]?.summary ?? empty) : (data.slices.find(s=>s.faculty===$('faculty').value && s.type===$('type').value)?.summary ?? empty);
 $('status').textContent=`${populationLabels[$('population').value]} · ${fmt(list.length)} propuestas · ${fmt(s.records)} registros en la selección${s.invalid ? ` · ${s.invalid} registro con avance no válido (−1)` : ''}`;
 renderPersonProgress(s.person_progress);
 const cards=[['Personas únicas',fmt(s.people),'Sin duplicados en esta selección'],['Registros en propuestas',fmt(s.records),'Una persona puede tener varios'],['Avance medio · registros',percent(s.mean),`Por registro · Mediana: ${percent(s.median)}`],['Materias aprobadas · media',fmt(s.passed,1),'Promedio por registro']];
 $('kpis').innerHTML=cards.map(([label,value,note])=>`<article class="kpi"><div class="kpi-label">${label}</div><div class="metric">${value}</div><div class="footnote">${note}</div></article>`).join('');
 const labels=['0%','Más de 0% a menos de 25%','25% a menos de 50%','50% a menos de 75%','75% a menos de 100%','100%'];
 $('histogram').innerHTML=s.valid ? s.bins.map((n,i)=>bar(labels[i],100*n/s.valid,`${percent(100*n/s.valid)} · ${fmt(n)}`)).join('') : '<p>No hay registros con avance válido.</p>';
 $('denominator').textContent=`Base: ${fmt(s.valid)} registros con avance válido. Los tramos se calculan sobre registros, no sobre personas únicas.`;
 const comparisons = $('programme').value ? list.map(p=>({name:p.faculty,summary:p.summary})) : data.slices.filter(x=>x.faculty && (!$('faculty').value || x.faculty===$('faculty').value) && x.type===$('type').value).map(x=>({name:x.faculty,summary:x.summary}));
 $('comparison').innerHTML=comparisons.filter(x=>x.summary.records>0).sort((a,b)=>b.summary.records-a.summary.records).map(x=>{
   const mean=x.summary.mean;
   const shade=mean==null ? '#edf1ed' : `hsl(163 32% ${95-(mean/100)*62}%)`;
   const name=x.name.replace(/^Facultad de /i,'').replace(/^Facultad /i,'');
   const detail=`${x.name}: avance medio ${percent(mean)} · ${fmt(x.summary.records)} registros`;
   return `<button class="unit" data-faculty="${esc(x.name)}" style="--shade:${shade};--ink:${mean>65?'#fff':'#153536'}" aria-label="${esc(detail)}"><span class="unit-name">${esc(name)}</span><strong>${percent(mean)}</strong><span class="unit-tooltip" role="tooltip">${esc(detail)}</span></button>`;
 }).join('') || '<p>No hay registros para esta combinación.</p>';
}
for(const id of ['faculty','type']) $(id).addEventListener('change',()=>{refreshProgrammes();render();});
$('population').addEventListener('change',()=>{data=source.segments[$('population').value];refreshProgrammes();render();});
$('programme').addEventListener('change',render);
$('comparison').addEventListener('click',event=>{const unit=event.target.closest('[data-faculty]');if(!unit)return;$('faculty').value=unit.dataset.faculty;refreshProgrammes();render();});
$('reset').addEventListener('click',()=>{$('population').value='all';data=source.segments.all;$('faculty').value='';$('type').value='';$('programme').value='';refreshProgrammes();render();});
const personExportFields = ['people','valid_people','partial_people','mean','passed','multiple_people','paired_people','highest','remaining','gap'];
$('download').addEventListener('click',()=>{
 const list=selectedProgrammes();
 const current=$('programme').value ? (list[0]?.summary ?? empty) : (data.slices.find(s=>s.faculty===$('faculty').value && s.type===$('type').value)?.summary ?? empty);
 const profileValues=s=>personExportFields.map(key=>(s.person_progress ?? emptyProfile)[key]);
 const rows=[['grupo_personas','propuesta','nombre','unidad','tipo','registros','personas','avance_valido_n','avance_invalido_n','avance_medio','avance_mediana','aprobadas_media',...personExportFields.map(key=>'perfil_todas_propuestas_'+key)],
  [populationLabels[$('population').value],'','TOTAL SELECCIÓN',$('faculty').value,$('type').value,current.records,current.people,current.valid,current.invalid,current.mean,current.median,current.passed,...profileValues(current)],
  ...list.sort((a,b)=>b.summary.records-a.summary.records).map(p=>[populationLabels[$('population').value],p.id,p.name,p.faculty,p.type,p.summary.records,p.summary.people,p.summary.valid,p.summary.invalid,p.summary.mean,p.summary.median,p.summary.passed,...profileValues(p.summary)])];
 const csv='\uFEFF'+rows.map(r=>r.map(v=>'"'+String(v??'').replace(/"/g,'""')+'"').join(',')).join('\r\n');
 const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='cohorte-2020-'+$('population').value+'-resumen.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
});
refreshProgrammes();render();

