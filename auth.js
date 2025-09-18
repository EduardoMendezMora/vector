// Autenticación y guardas de sesión
(function() {
  const redirectTo = (path) => window.location.replace(path);

  function toast(msg) { console.log(msg); }

  async function ensureSupabase() {
    if (!window.SupabaseConfig || !window.SupabaseConfig.initialize()) {
      toast('Configuración de Supabase requerida');
      return false;
    }
    await window.SupabaseConfig.testConnection();
    return true;
  }

  async function getCurrentProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
    return data || null;
  }

  // Login page handler
  async function setupLogin() {
    if (!document.getElementById('loginForm')) return;
    if (!(await ensureSupabase())) return;

    // Si ya hay sesión activa, ir al home
    const { data: { session } } = await supabase.auth.getSession();
    if (session) { redirectTo('index.html'); return; }

    const form = document.getElementById('loginForm');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { alert('Credenciales inválidas'); return; }
      redirectTo('index.html');
    });
  }

  // Guardas para páginas internas (index.html, vehiculos.html, etc.)
  async function protectPage() {
    const isLogin = !!document.getElementById('loginForm');
    if (isLogin) return;
    if (!(await ensureSupabase())) return;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { redirectTo('login.html'); return; }
    const profile = await getCurrentProfile();
    if (!profile || profile.active !== true) {
      alert('Tu usuario no está activo. Contacta al administrador.');
      await supabase.auth.signOut();
      redirectTo('login.html');
      return;
    }
    window.currentProfile = profile;
    // Inyectar botón de logout si hay header
    const header = document.querySelector('.main-header .container-fluid .row .col-auto');
    if (header) {
      const btn = document.createElement('button');
      btn.className = 'btn btn-outline-primary';
      btn.innerHTML = '<i class="fas fa-right-from-bracket me-2"></i>Salir';
      btn.onclick = async () => { await supabase.auth.signOut(); redirectTo('login.html'); };
      header.prepend(btn);
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    setupLogin();
    protectPage();
  });
})();



