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
  }

  main();
})();


