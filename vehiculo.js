// Página de detalle de vehículo
(function() {
  const url = new URL(window.location.href);
  const idParam = url.searchParams.get('id');

  function showError(message) {
    const container = document.getElementById('infoContent');
    if (!container) return;
    container.innerHTML = `
      <div class="alert alert-danger">
        <i class="fas fa-exclamation-triangle me-2"></i>${message}
      </div>
    `;
  }

  function formatColones(valor) {
    if (valor === null || valor === undefined) return '-';
    const num = typeof valor === 'string' ? parseFloat(valor) : valor;
    if (isNaN(num)) return '-';
    return '₡' + num.toLocaleString('es-CR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
    // ---- REPUESTOS ----
    async function loadParts(status, supplier){
      const tbody = document.getElementById('partsBody');
      if (!tbody) return;
      tbody.innerHTML = '<tr><td colspan="9" class="text-muted">Cargando...</td></tr>';
      let q = supabase.from('parts_requests').select('*').eq('vehiculo_id', data.id).order('created_at', { ascending:false });
      if (status) q = q.eq('status', status);
      if (supplier) q = q.ilike('supplier', `%${supplier}%`);
      const { data: rows, error } = await q;
      if (error) { tbody.innerHTML = '<tr><td colspan="9" class="text-danger">'+(error.message||'Error')+'</td></tr>'; return; }
      const badge = s=>({solicitado:'secondary', aprobado:'info', comprado:'primary', recibido:'success', instalado:'success', rechazado:'danger', cancelado:'dark'}[s]||'secondary');
      tbody.innerHTML = (rows||[]).map(r=>{
        return `<tr data-id="${r.id}">
          <td>${r.part_name||''}</td>
          <td>${r.supplier||''}</td>
          <td class="text-end">${Number(r.qty||1).toFixed(2)}</td>
          <td>${r.unit||''}</td>
          <td class="text-end">${r.price!=null? Number(r.price).toLocaleString():''}</td>
          <td>${r.currency||''}</td>
          <td>${r.needed_by? new Date(r.needed_by).toLocaleDateString():''}</td>
          <td><span class="badge bg-${badge(r.status)}">${r.status}</span></td>
          <td class="text-center">
            <button class="btn btn-sm btn-outline-primary btn-edit-part"><i class="fas fa-pen"></i></button>
            <button class="btn btn-sm btn-outline-danger btn-del-part"><i class="fas fa-trash"></i></button>
            <div class="btn-group btn-group-sm ms-1" role="group">
              <button class="btn btn-outline-secondary btn-state" data-state="aprobado">Aprobar</button>
              <button class="btn btn-outline-secondary btn-state" data-state="comprado">Comprar</button>
              <button class="btn btn-outline-secondary btn-state" data-state="recibido">Recibir</button>
              <button class="btn btn-outline-secondary btn-state" data-state="instalado">Instalar</button>
            </div>
          </td>
        </tr>`;
      }).join('') || '<tr><td colspan="9" class="text-muted">Sin repuestos.</td></tr>';
    }

    document.getElementById('parts-tab')?.addEventListener('shown.bs.tab', ()=> loadParts(
      document.getElementById('partsStatusFilter')?.value || '',
      document.getElementById('partsSupplierFilter')?.value || ''
    ));
    document.getElementById('partsStatusFilter')?.addEventListener('change', ()=> loadParts(
      document.getElementById('partsStatusFilter').value,
      document.getElementById('partsSupplierFilter').value
    ));
    document.getElementById('partsSupplierFilter')?.addEventListener('input', ()=> loadParts(
      document.getElementById('partsStatusFilter').value,
      document.getElementById('partsSupplierFilter').value
    ));

    document.getElementById('newPartBtn')?.addEventListener('click', async ()=>{
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { alert('Sesión requerida'); return; }
      const part_name = prompt('Nombre del repuesto'); if (!part_name) return;
      const { error } = await supabase.from('parts_requests').insert({ vehiculo_id: data.id, part_name, created_by: user.id });
      if (error) { alert(error.message||'No se pudo crear'); return; }
      await loadParts(
        document.getElementById('partsStatusFilter')?.value || '',
        document.getElementById('partsSupplierFilter')?.value || ''
      );
    });

    document.addEventListener('click', async (e)=>{
      const tr = e.target.closest('tr');
      const partId = tr?.getAttribute('data-id');
      if (e.target.closest('.btn-edit-part')){
        const { data: row } = await supabase.from('parts_requests').select('*').eq('id', partId).maybeSingle();
        const name = prompt('Repuesto', row?.part_name||'');
        if (!name) return;
        const { error } = await supabase.from('parts_requests').update({ part_name: name }).eq('id', partId);
        if (error) { alert(error.message||'No se pudo guardar'); return; }
        await loadParts(document.getElementById('partsStatusFilter')?.value||'', document.getElementById('partsSupplierFilter')?.value||'');
      }
      if (e.target.closest('.btn-del-part')){
        if (!confirm('¿Eliminar repuesto?')) return;
        const { error } = await supabase.from('parts_requests').delete().eq('id', partId);
        if (error) { alert(error.message||'No se pudo eliminar'); return; }
        await loadParts(document.getElementById('partsStatusFilter')?.value||'', document.getElementById('partsSupplierFilter')?.value||'');
      }
      const stateBtn = e.target.closest('.btn-state');
      if (stateBtn){
        const newState = stateBtn.getAttribute('data-state');
        const { error } = await supabase.from('parts_requests').update({ status: newState }).eq('id', partId);
        if (error) { alert(error.message||'No se pudo cambiar estado'); return; }
        await loadParts(document.getElementById('partsStatusFilter')?.value||'', document.getElementById('partsSupplierFilter')?.value||'');
      }
    });

  function renderInfo(v) {
    const title = document.getElementById('vehiculoTitulo');
    const sub = document.getElementById('vehiculoSub');
    const content = document.getElementById('infoContent');
    if (!content) return;

    title.textContent = `Vehículo ${v.placa}`;
    sub.textContent = `${v.marcas?.nombre || '-'} ${v.modelos?.nombre || ''}`.trim();

    const propietario = v.propietarios
      ? (v.propietarios.tipo === 'juridico' ? (v.propietarios.razon_social || '-') : (v.propietarios.nombre || '-'))
      : '-';
    const combustibleFmt = v.combustible
      ? v.combustible.toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      : '-';

    content.innerHTML = `
      <div class="row g-3">
        <div class="col-md-6">
          <div class="card h-100">
            <div class="card-header">Identificación</div>
            <div class="card-body">
              <dl class="dl-grid mb-0">
                <dt class="col-sm-5">Placa</dt><dd class="col-sm-7">${v.placa || '-'}</dd>
                <dt class="col-sm-5">VIN</dt><dd class="col-sm-7">${v.vin || '-'}</dd>
                <dt class="col-sm-5">Propietario</dt><dd class="col-sm-7">${propietario}</dd>
                <dt class="col-sm-5">Estado</dt><dd class="col-sm-7"><span class="badge bg-${v.estados?.color || 'secondary'}">${v.estados?.nombre || '-'}</span></dd>
              </dl>
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="card h-100">
            <div class="card-header">Características</div>
            <div class="card-body">
              <dl class="dl-grid mb-0">
                <dt class="col-sm-5">Marca</dt><dd class="col-sm-7">${v.marcas?.nombre || '-'}</dd>
                <dt class="col-sm-5">Modelo</dt><dd class="col-sm-7">${v.modelos?.nombre || '-'}</dd>
                <dt class="col-sm-5">Año</dt><dd class="col-sm-7">${v.año || '-'}</dd>
                <dt class="col-sm-5">Carrocería</dt><dd class="col-sm-7">${v.carrocerias?.nombre || '-'}</dd>
                <dt class="col-sm-5">Cilindrada (cc)</dt><dd class="col-sm-7">${v.cilindrada || '-'}</dd>
                <dt class="col-sm-5">Cilindros</dt><dd class="col-sm-7">${v.cilindros || '-'}</dd>
                <dt class="col-sm-5">Combustible</dt><dd class="col-sm-7">${combustibleFmt}</dd>
                <dt class="col-sm-5">Transmisión</dt><dd class="col-sm-7">${v.transmision || '-'}</dd>
                <dt class="col-sm-5">Tracción</dt><dd class="col-sm-7">${v.traccion || '-'}</dd>
                <dt class="col-sm-5">Color</dt><dd class="col-sm-7">${v.color || '-'}</dd>
              </dl>
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="card h-100">
            <div class="card-header">Económicos</div>
            <div class="card-body">
              <dl class="dl-grid mb-0">
                <dt class="col-sm-6">Leasing semanal</dt><dd class="col-sm-6">${formatColones(v.leasing_semanal)}</dd>
                <dt class="col-sm-6">Plazo contractual (semanas)</dt><dd class="col-sm-6">${(v.plazo_contrato_semanas ?? '-')}
                </dd>
                <dt class="col-sm-6">Gastos de formalización</dt><dd class="col-sm-6">${formatColones(v.gastos_formalizacion)}</dd>
                <dt class="col-sm-6">Valor de adquisición</dt><dd class="col-sm-6">${formatColones(v.valor_adquisicion)}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function openEditLog(entry) {
    const modalEl = document.getElementById('logModal');
    const modal = new bootstrap.Modal(modalEl);
    document.getElementById('logId').value = entry.id;
    document.getElementById('logTipo').value = entry.tipo;
    document.getElementById('logComentario').value = entry.comentario;
    document.getElementById('logImportante').checked = !!entry.importante;
    document.getElementById('deleteLogBtn').classList.remove('d-none');
    modal.show();
  }

  function renderLog(items) {
    const list = document.getElementById('logList');
    if (!list) return;
    if (!items || items.length === 0) {
      list.innerHTML = '<div class="alert alert-light border">Sin comentarios aún.</div>';
      return;
    }
    list.innerHTML = items.map(entry => {
      const badgeClass = entry.tipo === 'mantenimiento' ? 'bg-success-subtle text-success border-success' :
                        entry.tipo === 'incidencia' ? 'bg-danger-subtle text-danger border-danger' :
                        entry.tipo === 'ubicacion' ? 'bg-info-subtle text-info border-info' :
                        entry.tipo === 'reparacion' ? 'bg-warning-subtle text-warning border-warning' :
                        'bg-secondary-subtle text-secondary border-secondary';
      const icon = entry.importante ? '<i class="fas fa-exclamation-triangle text-warning"></i>' : '';
      const fecha = new Date(entry.created_at).toLocaleString();
      return `
        <div class="vlog-item">
          <div class="vlog-header ${badgeClass}">
            <span class="vlog-badge">${entry.tipo?.toUpperCase() || 'GENERAL'}</span>
            <small class="text-muted">Por: ${entry.autor || 'Usuario'} - ${fecha}</small>
            <span class="d-flex gap-2 align-items-center">
              ${icon}
              <button class="btn btn-sm btn-outline-dark" data-action="edit" data-id="${entry.id}"><i class="fas fa-pen"></i></button>
            </span>
          </div>
          <div class="vlog-body">${(entry.comentario || '').replace(/\n/g,'<br>')}</div>
        </div>
      `;
    }).join('');

    // attach edit handlers
    list.querySelectorAll('button[data-action="edit"]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = btn.getAttribute('data-id');
        const { data } = await supabase.from('vehiculo_bitacora').select('*').eq('id', id).maybeSingle();
        if (data) openEditLog(data);
      });
    });
  }

  async function loadAssignedUsers(vehicleId) {
    const tbody = document.getElementById('assignedUsersBody');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="6" class="text-muted">Cargando...</td></tr>';
    const { data, error } = await supabase
      .from('vehiculo_usuarios')
      .select('id, assigned_at, active, profiles:profiles!vehiculo_usuarios_user_id_fkey(id,email,display_name,role,active)')
      .eq('vehiculo_id', vehicleId)
      .order('assigned_at', { ascending: false });
    if (error) { tbody.innerHTML = '<tr><td colspan="6" class="text-danger">'+(error.message||'Error')+'</td></tr>'; return; }
    const rows = (data||[]).map(r => {
      const p = r.profiles || {};
      const assigned = new Date(r.assigned_at).toLocaleString();
      return `
        <tr data-row-id="${r.id}" data-user-id="${p.id||''}">
          <td>${p.email||''}</td>
          <td>${p.display_name||''}</td>
          <td>${p.role||''}</td>
          <td>${p.active ? '<span class="badge bg-success">Sí</span>' : '<span class="badge bg-secondary">No</span>'}</td>
          <td>${assigned}</td>
          <td class="text-center">
            <button class="btn btn-sm btn-outline-danger" data-action="unassign"><i class="fas fa-user-minus me-1"></i>Quitar</button>
          </td>
        </tr>
      `;
    }).join('');
    tbody.innerHTML = rows || '<tr><td colspan="6" class="text-muted">Sin usuarios asignados.</td></tr>';

    // Wire unassign buttons
    tbody.querySelectorAll('button[data-action="unassign"]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const tr = btn.closest('tr');
        const rowId = tr?.getAttribute('data-row-id');
        if (!rowId) return;
        if (!confirm('¿Quitar asignación?')) return;
        const { error } = await supabase.from('vehiculo_usuarios').delete().eq('id', rowId);
        if (error) { alert(error.message||'No se pudo quitar'); return; }
        await loadAssignedUsers(vehicleId);
      });
    });
  }

  async function populateAssignableUsers(vehicleId) {
    const select = document.getElementById('assignUserSelect');
    if (!select) return;
    // Traer usuarios activos
    const { data, error } = await supabase
      .from('profiles')
      .select('id,email,display_name,active')
      .eq('active', true)
      .order('email', { ascending: true });
    if (error) { select.innerHTML = '<option>Error cargando usuarios</option>'; return; }
    select.innerHTML = '<option value="">Seleccionar usuario...</option>' +
      (data||[]).map(p => `<option value="${p.id}">${p.email}${p.display_name?(' — '+p.display_name):''}</option>`).join('');
  }

  function attachLogModal(vehicle) {
    const form = document.getElementById('logForm');
    if (!form) return;
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('logId').value;
      const tipo = document.getElementById('logTipo').value;
      const comentario = document.getElementById('logComentario').value;
      const importante = document.getElementById('logImportante').checked;
      if (!comentario || comentario.trim() === '') return;
      let error = null;
      if (id) {
        const { error: upErr } = await supabase.from('vehiculo_bitacora')
          .update({ tipo: (tipo || 'general').toLowerCase(), comentario, importante })
          .eq('id', id);
        error = upErr;
      } else {
        const payload = {
          vehiculo_id: vehicle.id,
          tipo: (tipo || 'general').toLowerCase(),
          comentario,
          importante,
          autor: 'Sistema'
        };
        const { error: insErr } = await supabase.from('vehiculo_bitacora').insert([payload]);
        error = insErr;
      }
      if (error) { alert('No se pudo guardar el comentario'); return; }
      const modalEl = document.getElementById('logModal');
      const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
      modal.hide();
      form.reset();
      document.getElementById('logId').value = '';
      document.getElementById('deleteLogBtn').classList.add('d-none');
      await loadLog(vehicle.id);
    });

    const deleteBtn = document.getElementById('deleteLogBtn');
    deleteBtn.addEventListener('click', async () => {
      const id = document.getElementById('logId').value;
      if (!id) return;
      if (!confirm('¿Eliminar este comentario?')) return;
      const { error } = await supabase.from('vehiculo_bitacora').delete().eq('id', id);
      if (error) { alert('No se pudo eliminar'); return; }
      const modalEl = document.getElementById('logModal');
      const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
      modal.hide();
      form.reset();
      document.getElementById('logId').value = '';
      document.getElementById('deleteLogBtn').classList.add('d-none');
      await loadLog(vehicle.id);
    });
  }

  async function loadLog(vehicleId) {
    const { data, error } = await supabase
      .from('vehiculo_bitacora')
      .select('*')
      .eq('vehiculo_id', vehicleId)
      .order('created_at', { ascending: false });
    if (error) { renderLog([]); return; }
    renderLog(data || []);
  }

  async function main() {
    if (!idParam) {
      showError('Falta el parámetro id en la URL');
      return;
    }
    if (!window.SupabaseConfig || !window.SupabaseConfig.initialize()) {
      showError('Configuración de Supabase requerida');
      return;
    }
    await window.SupabaseConfig.testConnection();

    const { data, error } = await supabase
      .from('vehiculos')
      .select(`
        *,
        marcas (id, nombre),
        modelos (id, nombre),
        carrocerias (id, nombre, descripcion),
        estados (id, nombre, color, activo),
        propietarios:propietarios!fk_vehiculos_propietario (
          id, tipo, nombre, razon_social, identificacion, identificacion_juridica,
          apoderado_nombre, apoderado_identificacion, activo
        )
      `)
      .eq('id', idParam)
      .maybeSingle();

    if (error || !data) {
      showError('No se pudo cargar el vehículo');
      return;
    }
    renderInfo(data);
    const tasksBtn = document.getElementById('vehTasksBtn');
    if (tasksBtn) {
      tasksBtn.href = 'tareas.html?vehiculo_id=' + encodeURIComponent(data.id);
    }
    attachLogModal(data);
    await loadLog(data.id);

    // Usuarios asignados UI
    await populateAssignableUsers(data.id);
    await loadAssignedUsers(data.id);
    const assignBtn = document.getElementById('assignUserBtn');
    if (assignBtn) {
      assignBtn.addEventListener('click', async () => {
        const userId = document.getElementById('assignUserSelect').value;
        if (!userId) return;
        const { error } = await supabase.from('vehiculo_usuarios').insert([{ vehiculo_id: data.id, user_id: userId }]);
        if (error) { alert(error.message||'No se pudo asignar'); return; }
        document.getElementById('assignUserSelect').value = '';
        await loadAssignedUsers(data.id);
      });
    }

    // --- TAREAS TAB ---
    const tasksNotice = (html, type='info') => {
      const el = document.getElementById('vehTasksNotice');
      if (!el) return;
      if (!html) { el.innerHTML=''; return; }
      const cls = type==='danger'?'alert-danger':type==='warning'?'alert-warning':'alert-info';
      el.innerHTML = '<div class="alert '+cls+' p-2 mb-2">'+html+'</div>';
    };

    function parseEmails(str){ return (str||'').split(',').map(s=>s.trim().toLowerCase()).filter(Boolean); }

  async function openTaskView(taskId){
    const { data: t, error } = await supabase
      .from('tasks')
      .select('id,title,status,priority,due_date, task_assignees(profiles:profile_id(email,display_name))')
      .eq('id', taskId).maybeSingle();
    if (error||!t) { alert(error?.message||'No se pudo cargar'); return; }
    document.getElementById('vtTitle').textContent = t.title||'Tarea';
    const sBadge = document.getElementById('vtStatusBadge'); sBadge.className='badge bg-'+(t.status==='terminada'?'success':'warning'); sBadge.textContent = t.status;
    const pBadge = document.getElementById('vtPriorityBadge'); pBadge.className='badge bg-'+(t.priority==='critica'?'danger':t.priority==='alta'?'warning':t.priority==='media'?'info':'secondary'); pBadge.textContent = t.priority;
    document.getElementById('vtDue').textContent = t.due_date ? new Date(t.due_date).toLocaleDateString() : '';
    const names = (t.task_assignees||[]).map(a=>a.profiles?.display_name||a.profiles?.email).filter(Boolean);
    document.getElementById('vtAssignees').innerHTML = names.length? names.map(n=>`<span class="badge bg-secondary me-1">${n}</span>`).join('') : '<span class="badge bg-light text-muted">Sin asignados</span>';

    // cargar comentarios
    const list = document.getElementById('vtCommentsList');
    list.innerHTML = '<div class="text-muted">Cargando...</div>';
    const { data: comments } = await supabase
      .from('task_comments')
      .select('id, body, created_at, author:author_id(email,display_name)')
      .eq('task_id', taskId)
      .order('created_at', { ascending: true });
    list.innerHTML = (comments||[]).map(c=>{
      const who = c.author?.display_name || c.author?.email || 'Usuario';
      const ts = new Date(c.created_at).toLocaleString();
      return `<div class="border rounded p-2"><div class="small text-muted mb-1">${who} — ${ts}</div><div>${(c.body||'').replace(/\n/g,'<br>')}</div></div>`;
    }).join('') || '<div class="text-muted">Aún no hay comentarios.</div>';

    // acciones
    document.getElementById('vtMarkDone').onclick = async ()=>{ await supabase.from('tasks').update({ status: 'terminada' }).eq('id', taskId); await Promise.all([vehLoadTasks('pendiente'), vehLoadTasks('terminada'), openTaskView(taskId)]); };
    document.getElementById('vtReopen').onclick = async ()=>{ await supabase.from('tasks').update({ status: 'pendiente' }).eq('id', taskId); await Promise.all([vehLoadTasks('pendiente'), vehLoadTasks('terminada'), openTaskView(taskId)]); };
    const form = document.getElementById('vtCommentForm');
    form.onsubmit = async (e)=>{
      e.preventDefault();
      const body = document.getElementById('vtCommentBody').value.trim(); if (!body) return;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { alert('Sesión requerida'); return; }
      const { error: insErr } = await supabase.from('task_comments').insert({ task_id: taskId, author_id: user.id, body });
      if (insErr) { alert(insErr.message||'No se pudo comentar'); return; }
      document.getElementById('vtCommentBody').value='';
      await openTaskView(taskId);
    };

    new bootstrap.Modal(document.getElementById('vehTaskViewModal')).show();
  }

    async function vehLoadTasks(status){
      const isPending = (status||'pendiente') === 'pendiente';
      const tbody = document.getElementById(isPending ? 'vehTasksPendingBody' : 'vehTasksDoneBody');
      if (!tbody) return;
      tbody.innerHTML = '<tr><td colspan="6" class="text-muted">Cargando...</td></tr>';
      // Traer directamente tasks con join a perfiles asignados; fallback si falla
      let { data: rows, error } = await supabase
        .from('tasks')
        .select('id,title,status,priority,due_date, task_assignees(profiles:profile_id(email,display_name))')
        .eq('vehiculo_id', data.id)
        .eq('status', isPending ? 'pendiente' : 'terminada')
        .order('created_at', { ascending:false });
      if (error) {
        const msg = error.message||'';
        const { data: tdata, error: tErr } = await supabase
          .from('tasks')
          .select('id,title,status,priority,due_date')
          .eq('vehiculo_id', data.id)
          .eq('status', isPending ? 'pendiente' : 'terminada')
          .order('created_at', { ascending:false });
        if (tErr) {
          const msg2 = tErr.message||'';
          if (/public.*tasks.*schema cache|relation .* does not exist/i.test(msg2)) {
            tasksNotice('Falta cargar el schema de tareas. Ejecuta 15_tasks_setup.sql y luego: NOTIFY pgrst, \"reload schema\";', 'warning');
          }
          tbody.innerHTML = '<tr><td colspan="5" class="text-danger">'+(msg2||'Error')+'</td></tr>'; return; }
        const ids = (tdata||[]).map(t=>t.id);
        const mapNames = new Map();
        if (ids.length){
          const { data: asg } = await supabase.from('task_assignees').select('task_id, profiles:profile_id(email,display_name)').in('task_id', ids);
          (asg||[]).forEach(a=>{
            const label = a.profiles?.display_name || a.profiles?.email || '';
            mapNames.set(a.task_id, [...(mapNames.get(a.task_id)||[]), label]);
          });
        }
        rows = (tdata||[]).map(t=>({ ...t, __assigneeNames: mapNames.get(t.id)||[] }));
      }
      tbody.innerHTML = (rows||[]).map(t=>{
        const badge = t.status==='terminada'?'success':t.status==='pendiente'?'warning':'secondary';
        const pr = t.priority==='critica'?'danger':t.priority==='alta'?'warning':t.priority==='media'?'info':'secondary';
        const due = t.due_date ? new Date(t.due_date).toLocaleDateString() : '';
      const names = Array.isArray(t.task_assignees)
        ? (t.task_assignees||[]).map(a=>a.profiles?.display_name || a.profiles?.email).filter(Boolean)
        : (t.__assigneeNames||[]);
        const ass = names.length;
        return `<tr data-id="${t.id}">
          <td>${t.title||''}</td>
          <td>${ass ? names.map(n=>`<span class=\"badge bg-secondary me-1\">${n}</span>`).join('') : '<span class="badge bg-light text-muted">Sin asignados</span>'}</td>
          <td><span class="badge bg-${badge}">${t.status}</span></td>
          <td><span class="badge bg-${pr}">${t.priority}</span></td>
          <td>${due}</td>
          <td class="text-center">
            <button class="btn btn-sm btn-outline-primary btn-edit-task"><i class="fas fa-pen"></i></button>
            <button class="btn btn-sm btn-outline-danger btn-del-task"><i class="fas fa-trash"></i></button>
            ${isPending ? '<button class="btn btn-sm btn-success btn-mark-done-task"><i class="fas fa-check"></i></button>' : '<button class="btn btn-sm btn-warning btn-reopen-task"><i class="fas fa-rotate-left"></i></button>'}
            <button class="btn btn-sm btn-outline-secondary btn-view-task"><i class="fas fa-eye"></i></button>
          </td>
        </tr>`;
      }).join('') || '<tr><td colspan="6" class="text-muted">Sin tareas.</td></tr>';
    }

    document.getElementById('vehNewTaskBtn')?.addEventListener('click', ()=>{
      const m = new bootstrap.Modal(document.getElementById('vehTaskModal'));
      document.getElementById('vehTaskForm').reset();
      document.getElementById('vehTaskId').value = '';
      const form = document.getElementById('vehTaskForm');
      if (form) { form.dataset.originalAssignees = '[]'; form.dataset.originalTask = '{}'; form.dataset.assigneesTouched = 'false'; }
      m.show();
    });
    // cargar usuarios al abrir modal
    async function loadVehAssignableUsers(){
      const select = document.getElementById('vehTaskAssignees');
      if (!select) return;
      const { data, error } = await supabase.from('profiles').select('id,email,display_name,active').eq('active', true).order('email', { ascending: true });
      if (error) { select.innerHTML = '<option>Error</option>'; return; }
      select.innerHTML = (data||[]).map(u=>`<option value="${u.id}">${u.email}${u.display_name?(' — '+u.display_name):''}</option>`).join('');
    }
    document.getElementById('vehTaskModal')?.addEventListener('show.bs.modal', loadVehAssignableUsers);
    document.getElementById('vehTaskForm')?.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const existingId = document.getElementById('vehTaskId').value;
      const title = document.getElementById('vehTaskTitle').value.trim();
      const description = document.getElementById('vehTaskDesc').value.trim();
      const status = document.getElementById('vehTaskStatus').value;
      const priority = document.getElementById('vehTaskPriority').value;
      const due = document.getElementById('vehTaskDue').value || null;
      const sel = Array.from(document.getElementById('vehTaskAssignees')?.selectedOptions||[]).map(o=>o.value);
      if (!title) return;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { alert('Sesión requerida'); return; }
      const form = document.getElementById('vehTaskForm');
      const origAssignees = JSON.parse(form?.dataset?.originalAssignees || '[]');
      const origTask = JSON.parse(form?.dataset?.originalTask || '{}');
      const assigneesTouched = (form?.dataset?.assigneesTouched === 'true');
      const payload = { title, description, status, priority, due_date: due };
      if (existingId) {
        const taskChanged = (
          (origTask.title||'') !== payload.title ||
          (origTask.description||'') !== payload.description ||
          (origTask.status||'') !== payload.status ||
          (origTask.priority||'') !== payload.priority ||
          (origTask.due_date||null) !== payload.due_date
        );
        // Solo recalcular deltas si el usuario tocó el selector
        const toAdd = assigneesTouched ? sel.filter(id => !origAssignees.includes(id)) : [];
        const toRemove = assigneesTouched ? origAssignees.filter(id => !sel.includes(id)) : [];
        if (!taskChanged && toAdd.length === 0 && toRemove.length === 0) {
          bootstrap.Modal.getInstance(document.getElementById('vehTaskModal'))?.hide();
          document.getElementById('vehTaskForm').reset();
          return;
        }
        if (taskChanged) {
          const { error: upErr } = await supabase.from('tasks').update(payload).eq('id', existingId);
          if (upErr) { alert(upErr.message||'No se pudo actualizar'); return; }
        }
        if (toRemove.length) {
          const { error: delErr } = await supabase.from('task_assignees').delete().eq('task_id', existingId).in('profile_id', toRemove);
          if (delErr) { alert(delErr.message||'No se pudo actualizar asignados'); return; }
        }
        if (toAdd.length) {
          const rows = toAdd.map(pid=>({ task_id: existingId, profile_id: pid }));
          const { error: insErr } = await supabase.from('task_assignees').upsert(rows);
          if (insErr) { alert(insErr.message||'No se pudo actualizar asignados'); return; }
        }
      } else {
        const { data: ins, error: insErr } = await supabase.from('tasks').insert({ vehiculo_id: data.id, ...payload, created_by: user.id }).select('id').single();
        if (insErr) { alert(insErr.message||'No se pudo crear'); return; }
        if (sel.length){
          const rows = sel.map(pid=>({ task_id: ins.id, profile_id: pid }));
          await supabase.from('task_assignees').upsert(rows);
        }
      }
      bootstrap.Modal.getInstance(document.getElementById('vehTaskModal'))?.hide();
      document.getElementById('vehTaskForm').reset();
      await Promise.all([vehLoadTasks('pendiente'), vehLoadTasks('terminada')]);
    });

    // editar/eliminar
    document.addEventListener('click', async (e)=>{
      const editBtn = e.target.closest('.btn-edit-task');
      const delBtn = e.target.closest('.btn-del-task');
      const doneBtn = e.target.closest('.btn-mark-done-task');
      const reopenBtn = e.target.closest('.btn-reopen-task');
      const eyeBtn = e.target.closest('.btn-view-task');
      if (!editBtn && !delBtn && !doneBtn && !reopenBtn && !eyeBtn) return;
      const tr = (editBtn||delBtn||doneBtn||reopenBtn||eyeBtn).closest('tr');
      const taskId = tr?.getAttribute('data-id');
      if (!taskId) return;
      if (eyeBtn) { await openTaskView(taskId); return; }
      if (doneBtn) {
        const { error } = await supabase.from('tasks').update({ status: 'terminada' }).eq('id', taskId);
        if (error) { alert(error.message||'No se pudo marcar'); return; }
        await Promise.all([vehLoadTasks('pendiente'), vehLoadTasks('terminada')]);
        return;
      }
      if (reopenBtn) {
        const { error } = await supabase.from('tasks').update({ status: 'pendiente' }).eq('id', taskId);
        if (error) { alert(error.message||'No se pudo reabrir'); return; }
        await Promise.all([vehLoadTasks('pendiente'), vehLoadTasks('terminada')]);
        return;
      }
      if (delBtn) {
        if (!confirm('¿Eliminar tarea?')) return;
        const { error } = await supabase.from('tasks').delete().eq('id', taskId);
        if (error) { alert(error.message||'No se pudo eliminar'); return; }
        await Promise.all([vehLoadTasks('pendiente'), vehLoadTasks('terminada')]);
        return;
      }
      if (editBtn) {
        const { data: t, error } = await supabase.from('tasks').select('*').eq('id', taskId).maybeSingle();
        if (error||!t) { alert(error?.message||'No se pudo cargar'); return; }
        document.getElementById('vehTaskId').value = t.id;
        document.getElementById('vehTaskTitle').value = t.title||'';
        document.getElementById('vehTaskDesc').value = t.description||'';
        document.getElementById('vehTaskStatus').value = t.status||'pendiente';
        document.getElementById('vehTaskPriority').value = t.priority||'media';
        document.getElementById('vehTaskDue').value = t.due_date||'';
        await loadVehAssignableUsers();
        const { data: asg } = await supabase.from('task_assignees').select('profile_id').eq('task_id', taskId);
        const select = document.getElementById('vehTaskAssignees');
        const ids = (asg||[]).map(a=>a.profile_id);
        Array.from(select.options).forEach(o=>{ o.selected = ids.includes(o.value); });
        const m = new bootstrap.Modal(document.getElementById('vehTaskModal'));
        m.show();
        // Guardar snapshot para delta
        const form = document.getElementById('vehTaskForm');
        form.dataset.originalAssignees = JSON.stringify(ids);
        form.dataset.originalTask = JSON.stringify({ title: t.title||'', description: t.description||'', status: t.status||'pendiente', priority: t.priority||'media', due_date: t.due_date||null });
        form.dataset.assigneesTouched = 'false';
        // Marcar cuando el usuario cambie selección
        document.getElementById('vehTaskAssignees')?.addEventListener('change', () => {
          form.dataset.assigneesTouched = 'true';
        }, { once: false });
        // Ya no reemplazamos el submit; el handler general detecta si hay id para actualizar
      }
    });

    // cargar tareas al abrir la pestaña + tabs internas
    document.getElementById('tasks-tab')?.addEventListener('shown.bs.tab', ()=>{
      vehLoadTasks('pendiente');
      vehLoadTasks('terminada');
    });
    document.getElementById('veh-tab-pending')?.addEventListener('shown.bs.tab', ()=>vehLoadTasks('pendiente'));
    document.getElementById('veh-tab-done')?.addEventListener('shown.bs.tab', ()=>vehLoadTasks('terminada'));
  }

  main();
})();


