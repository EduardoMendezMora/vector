// Página de detalle de repuesto con comentarios/adjuntos
(function(){
  async function ensureInit(){ if(!window.SupabaseConfig?.initialize()) return false; await window.SupabaseConfig.testConnection(); return true; }
  const badge = s=> s==='terminado'?'success':'warning';
  function qs(id){ return document.getElementById(id); }

  async function loadPart(partId){
    const { data, error } = await supabase
      .from('parts_requests')
      .select('id,vehiculo_id,part_name,manufacturer_sku,sides,status, vehiculos:vehiculo_id(placa)')
      .eq('id', partId).maybeSingle();
    if (error||!data) throw error||new Error('No encontrado');
    qs('rpTitle').textContent = data.part_name||'Repuesto';
    const s = Array.isArray(data.sides)? data.sides.join(', ') : '';
    qs('rpSku').textContent = data.manufacturer_sku||'';
    qs('rpSides').textContent = s||'';
    const b = qs('rpStatus'); b.className='badge bg-'+badge(data.status); b.textContent = data.status;
    const a = qs('rpVehLink'); a.textContent = data.vehiculos?.placa||data.vehiculo_id; a.href = 'vehiculos.html?id='+data.vehiculo_id;
    return data;
  }

  function renderEntries(list){
    const c = qs('rpEntries');
    c.innerHTML = (list||[]).map(e=>{
      const who = e.author?.display_name || e.author?.email || 'Usuario';
      const when = new Date(e.created_at).toLocaleString();
      if (e.entry_type==='text'){
        return `<div class="border rounded p-2"><div class="small text-muted mb-1">${who} — ${when}</div><div>${(e.content||'').replace(/\n/g,'<br>')}</div></div>`;
      }
      const icon = e.entry_type==='image'? 'fa-image' : e.entry_type==='video'? 'fa-video' : e.entry_type==='audio'? 'fa-microphone' : 'fa-paperclip';
      return `<div class="border rounded p-2"><div class="small text-muted mb-1">${who} — ${when}</div><a href="${e.url}" target="_blank" class="btn btn-sm btn-outline-secondary"><i class="fas ${icon} me-1"></i>Abrir adjunto</a></div>`;
    }).join('') || '<div class="text-muted">Sin entradas aún.</div>';
  }

  async function loadEntries(partId){
    const { data, error } = await supabase
      .from('part_entries')
      .select('id,entry_type,content,url,created_at, author:author_id(email,display_name)')
      .eq('part_id', partId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    renderEntries(data||[]);
  }

  async function addEntries(partId){
    const { data: { user } } = await supabase.auth.getUser(); if (!user) throw new Error('Sesión requerida');
    const text = qs('rpText').value.trim();
    const files = qs('rpFiles').files;
    if (!text && (!files || files.length===0)) return; // nada que hacer
    if (text){ await supabase.from('part_entries').insert({ part_id: partId, author_id: user.id, entry_type: 'text', content: text }); }
    if (files && files.length){
      const now = Date.now();
      for (let i=0;i<files.length;i++){
        const f = files[i];
        const path = `parts/${partId}/${now}-${encodeURIComponent(f.name)}`;
        try {
          const up = await supabase.storage.from('parts').upload(path, f, { upsert:false });
          if (!up.error){
            const { data: pub } = supabase.storage.from('parts').getPublicUrl(path);
            const mime = (f.type||'').toLowerCase();
            const type = mime.startsWith('image')?'image': mime.startsWith('video')?'video': mime.startsWith('audio')?'audio':'file';
            await supabase.from('part_entries').insert({ part_id: partId, author_id: user.id, entry_type: type, url: pub.publicUrl });
          }
        } catch(_){}
      }
    }
    qs('rpText').value=''; qs('rpFiles').value='';
  }

  async function setStatus(partId, status){
    const { error } = await supabase.from('parts_requests').update({ status }).eq('id', partId);
    if (error) throw error;
  }

  document.addEventListener('DOMContentLoaded', async ()=>{
    if (!(await ensureInit())) return;
    const url = new URL(location.href); const partId = url.searchParams.get('part_id');
    if (!partId) { location.replace('repuestos.html'); return; }
    try {
      await loadPart(partId); await loadEntries(partId);
    } catch(e){ alert(e.message||'Error'); return; }
    qs('rpEntryForm')?.addEventListener('submit', async (e)=>{
      e.preventDefault();
      try { await addEntries(partId); await loadEntries(partId); } catch(err){ alert(err.message||'No se pudo agregar'); }
    });
    qs('rpMarkDone')?.addEventListener('click', async ()=>{ try{ await setStatus(partId,'terminado'); await loadPart(partId);}catch(e){ alert(e.message||'Error'); }});
    qs('rpReopen')?.addEventListener('click', async ()=>{ try{ await setStatus(partId,'pendiente'); await loadPart(partId);}catch(e){ alert(e.message||'Error'); }});
  });
})();


