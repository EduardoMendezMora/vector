// Detalle de Tarea con comentarios
(function(){
  function setNotice(html, type='info'){/* optional */}

  async function ensureInit(){
    if (!window.SupabaseConfig?.initialize()) return false;
    await window.SupabaseConfig.testConnection();
    return true;
  }

  function badgeClsStatus(s){ return s==='terminada'?'success':'warning'; }
  function badgeClsPriority(p){ return p==='critica'?'danger':p==='alta'?'warning':p==='media'?'info':'secondary'; }

  function qs(id){ return document.getElementById(id); }

  async function loadTask(taskId){
    const { data: t, error } = await supabase
      .from('tasks')
      .select('id,title,vehiculo_id,status,priority,due_date, task_assignees(profiles:profile_id(email,display_name)), vehiculos:vehiculo_id(placa)')
      .eq('id', taskId).maybeSingle();
    if (error||!t) throw error||new Error('No encontrada');
    qs('taskTitleHdr').textContent = t.title;
    qs('taskVehicle').innerHTML = t.vehiculos?.placa ? `Vehículo <a href="vehiculos.html?id=${t.vehiculo_id}">${t.vehiculos.placa}</a>` : `Vehículo ID ${t.vehiculo_id||''}`;
    const sBadge = qs('taskStatusBadge'); sBadge.className='badge bg-'+badgeClsStatus(t.status); sBadge.textContent=t.status;
    const pBadge = qs('taskPriorityBadge'); pBadge.className='badge bg-'+badgeClsPriority(t.priority); pBadge.textContent=t.priority;
    qs('taskDue').textContent = t.due_date? new Date(t.due_date).toLocaleDateString():'';
    const names = (t.task_assignees||[]).map(a=>a.profiles?.display_name||a.profiles?.email).filter(Boolean);
    qs('taskAssigneesChips').innerHTML = names.length? names.map(n=>`<span class="badge bg-secondary me-1">${n}</span>`).join('') : '<span class="badge bg-light text-muted">Sin asignados</span>';
    return t;
  }

  async function loadComments(taskId){
    const list = qs('commentsList');
    list.innerHTML = '<div class="text-muted">Cargando comentarios...</div>';
    const { data, error } = await supabase
      .from('task_comments')
      .select('id, body, created_at, author:author_id(email,display_name)')
      .eq('task_id', taskId)
      .order('created_at', { ascending: true });
    if (error) { list.innerHTML = '<div class="text-danger">'+(error.message||'Error')+'</div>'; return; }
    list.innerHTML = (data||[]).map(c=>{
      const who = c.author?.display_name || c.author?.email || 'Usuario';
      const ts = new Date(c.created_at).toLocaleString();
      return `<div class="border rounded p-2"><div class="small text-muted mb-1">${who} — ${ts}</div><div>${(c.body||'').replace(/\n/g,'<br>')}</div></div>`;
    }).join('') || '<div class="text-muted">Aún no hay comentarios.</div>';
  }

  async function addComment(taskId, body){
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Sesión requerida');
    const { error } = await supabase.from('task_comments').insert({ task_id: taskId, author_id: user.id, body });
    if (error) throw error;
  }

  async function updateStatus(taskId, status){
    const { error } = await supabase.from('tasks').update({ status }).eq('id', taskId);
    if (error) throw error;
  }

  document.addEventListener('DOMContentLoaded', async ()=>{
    if (!(await ensureInit())) return;
    const url = new URL(location.href); const taskId = url.searchParams.get('task_id');
    if (!taskId) { location.replace('tareas.html'); return; }
    try { await loadTask(taskId); await loadComments(taskId); } catch(e){ alert(e.message||'Error'); return; }
    qs('commentForm')?.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const body = qs('commentBody').value.trim(); if (!body) return;
      try{ await addComment(taskId, body); qs('commentBody').value=''; await loadComments(taskId);}catch(err){ alert(err.message||'No se pudo comentar'); }
    });
    qs('btnMarkDone')?.addEventListener('click', async ()=>{ try{ await updateStatus(taskId,'terminada'); await loadTask(taskId);}catch(e){ alert(e.message||'Error'); }});
    qs('btnReopen')?.addEventListener('click', async ()=>{ try{ await updateStatus(taskId,'pendiente'); await loadTask(taskId);}catch(e){ alert(e.message||'Error'); }});
  });
})();


