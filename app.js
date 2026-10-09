'use strict';
const data = window.COHORT;
const $ = id => document.getElementById(id);
const fmt = (n, digits=0) => n == null ? '—' : Number(n).toLocaleString('es-AR', {maximumFractionDigits:digits,minimumFractionDigits:digits});
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const percent = n => n == null ? '—' : `${fmt(n,1)}%`;
function options(id, values, label) { $(id).replaceChildren(new Option(label,''), ...values.map(v => new Option(v.label ?? v, v.value ?? v))); }
options('faculty',data.faculties,'Todas las unidades');
options('type',data.types,'Todos los tipos');
function selectedProgrammes() { return data.programmes.filter(p => (!$('faculty').value || p.faculty === $('faculty').value) && (!$('type').value || p.type === $('type').value) && (!$('programme').value || p.id === $('programme').value)); }
function refreshProgrammes() { const previous=$('programme').value; const list=data.programmes.filter(p => (!$('faculty').value || p.faculty === $('faculty').value) && (!$('type').value || p.type === $('type').value)); options('programme',list.sort((a,b)=>a.name.localeCompare(b.name,'es')).map(p=>({label:`${p.name} · ${p.id}`,value:p.id})),'Todas las propuestas'); if(list.some(p=>p.id===previous)) $('programme').value=previous; }
const empty = {records:0, people:0, valid:0, invalid:0, mean:null, median:null, passed:null,bins:[0,0,0,0,0,0]};
function bar(label,value,detail) { return `<div class="bar-row"><div class="bar-label"><span>${esc(label)}</span><strong>${detail}</strong></div><div class="track"><div class="fill" style="width:${Math.max(0,Math.min(100,value))}%"></div></div></div>`; }
function render() {
 const list=selectedProgrammes();
 const s=$('programme').value ? (list[0]?.summary ?? empty) : (data.slices.find(s=>s.faculty===$('faculty').value && s.type===$('type').value)?.summary ?? empty);
 $('status').textContent=`${fmt(list.length)} propuestas · ${fmt(s.records)} registros en la selección${s.invalid ? ` · ${s.invalid} registro con avance no válido (−1)` : ''}`;
 const cards=[['Personas únicas',fmt(s.people),'Sin duplicados en esta selección'],['Registros en propuestas',fmt(s.records),'Una persona puede tener varios'],['Avance medio',percent(s.mean),`Mediana: ${percent(s.median)}`],['Materias aprobadas · media',fmt(s.passed,1),'Promedio por registro']];
 $('kpis').innerHTML=cards.map(([label,value,note])=>`<article class="kpi"><div class="kpi-label">${label}</div><div class="metric">${value}</div><div class="footnote">${note}</div></article>`).join('');
 const labels=['0%','Más de 0% a menos de 25%','25% a menos de 50%','50% a menos de 75%','75% a menos de 100%','100%'];
 $('histogram').innerHTML=s.valid ? s.bins.map((n,i)=>bar(labels[i],100*n/s.valid,`${percent(100*n/s.valid)} · ${fmt(n)}`)).join('') : '<p>No hay registros con avance válido.</p>';
 $('denominator').textContent=`Base: ${fmt(s.valid)} registros con avance válido. Los tramos se calculan sobre registros, no sobre personas únicas.`;
 const comparisons = $('programme').value ? list.map(p=>({name:p.faculty,summary:p.summary})) : data.slices.filter(x=>x.faculty && (!$('faculty').value || x.faculty===$('faculty').value) && x.type===$('type').value).map(x=>({name:x.faculty,summary:x.summary}));
 $('comparison').innerHTML=comparisons.sort((a,b)=>b.summary.records-a.summary.records).slice(0,10).map(x=>bar(x.name,x.summary.mean??0,`${percent(x.summary.mean)} <span class="muted">· n=${fmt(x.summary.records)}</span>`)).join('') || '<p>No hay registros para esta combinación.</p>';
 renderTable();
}
function tableRows() { const q=$('search').value.trim().toLocaleLowerCase('es'); return selectedProgrammes().filter(p=>`${p.name} ${p.id}`.toLocaleLowerCase('es').includes(q)).sort((a,b)=>$('sort').value==='name' ? a.name.localeCompare(b.name,'es') : (b.summary[$('sort').value] ?? -1)-(a.summary[$('sort').value] ?? -1)); }
function renderTable() { const rows=tableRows(); $('table').innerHTML=rows.map(p=>`<tr><td><strong>${esc(p.name)}</strong><small>${esc(p.faculty)} · Código ${esc(p.id)}</small></td><td>${esc(p.type)}</td><td>${fmt(p.summary.records)}</td><td>${fmt(p.summary.people)}</td><td>${percent(p.summary.mean)}</td><td>${percent(p.summary.median)}</td><td>${fmt(p.summary.passed,1)}</td></tr>`).join('') || '<tr><td colspan="7">No hay propuestas para esta selección o búsqueda.</td></tr>'; $('table-count').textContent=`${fmt(rows.length)} propuestas. Los porcentajes excluyen avances no válidos.`; }
for(const id of ['faculty','type']) $(id).addEventListener('change',()=>{refreshProgrammes();render();});
$('programme').addEventListener('change',render);
$('search').addEventListener('input',renderTable); $('sort').addEventListener('change',renderTable);
$('reset').addEventListener('click',()=>{$('faculty').value='';$('type').value='';$('programme').value='';$('search').value='';$('sort').value='records';refreshProgrammes();render();});
$('download').addEventListener('click',()=>{const rows=[['propuesta','nombre','unidad','tipo','registros','personas','avance_valido_n','avance_invalido_n','avance_medio','avance_mediana','aprobadas_media'],...tableRows().map(p=>[p.id,p.name,p.faculty,p.type,p.summary.records,p.summary.people,p.summary.valid,p.summary.invalid,p.summary.mean,p.summary.median,p.summary.passed])];const csv='\uFEFF'+rows.map(r=>r.map(v=>'"'+String(v??'').replace(/"/g,'""')+'"').join(',')).join('\r\n');const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='cohorte-2020-resumen.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
refreshProgrammes();render();
