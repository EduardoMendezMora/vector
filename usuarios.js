// Gestión de perfiles de usuario (admin-only)
(function() {
  const qs = (s) => document.querySelector(s);
  const qsa = (s) => Array.from(document.querySelectorAll(s));

  function toast(msg) {
    try { console.log(msg); } catch (_) {}
  }

  function setNotice(html, type = 'warning') {
    const box = document.getElementById('usersNotice');
    if (!box) return;
    if (!html) { box.innerHTML = ''; return; }
    const cls = type === 'danger' ? 'alert-danger' : type === 'info' ? 'alert-info' : 'alert-warning';
    box.innerHTML = '<div class="alert '+cls+' p-2 mb-3">'+ html +'</div>';
  }

  async function ensureInit() {
    if (!window.SupabaseConfig?.initialize()) {
      toast('Supabase no inicializado');
      return false;
    }
    await window.SupabaseConfig.testConnection();
    return true;
  }

  async function requireAdmin() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { window.location.replace('login.html'); return false; }
    const { data: profile } = await supabase
      .from('profiles').select('*').eq('id', user.id).maybeSingle();
    if (!profile || profile.active !== true || !['admin','super_admin'].includes(profile.role)) {
      alert('Acceso restringido a administradores');
      window.location.replace('index.html');
      return false;
    }
    return true;
  }

  async function loadUsers() {
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">Cargando...</td></tr>';
    const [profilesRes, pendingRes] = await Promise.all([
      supabase.from('profiles').select('id,email,display_name,role,active,created_at').order('created_at', { ascending: false }),
      supabase.from('profile_pending_prefs').select('email,display_name,role,active,created_at').order('created_at', { ascending: false })
    ]);
    if (profilesRes.error) {
      const msg = (profilesRes.error).message || 'Error';
      tbody.innerHTML = '<tr><td colspan="6" class="text-danger">'+ msg +'</td></tr>';
      return;
    }

    const pendingNotInstalled = !!(pendingRes.error && /profile_pending_prefs|schema cache|relation .* does not exist/i.test(pendingRes.error.message||''));
    if (pendingNotInstalled) {
      setNotice('Las invitaciones pendientes no están habilitadas. Ejecuta 14_profiles_pending_invites.sql en Supabase.');
    } else {
      setNotice('');
    }

    const rowsProfiles = (profilesRes.data||[]).map(p => {
      const created = new Date(p.created_at).toLocaleString();
      const chk = p.active ? 'checked' : '';
      const state = p.active ? 'active' : 'inactive';
      const stateBadge = p.active
        ? '<span class="badge bg-success">Activo</span>'
        : '<span class="badge bg-secondary">Inactivo</span>';
      return `
        <tr data-id="${p.id}" data-state="${state}">
          <td>${p.email||''}</td>
          <td>${p.display_name||''}</td>
          <td>
            <select class="form-select form-select-sm user-role">
              <option value="user" ${p.role==='user'?'selected':''}>Usuario</option>
              <option value="admin" ${p.role==='admin'?'selected':''}>Admin</option>
              <option value="super_admin" ${p.role==='super_admin'?'selected':''}>Super Admin</option>
            </select>
          </td>
          <td class="text-center">
            <input type="checkbox" class="form-check-input user-active" ${chk} />
          </td>
          <td>${stateBadge}</td>
          <td>${created}</td>
          <td class="text-center">
            <button class="btn btn-sm btn-primary btn-save-user"><i class="fas fa-save me-1"></i>Guardar</button>
          </td>
        </tr>
      `;
    }).join('');

    const rowsPending = (pendingNotInstalled ? [] : (pendingRes.data||[])).map(p => {
      const created = new Date(p.created_at).toLocaleString();
      const chk = p.active ? 'checked' : '';
      return `
        <tr data-pending-email="${p.email}" data-state="pending">
          <td>${p.email||''} <span class="badge bg-warning text-dark ms-2">Pendiente</span></td>
          <td>${p.display_name||''}</td>
          <td>
            <select class="form-select form-select-sm user-role">
              <option value="user" ${p.role==='user'?'selected':''}>Usuario</option>
              <option value="admin" ${p.role==='admin'?'selected':''}>Admin</option>
              <option value="super_admin" ${p.role==='super_admin'?'selected':''}>Super Admin</option>
            </select>
          </td>
          <td class="text-center">
            <input type="checkbox" class="form-check-input user-active" ${chk} />
          </td>
          <td><span class="badge bg-warning text-dark">Pendiente</span></td>
          <td>${created}</td>
          <td class="text-center">
            <div class="btn-group btn-group-sm" role="group">
              <button class="btn btn-primary btn-save-user"><i class="fas fa-save me-1"></i>Guardar</button>
              <button class="btn btn-outline-secondary btn-resend-invite"><i class="fas fa-paper-plane me-1"></i>Reenviar</button>
              <button class="btn btn-outline-danger btn-cancel-invite"><i class="fas fa-times me-1"></i>Cancelar</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    tbody.innerHTML = rowsPending + rowsProfiles;

    // Aplicar filtro actual luego de renderizar
    applyFilter();
  }

  function applyFilter() {
    const select = document.getElementById('filterStatus');
    const value = (select?.value || 'all');
    const rows = Array.from(document.querySelectorAll('#usersTableBody tr'));
    rows.forEach(tr => {
      const state = tr.getAttribute('data-state') || 'active';
      if (value === 'all') { tr.style.display = ''; return; }
      tr.style.display = (state === value) ? '' : 'none';
    });
  }

  async function setupModal() {
    const form = document.getElementById('userForm');
    if (!form) return;
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('userEmail').value.trim();
      const displayName = document.getElementById('userName').value.trim();
      const role = document.getElementById('userRole').value;
      const active = document.getElementById('userActive').checked;

      // 1) Intentar RPC admin (si el usuario ya existe en Auth)
      const { data, error } = await supabase.rpc('admin_upsert_profile_by_email', {
        p_email: email,
        p_display_name: displayName || null,
        p_role: role,
        p_active: active
      });
      // 2) Si falla porque no existe en Auth, guardar preferencias y enviar Magic Link
      if (error && /No existe usuario en Auth/i.test(error.message||'')) {
        await supabase.from('profile_pending_prefs').upsert({
          email,
          display_name: displayName || null,
          role,
          active
        });
        const { error: mailErr } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin + '/login.html' } });
        if (mailErr) { alert(mailErr.message || 'No se pudo enviar la invitación'); return; }
        alert('Invitación enviada por correo. Se aplicarán los permisos al confirmar.');
      } else if (error && /admin_upsert_profile_by_email/i.test(error.message||'')) {
        // Si la función RPC aún no existe, caemos al modo invitación automática
        await supabase.from('profile_pending_prefs').upsert({
          email,
          display_name: displayName || null,
          role,
          active
        });
        const { error: mailErr } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin + '/login.html' } });
        if (mailErr) { alert(mailErr.message || 'No se pudo enviar la invitación'); return; }
        setNotice('La función admin_upsert_profile_by_email no está instalada. Ejecuta 13_profiles_admin_upsert.sql para activarla.', 'info');
        alert('Invitación enviada. Cuando el usuario confirme, se aplicarán los permisos.');
      } else if (error) {
        alert(error.message || 'Error al guardar');
        return;
      }
      document.getElementById('userModal')?.querySelector('.btn-close')?.click();
      await loadUsers();
    });
  }

  function wireRowSave() {
    document.addEventListener('click', async (e) => {
      const btnSave = e.target.closest('.btn-save-user');
      const btnResend = e.target.closest('.btn-resend-invite');
      const btnCancel = e.target.closest('.btn-cancel-invite');
      if (!btnSave && !btnResend && !btnCancel) return;
      const tr = (btnSave||btnResend||btnCancel).closest('tr');
      const id = tr?.getAttribute('data-id');
      const pendingEmail = tr?.getAttribute('data-pending-email');
      const role = tr.querySelector('.user-role').value;
      const active = tr.querySelector('.user-active').checked;
      const email = tr.children[0].textContent.trim();
      const displayName = tr.children[1].textContent.trim();
      if (btnSave) {
        if (id) {
          const { error } = await supabase.from('profiles').update({ role, active, display_name: displayName }).eq('id', id);
          if (error) { alert(error.message || 'Error al actualizar'); return; }
        } else if (pendingEmail) {
          const { error } = await supabase.from('profile_pending_prefs').upsert({
            email: pendingEmail,
            display_name: displayName || null,
            role,
            active
          });
          if (error) { alert(error.message || 'Error al actualizar'); return; }
        }
        toast('Usuario actualizado');
      }
      if (btnResend && pendingEmail) {
        const { error: mailErr } = await supabase.auth.signInWithOtp({ email: pendingEmail, options: { emailRedirectTo: window.location.origin + '/login.html' } });
        if (mailErr) { alert(mailErr.message || 'No se pudo reenviar'); return; }
        toast('Invitación reenviada');
      }
      if (btnCancel && pendingEmail) {
        if (!confirm('¿Cancelar la invitación pendiente?')) return;
        const { error } = await supabase.from('profile_pending_prefs').delete().eq('email', pendingEmail);
        if (error) { alert(error.message || 'No se pudo cancelar'); return; }
        tr.remove();
        toast('Invitación cancelada');
      }
    });
  }

  document.addEventListener('DOMContentLoaded', async () => {
    if (!(await ensureInit())) return;
    const ok = await requireAdmin();
    if (!ok) return;
    await loadUsers();
    await setupModal();
    wireRowSave();
    const filter = document.getElementById('filterStatus');
    if (filter) {
      filter.addEventListener('change', applyFilter);
    }
  });
})();


