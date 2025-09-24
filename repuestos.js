// Repuestos - vista global
(function(){
  async function ensureInit(){ if(!window.SupabaseConfig?.initialize()) return false; await window.SupabaseConfig.testConnection(); return true; }
  function badge(s){ return {solicitado:'secondary', aprobado:'info', comprado:'primary', recibido:'success', instalado:'success', rechazado:'danger', cancelado:'dark'}[s]||'secondary'; }

  async function loadList(which){
    const isPending = (which==='pp');
    const body = document.getElementById(isPending? 'ppBody':'histBody');
    if (!body) return;
    body.innerHTML = '<tr><td colspan="9" class="text-muted">Cargando...</td></tr>';
    let q = supabase.from('parts_requests').select('*, vehiculos:vehiculo_id(placa)').order('created_at', { ascending:false });
    if (isPending) q = q.in('status', ['solicitado','aprobado','comprado']); else q = q.in('status', ['recibido','instalado','cancelado','rechazado']);
    const v = document.getElementById('fltVehiculo')?.value?.trim(); if (v) q = isNaN(Number(v))? q.ilike('vehiculos.placa', `%${v}%`): q.eq('vehiculo_id', Number(v));
    const prov = document.getElementById('fltProveedor')?.value?.trim(); if (prov) q = q.ilike('supplier', `%${prov}%`);
    const pr = document.getElementById('fltPrioridad')?.value; if (pr) q = q.eq('priority', pr);
    const hasta = document.getElementById('fltHasta')?.value; if (hasta) q = q.lte('needed_by', hasta);
    const { data, error } = await q;
    if (error){ body.innerHTML = '<tr><td colspan="9" class="text-danger">'+(error.message||'Error')+'</td></tr>'; return; }
    body.innerHTML = (data||[]).map(r=>{
      return `<tr data-id="${r.id}">
        <td>${r.vehiculos?.placa||r.vehiculo_id||''}</td>
        <td>${r.part_name||''}</td>
        <td>${r.supplier||''}</td>
        <td class="text-end">${Number(r.qty||1).toFixed(2)}</td>
        <td>${r.price!=null? Number(r.price).toLocaleString():''}</td>
        <td>${r.currency||''}</td>
        <td>${r.needed_by? new Date(r.needed_by).toLocaleDateString():''}</td>
        <td><span class="badge bg-${badge(r.status)}">${r.status}</span></td>
        <td class="text-center">
          <a class="btn btn-sm btn-outline-secondary" href="vehiculos.html?id=${r.vehiculo_id}"><i class="fas fa-car"></i></a>
        </td>
      </tr>`;
    }).join('') || '<tr><td colspan="9" class="text-muted">Sin repuestos.</td></tr>';
  }

  document.addEventListener('DOMContentLoaded', async ()=>{
    if (!(await ensureInit())) return;
    document.getElementById('tab-pp')?.addEventListener('shown.bs.tab', ()=> loadList('pp'));
    document.getElementById('tab-hist')?.addEventListener('shown.bs.tab', ()=> loadList('hist'));
    ['fltVehiculo','fltProveedor','fltPrioridad','fltHasta'].forEach(id=>{
      document.getElementById(id)?.addEventListener('change', ()=>{
        const active = document.querySelector('#partsTabs .nav-link.active')?.id==='tab-pp'?'pp':'hist';
        loadList(active);
      });
      document.getElementById(id)?.addEventListener('input', ()=>{
        const active = document.querySelector('#partsTabs .nav-link.active')?.id==='tab-pp'?'pp':'hist';
        loadList(active);
      });
    });
    await Promise.all([loadList('pp'), loadList('hist')]);
  });
})();


