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

    content.innerHTML = `
      <div class="row g-3">
        <div class="col-md-6">
          <div class="card h-100">
            <div class="card-header">Identificación</div>
            <div class="card-body">
              <dl class="row mb-0">
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
              <dl class="row mb-0">
                <dt class="col-sm-5">Marca</dt><dd class="col-sm-7">${v.marcas?.nombre || '-'}</dd>
                <dt class="col-sm-5">Modelo</dt><dd class="col-sm-7">${v.modelos?.nombre || '-'}</dd>
                <dt class="col-sm-5">Año</dt><dd class="col-sm-7">${v.año || '-'}</dd>
                <dt class="col-sm-5">Carrocería</dt><dd class="col-sm-7">${v.carrocerias?.nombre || '-'}</dd>
                <dt class="col-sm-5">Cilindrada (cc)</dt><dd class="col-sm-7">${v.cilindrada || '-'}</dd>
                <dt class="col-sm-5">Cilindros</dt><dd class="col-sm-7">${v.cilindros || '-'}</dd>
                <dt class="col-sm-5">Combustible</dt><dd class="col-sm-7">${v.combustible || '-'}</dd>
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
              <dl class="row mb-0">
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
  }

  main();
})();


