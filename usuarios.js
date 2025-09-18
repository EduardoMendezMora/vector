// Gestión de perfiles de usuario (admin-only)
(function() {
  const qs = (s) => document.querySelector(s);
  const qsa = (s) => Array.from(document.querySelectorAll(s));

  function toast(msg) {
    try { console.log(msg); } catch (_) {}
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
    const { data, error } = await supabase
      .from('profiles')
      .select('id,email,display_name,role,active,created_at')
      .order('created_at', { ascending: false });
    if (error) { tbody.innerHTML = '<tr><td colspan="6" class="text-danger">'+(error.message||'Error')+'</td></tr>'; return; }
    tbody.innerHTML = (data||[]).map(p => {
      const created = new Date(p.created_at).toLocaleString();
      const chk = p.active ? 'checked' : '';
      return `
        <tr data-id="${p.id}">
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
          <td>${created}</td>
          <td class="text-center">
            <button class="btn btn-sm btn-primary btn-save-user"><i class="fas fa-save me-1"></i>Guardar</button>
          </td>
        </tr>
      `;
    }).join('');
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

      // Upsert en profiles (el usuario debe existir en auth.users para tener id; si no, solo guardamos el perfil por email)
      const { data: userByEmail } = await supabase
        .from('profiles').select('id').eq('email', email).maybeSingle();
      const id = userByEmail?.id || null;

      const { error } = await supabase.from('profiles').upsert({
        id,
        email,
        display_name: displayName,
        role,
        active
      }, { onConflict: 'id' });
      if (error) { alert(error.message || 'Error al guardar'); return; }
      document.getElementById('userModal')?.querySelector('.btn-close')?.click();
      await loadUsers();
    });
  }

  function wireRowSave() {
    document.addEventListener('click', async (e) => {
      const btn = e.target.closest('.btn-save-user');
      if (!btn) return;
      const tr = btn.closest('tr');
      const id = tr?.getAttribute('data-id');
      const role = tr.querySelector('.user-role').value;
      const active = tr.querySelector('.user-active').checked;
      const email = tr.children[0].textContent.trim();
      const displayName = tr.children[1].textContent.trim();
      const { error } = await supabase.from('profiles').update({ role, active, display_name: displayName }).eq('id', id);
      if (error) { alert(error.message || 'Error al actualizar'); return; }
      toast('Usuario actualizado');
    });
  }

  document.addEventListener('DOMContentLoaded', async () => {
    if (!(await ensureInit())) return;
    const ok = await requireAdmin();
    if (!ok) return;
    await loadUsers();
    await setupModal();
    wireRowSave();
  });
})();


