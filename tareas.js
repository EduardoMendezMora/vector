// Tareas - listar, crear y asignar múltiples responsables
(function() {
  function setNotice(html, type = 'warning') {
    const box = document.getElementById('tasksNotice');
    if (!box) return;
    if (!html) { box.innerHTML = ''; return; }
    const cls = type === 'danger' ? 'alert-danger' : type === 'info' ? 'alert-info' : 'alert-warning';
    box.innerHTML = '<div class="alert '+cls+' p-2 mb-3">'+ html +'</div>';
  }

  async function ensureInit() {
    if (!window.SupabaseConfig?.initialize()) {
      setNotice('Supabase no inicializado', 'danger');
      return false;
    }
    await window.SupabaseConfig.testConnection();
    return true;
  }

  let cachedUsers = [];
  async function loadAssignableUsers() {
    const select = document.getElementById('taskAssignees');
    if (!select) return;
    const { data, error } = await supabase.from('profiles').select('id,email,display_name,active').eq('active', true).order('email', { ascending: true });
    if (error) { select.innerHTML = '<option>Error cargando usuarios</option>'; return; }
    cachedUsers = data||[];
    select.innerHTML = (cachedUsers).map(u => `<option value="${u.id}">${u.email}${u.display_name?(' — '+u.display_name):''}</option>`).join('');
  }

  async function loadTasks() {
    const tbody = document.getElementById('tasksTableBody');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">Cargando...</td></tr>';

    const vehiculoId = (new URLSearchParams(location.search).get('vehiculo_id')) || document.getElementById('filterVehiculo')?.value || '';
    const estado = document.getElementById('filterEstado')?.value || '';
    const prioridad = document.getElementById('filterPrioridad')?.value || '';
    const hasta = document.getElementById('filterHasta')?.value || '';

    let query = supabase
      .from('tasks')
      .select(`
        id, vehiculo_id, title, status, priority, due_date, created_at,
        vehiculos:vehiculo_id(placa),
        task_assignees(profiles:profile_id(id,email,display_name))
      `)
      .order('created_at', { ascending: false });
    if (vehiculoId) query = query.eq('vehiculo_id', Number(vehiculoId));
    if (estado) query = query.eq('status', estado);
    if (prioridad) query = query.eq('priority', prioridad);
    if (hasta) query = query.lte('due_date', hasta);

    const { data, error } = await query;
    let rows = data;
    if (error) {
      const msg = error.message||'';
      // Fallback si la tabla aún no está en el schema cache
      if (/public.*tasks.*schema cache|relation .* does not exist/i.test(msg)) {
        // 1) Traer tareas base (sin joins)
        let q2 = supabase.from('tasks').select('id,vehiculo_id,title,status,priority,due_date,created_at').order('created_at', { ascending: false });
        if (vehiculoId) q2 = q2.eq('vehiculo_id', Number(vehiculoId));
        if (estado) q2 = q2.eq('status', estado);
        if (prioridad) q2 = q2.eq('priority', prioridad);
        if (hasta) q2 = q2.lte('due_date', hasta);
        const { data: tdata, error: tErr } = await q2;
        if (tErr) {
          const msg2 = tErr.message||'';
          if (/public.*tasks.*schema cache|relation .* does not exist/i.test(msg2)) {
            setNotice('Falta cargar el schema de tareas. Ejecuta 15_tasks_setup.sql y luego: NOTIFY pgrst, \"reload schema\"; en Supabase.', 'warning');
          }
          tbody.innerHTML = '<tr><td colspan="7" class="text-danger">'+ (msg2||'Error') +'</td></tr>';
          return;
        }
        // 2) Traer asignaciones (para mostrar cantidad y nombres por separado)
        const ids = (tdata||[]).map(t => t.id);
        let counts = new Map();
        let names = new Map();
        if (ids.length) {
          const { data: asg } = await supabase
            .from('task_assignees')
            .select('task_id, profiles:profile_id(email,display_name)')
            .in('task_id', ids);
          (asg||[]).forEach(a => {
            counts.set(a.task_id, (counts.get(a.task_id)||0)+1);
            const label = a.profiles?.display_name || a.profiles?.email || '';
            names.set(a.task_id, [...(names.get(a.task_id)||[]), label]);
          });
        }
        rows = (tdata||[]).map(t => ({ ...t, __assigneeCount: counts.get(t.id)||0, __assigneeNames: names.get(t.id)||[], vehiculos: { placa: t.vehiculos?.placa } }));
        setNotice('Actualicé la lista usando un modo compatible. Puedes ejecutar: NOTIFY pgrst, \"reload schema\"; para habilitar la vista.', 'info');
      } else {
        tbody.innerHTML = '<tr><td colspan="7" class="text-danger">'+ (msg||'Error') +'</td></tr>';
        return;
      }
    }
    tbody.innerHTML = (rows||[]).map(t => {
      const badge = (st => ({ pendiente: 'warning', terminada: 'success' }[st]||'secondary'))(t.status);
      const prBadge = (p => ({ baja:'secondary', media:'info', alta:'warning', critica:'danger' }[p]||'secondary'))(t.priority);
      const due = t.due_date ? new Date(t.due_date).toLocaleDateString() : '';
      const placa = t.vehiculos?.placa || '';
      // si vino con joins
      const namesFromJoin = Array.isArray(t.task_assignees)
        ? (t.task_assignees||[]).map(a => a.profiles?.display_name || a.profiles?.email).filter(Boolean)
        : (t.__assigneeNames||[]);
      const assignees = namesFromJoin.length || t.__assigneeCount || 0;
      const assignedHtml = namesFromJoin.length
        ? namesFromJoin.map(n => `<span class="badge bg-secondary me-1">${n}</span>`).join('')
        : '<span class="badge bg-light text-muted">Sin asignados</span>';
      return `
        <tr data-id="${t.id}">
          <td>${t.title||''}</td>
          <td>${placa || t.vehiculo_id || ''}</td>
          <td>${assignedHtml}</td>
          <td><span class="badge bg-${badge}">${t.status}</span></td>
          <td><span class="badge bg-${prBadge}">${t.priority}</span></td>
          <td>${due}</td>
          <td class="text-center">
            <button class="btn btn-sm btn-outline-primary btn-edit"><i class="fas fa-pen"></i></button>
            <button class="btn btn-sm btn-outline-danger btn-delete"><i class="fas fa-trash"></i></button>
          </td>
        </tr>
      `;
    }).join('');
  }

  function selectedIdsFrom(selectId){
    const sel = document.getElementById(selectId);
    return Array.from(sel?.selectedOptions||[]).map(o=>o.value);
  }

  async function upsertAssignees(taskId, profileIds) {
    if (!profileIds.length) return;
    const rows = profileIds.map(pid => ({ task_id: taskId, profile_id: pid }));
    if (!rows.length) return;
    const { error: insErr } = await supabase.from('task_assignees').upsert(rows);
    if (insErr) throw insErr;
  }

  function wireFilters() {
    ['filterEstado','filterPrioridad','filterHasta','filterVehiculo'].forEach(id => {
      document.getElementById(id)?.addEventListener('change', loadTasks);
    });
  }

  function wireTable() {
    document.addEventListener('click', async (e) => {
      const btnEdit = e.target.closest('.btn-edit');
      const btnDelete = e.target.closest('.btn-delete');
      if (!btnEdit && !btnDelete) return;
      const tr = (btnEdit||btnDelete).closest('tr');
      const id = tr?.getAttribute('data-id');
      if (!id) return;
      if (btnDelete) {
        if (!confirm('¿Eliminar tarea?')) return;
        const { error } = await supabase.from('tasks').delete().eq('id', id);
        if (error) { alert(error.message||'No se pudo eliminar'); return; }
        await loadTasks();
        return;
      }
      if (btnEdit) {
        const { data, error } = await supabase.from('tasks').select('*').eq('id', id).maybeSingle();
        if (error || !data) { alert(error?.message||'No se pudo cargar'); return; }
        document.getElementById('taskId').value = data.id;
        document.getElementById('taskTitle').value = data.title||'';
        document.getElementById('taskVehiculoId').value = data.vehiculo_id||'';
        document.getElementById('taskDesc').value = data.description||'';
        document.getElementById('taskStatus').value = data.status||'pendiente';
        document.getElementById('taskPriority').value = data.priority||'media';
        document.getElementById('taskDue').value = data.due_date||'';
        // Cargar asignados
        const { data: ass } = await supabase.from('task_assignees').select('profile_id, profiles:profile_id(email)').eq('task_id', id);
        const emails = (ass||[]).map(a => a.profiles?.email).filter(Boolean).join(', ');
        document.getElementById('taskAssignees').value = emails;
        new bootstrap.Modal(document.getElementById('taskModal')).show();
      }
    });
  }

  function wireForm() {
    const form = document.getElementById('taskForm');
    if (!form) return;
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('taskId').value || null;
      const title = document.getElementById('taskTitle').value.trim();
      const vehiculoId = document.getElementById('taskVehiculoId').value ? Number(document.getElementById('taskVehiculoId').value) : null;
      const description = document.getElementById('taskDesc').value.trim();
      const status = document.getElementById('taskStatus').value;
      const priority = document.getElementById('taskPriority').value;
      const due = document.getElementById('taskDue').value || null;
      const profileIds = selectedIdsFrom('taskAssignees');

      const payload = { vehiculo_id: vehiculoId, title, description, status, priority, due_date: due };
      let taskId = id;
      if (id) {
        const { error } = await supabase.from('tasks').update(payload).eq('id', id);
        if (error) { alert(error.message||'No se pudo actualizar'); return; }
        // reset y reasignar
        await supabase.from('task_assignees').delete().eq('task_id', id);
        await upsertAssignees(id, profileIds);
      } else {
        // created_by se asigna desde el cliente
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { alert('Sesión requerida'); return; }
        const { data, error } = await supabase.from('tasks').insert({ ...payload, created_by: user.id }).select('id').single();
        if (error) { alert(error.message||'No se pudo crear'); return; }
        taskId = data.id;
        await upsertAssignees(taskId, profileIds);
      }
      document.querySelector('#taskModal .btn-close')?.click();
      await loadTasks();
    });
  }

  document.addEventListener('DOMContentLoaded', async () => {
    if (!(await ensureInit())) return;
    await loadAssignableUsers();
    ['filterVehiculo','filterEstado','filterPrioridad','filterHasta'].forEach(id => {
      document.getElementById(id)?.addEventListener('change', loadTasks);
    });
    wireFilters();
    wireTable();
    wireForm();
    await loadTasks();
  });
})();


