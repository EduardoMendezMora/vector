// Repuestos - vista global
(function(){
  async function ensureInit(){ if(!window.SupabaseConfig?.initialize()) return false; await window.SupabaseConfig.testConnection(); return true; }
  function badge(s){ return {solicitado:'secondary', aprobado:'info', comprado:'primary', recibido:'success', instalado:'success', rechazado:'danger', cancelado:'dark'}[s]||'secondary'; }

  async function loadList(which){
    const isPending = (which==='pp');
    const body = document.getElementById(isPending? 'ppBody':'histBody');
    if (!body) return;
    body.innerHTML = '<tr><td colspan="9" class="text-muted">Cargando...</td></tr>';
    let q = supabase.from('parts_requests').select('id, vehiculo_id, part_name, manufacturer_sku, sides, status, vehiculos:vehiculo_id(placa)').order('created_at', { ascending:false });
    if (isPending) q = q.eq('status','pendiente'); else q = q.eq('status','terminado');
    const v = document.getElementById('fltVehiculo')?.value?.trim(); if (v) q = isNaN(Number(v))? q.ilike('vehiculos.placa', `%${v}%`): q.eq('vehiculo_id', Number(v));
    const prov = document.getElementById('fltProveedor')?.value?.trim(); if (prov) q = q.ilike('part_name', `%${prov}%`);
    const pr = document.getElementById('fltPrioridad')?.value; if (pr) q = q.eq('priority', pr); // backward compat if exists
    const hasta = document.getElementById('fltHasta')?.value; if (hasta) q = q.lte('needed_by', hasta);
    const { data, error } = await q;
    if (error){ body.innerHTML = '<tr><td colspan="9" class="text-danger">'+(error.message||'Error')+'</td></tr>'; return; }
    body.innerHTML = (data||[]).map(r=>{
      return `<tr data-id="${r.id}">
        <td>${r.vehiculos?.placa||r.vehiculo_id||''}</td>
        <td>${r.part_name||''}</td>
        <td>${r.manufacturer_sku||''}</td>
        <td>${Array.isArray(r.sides)? r.sides.join(', '): ''}</td>
        <td><span class="badge bg-${badge(r.status)}">${r.status}</span></td>
        <td class="text-center">
          <a class="btn btn-sm btn-outline-secondary" href="repuesto.html?part_id=${r.id}"><i class="fas fa-eye"></i></a>
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


