// Adaptación COMPLETA y reproducible de la base RD Fitness -> GIMNASIO RED GYM (idempotente).
// Uso: node scripts/adapt_red_gym.js
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const P = (...a) => path.join(ROOT, ...a);
const log = [];
const warn = [];

function read(rel) { return fs.readFileSync(P(rel), 'utf8'); }
function write(rel, s) { fs.writeFileSync(P(rel), s, 'utf8'); }

// Reemplazos (string o regex). `expect`: si es true avisa cuando no encuentra nada (la regla no aplicó).
function patch(rel, rules, { expectAll = false } = {}) {
  if (!fs.existsSync(P(rel))) { warn.push(`NO EXISTE: ${rel}`); return; }
  let s = read(rel), n = 0;
  for (const [from, to] of rules) {
    const before = s;
    s = typeof from === 'string' ? s.split(from).join(to) : s.replace(from, to);
    if (s !== before) n++;
    else if (expectAll) warn.push(`sin coincidencia en ${rel}: ${String(from).slice(0, 70)}`);
  }
  if (n) { write(rel, s); log.push(`${rel}: ${n} regla(s)`); }
}

const GYM = 'GIMNASIO RED GYM';
const ADDR = 'Calle Piérola con Garcilaso de la Vega, Chivay, Arequipa';
const SLOGAN = 'Fuerza · Pasión · Resultados';

// ---------- 1) Reglas comunes de texto (servidor + cliente) ----------
const COMMON = [
  ['Calle Antonio José de Sucre Lt. 10, Chivay', ADDR],
  ['Calle Sucre Lt. 10 · Chivay', 'Calle Piérola con Garcilaso de la Vega · Chivay'],
  ['Calle Sucre Lt. 10', 'Calle Piérola con Garcilaso de la Vega'],
  ['Exterior Sucre Lt. 10', 'Exterior Calle Piérola'],
  ['Disciplina · Constancia · Resultados · Valle del Colca', SLOGAN + ' · Valle del Colca'],
  ['Disciplina · Constancia · Resultados', SLOGAN],
  ['Lun a Sáb 6:00 a 21:00', 'Lun a Sáb 5:30 am a 10:00 pm'],
  ["'10702548911'", "''"],
  ["RUC: 10702548911 · ", ''],
  ["'RD-CHIVAY-2026'", "''"],
  ['RD_CustomerDisplay', 'RG_CustomerDisplay'],
  ['Reporte_RD_Fitness_', 'Reporte_RED_GYM_'],
  ['rdfitness_backup.db', 'redgym_backup.db'],
  ['rdfitness_export_', 'redgym_export_'],
  ['rd_fitness_${', 'red_gym_${'],
  ['rd-aviso-', 'rg-aviso-'],
  ['rd-new-announcement', 'rg-new-announcement'],
  ['RD-DVR-CHIVAY-0', 'RG-DVR-CHIVAY-0'],
  ['https://rd-fitness.onrender.com', 'https://red-gym.onrender.com'],
  ['<div class="watermark-bg" style="font-size:2.4rem">RD</div>', '<div class="watermark-bg" style="font-size:2.4rem">RED GYM</div>'],
  ['<div class="watermark-bg">AUDITORIA RD</div>', '<div class="watermark-bg">AUDITORIA RED GYM</div>'],
  ["RUC: ${esc(set.gym_ruc || '')} · ", "${set.gym_ruc ? 'RUC: ' + esc(set.gym_ruc) + ' · ' : ''}"],
  ["RUC: ${esc(settings.gym_ruc || '')} · ", "${settings.gym_ruc ? 'RUC: ' + esc(settings.gym_ruc) + ' · ' : ''}"],
  ["RUC: ${RD.esc(r.gym?.ruc || '')} · ", "${r.gym?.ruc ? 'RUC: ' + RD.esc(r.gym.ruc) + ' · ' : ''}"],
  ["RUC: ${RD.esc(settings.gym_ruc || '')} · ", "${settings.gym_ruc ? 'RUC: ' + RD.esc(settings.gym_ruc) + ' · ' : ''}"],
  // Formato de códigos: RD1/RD-xxxx -> RED1/RG-xxxx
  [/\bRD1\b/g, 'RED1'],
  ['RD-DAY-', 'RG-DAY-'],
  [/RD-(?=\\d)/g, 'RG-'],
  [/RD-(?=\\\?)/g, 'RG-'],
  ['(RD-?', '(RG-?'],
  ["/^RD(?=\\d)/, 'RD-'", "/^RG(?=\\d)/, 'RG-'"],
  ['RD-0001', 'RG-0001'], ['RD-0012', 'RG-0012'], ['RD0001', 'RG0001'],
  ["code: 'RD' + String(", "code: 'RG' + String("],
  ["name[0] || 'RD')", "name[0] || 'R')"],
  ['alt="RD"', 'alt="RED GYM"'],
  // Textos con precio fijo de S/ 5 (el pase diario de Red Gym es S/ 6 musculación / S/ 8 boxeo y baile)
  ['Pase Diario (S/ 5)', 'Pase Diario'],
  ['Debe abonar un nuevo pase diario de S/ 5.', 'Debe abonar un nuevo pase diario.'],
  ['1-clic para visitantes casuales de S/ 5', '1-clic para visitantes casuales'],
  ['Visitante que paga S/ 5 hoy', 'Visitante que paga hoy'],
  ["cfg.daily_pass_price || 5", "cfg.daily_pass_price || 6"],
  ["+s.daily_pass_price || 5", "+s.daily_pass_price || 6"],
  // Marca visual: dorado RD -> rojo Red Gym
  ['#f5b400', '#ef4444'], ['#F5B400', '#ef4444'],
  ['#ffd24a', '#f87171'], ['#ffd24d', '#f87171'],
  ['#d4a017', '#dc2626'], ['#c99300', '#b91c1c'],
  [/rgba\(\s*245\s*,\s*180\s*,\s*0\s*,/g, 'rgba(239,68,68,'],
  [/rgba\(\s*180\s*,\s*83\s*,\s*9\s*,/g, 'rgba(185,28,28,'],
  ['#b45309', '#b91c1c'],
  // Acentos rosados del tema claro heredado
  ['#B76E79', '#c81e1e'], ['#c97f8b', '#dc2626'],
  [/rgba\(\s*183\s*,\s*110\s*,\s*121\s*,/g, 'rgba(200,30,30,'],
  // Cache-busting de la versión de marca
  ['?v=5.0', '?v=6.0'],
];

const CLIENT_FILES = [
  'public/css/style.css', 'public/display.html', 'public/index.html', 'public/admin/index.html', 'public/admin/cards.html',
  'public/sw.js', 'public/js/admin-announce.js', 'public/js/admin-core.js', 'public/js/admin-members.js', 'public/js/admin-other.js',
  'public/js/admin-scan.js', 'public/js/app.js', 'public/js/common.js', 'public/js/member-hub.js', 'public/js/workout.js'
];
const SERVER_FILES = ['server/server.js', 'server/db.js', 'server/lib.js', 'server/member-hub.js', 'server/dataset.js', 'server/reports.js', 'server/xlsx-report.js'];
for (const f of [...CLIENT_FILES, ...SERVER_FILES]) patch(f, COMMON);

// ---------- 2) Servidor ----------
patch('server/server.js', [
  ["const memberCode = id => 'RD-' + String(id)", "const memberCode = id => 'RG-' + String(id)"],
  [/\brd_s\b/g, 'rg_s'], [/\brd_m\b/g, 'rg_m'],
  ["value: 'rd-fitness'", "value: 'red-gym'"],
  ["cfg.gym_slogan || 'Disciplina · Constancia · Resultados'", `cfg.gym_slogan || '${SLOGAN}'`],
  ['`rd_fitness_${tableKey}', '`red_gym_${tableKey}']
]);
patch('server/member-hub.js', [
  [/\brd_m\b/g, 'rg_m'],
  ["'rd', 'rdfitness',", "'rg', 'redgym', 'red',"],
  ['/^rd-?\\d+$/i', '/^rg-?\\d+$/i'],
  ['parecido a tu código RD.', 'parecido a tu código RG.'],
  ["'rd-fitness-dummy'", "'red-gym-dummy'"],
  ['RD-xxxx', 'RG-xxxx'], ['RD-0001, rd-1', 'RG-0001, rg-1'],
  ["'mailto:admin@rdfitness.club'", "'mailto:soporte@redgym.pe'"]
]);
patch('server/lib.js', [
  ["'rd-daily-secret-2026'", "process.env.DAILY_SECRET || 'red-daily-secret-2026'"],
  ['RD1.<codigo>', 'RED1.<codigo>'],
  ['RD-xxxx', 'RG-xxxx']
]);
patch('server/xlsx-report.js', [["GOLD = 'FFD4AF37'", "GOLD = 'FFEF4444'"], ["PAPER = 'FFF7F4EA'", "PAPER = 'FFFBF4F4'"]]);

// ---------- 3) Estilos: texto sobre rojo en tema claro ----------
patch('public/css/style.css', [
  ['/* DASHBOARDS Y HERRAMIENTAS PRO PARA SOCIOS (RD FITNESS) */', '/* DASHBOARDS Y HERRAMIENTAS PRO PARA SOCIOS (RED GYM) */']
]);
{
  let css = read('public/css/style.css');
  const marker = '/* === RED GYM: contraste sobre rojo en tema claro === */';
  if (!css.includes(marker)) {
    css += `\n${marker}\n[data-theme="light"] .btn.primary,[data-theme="light"] .chip.on,[data-theme="light"] .steps li::before{color:#fff}\n[data-theme="light"] .btn.primary{background:linear-gradient(180deg,var(--gold2),var(--gold))}\n`;
    write('public/css/style.css', css); log.push('public/css/style.css: contraste tema claro');
  }
}

// ---------- 4) HTML base: iconos, tema, manifiestos ----------
for (const f of ['public/index.html', 'public/admin/index.html']) {
  patch(f, [
    ['<link rel="apple-touch-icon" href="/icons/icon-192.png">', '<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png">'],
    ['<link rel="icon" type="image/svg+xml" href="/logo.svg">', '<link rel="icon" type="image/png" href="/favicon-64.png">\n  <link rel="icon" type="image/svg+xml" href="/logo.svg">'],
    ["'#FAF7FA'", "'#FAF8F8'"]
  ]);
}
write('public/manifest.json', JSON.stringify({
  id: '/', name: GYM, short_name: 'RED GYM',
  description: 'Tu credencial QR, rutinas, avisos y entrenador digital de GIMNASIO RED GYM',
  start_url: '/', scope: '/', display: 'standalone', display_override: ['standalone', 'minimal-ui'], orientation: 'portrait',
  background_color: '#0b0b0d', theme_color: '#0b0b0d', lang: 'es-PE', categories: ['health', 'fitness', 'lifestyle'],
  icons: [
    { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
    { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
  ],
  shortcuts: [
    { name: 'Mi código QR', short_name: 'Mi QR', url: '/?tab=pass', icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }] },
    { name: 'Entrenar', short_name: 'Entrenar', url: '/?tab=train', icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }] },
    { name: 'Mis avisos', short_name: 'Avisos', url: '/?inbox=1', icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }] }
  ]
}, null, 2) + '\n');
write('public/admin/manifest.json', JSON.stringify({
  name: 'GIMNASIO RED GYM - Panel de Gestión', short_name: 'RED GYM Panel',
  description: 'Escáner de acceso y gestión de GIMNASIO RED GYM',
  start_url: '/admin/', scope: '/admin/', display: 'standalone',
  background_color: '#0b0b0d', theme_color: '#0b0b0d', lang: 'es-PE',
  icons: [
    { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
    { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
  ]
}, null, 2) + '\n');
log.push('manifest.json (socio + panel) reescritos');

// Service worker: nueva versión de caché (fuerza a los celulares a descargar el nuevo logo/colores)
patch('public/sw.js', [["const VERSION = 'rg-v5.0'", "const VERSION = 'rg-v6.0'"], ["'/logo.svg', '/manifest.json'", "'/logo.svg', '/logo.png', '/manifest.json'"]]);

// ---------- 5) Logo SVG (placa blanca para que los contornos negros se vean en tema oscuro y claro) ----------
{
  const png = fs.readFileSync(P('public/logo.png'));
  const w = png.readUInt32BE(16), h = png.readUInt32BE(20);
  const pad = 26, W = w + pad * 2, H = h + pad * 2;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <title>GIMNASIO RED GYM</title>
  <rect width="${W}" height="${H}" rx="64" fill="#ffffff"/>
  <image x="${pad}" y="${pad}" width="${w}" height="${h}" xlink:href="data:image/png;base64,${png.toString('base64')}" href="data:image/png;base64,${png.toString('base64')}"/>
</svg>
`;
  write('public/logo.svg', svg);
  log.push(`public/logo.svg regenerado (${w}x${h}, ${(svg.length / 1024).toFixed(0)} KB)`);
}

// ---------- 6) Pantalla TV (display.html): tarifas y servicios oficiales ----------
{
  let s = read('public/display.html');
  const a = s.indexOf('function renderPromoSpotHtml(idx) {');
  const b = s.indexOf('function triggerPromoSpot() {');
  if (a < 0 || b < 0) warn.push('display.html: no se encontró el bloque de spots');
  else {
    const block = `function renderPromoSpotHtml(idx) {
        const slide = idx % 3;
        const meter = \`<div class="success-meter" style="width:220px;margin:0"><div class="success-meter-bar" style="background:var(--gold);animation-duration:\${tvConfig.promoDurationSec}s"></div></div>\`;
        if (slide === 0) {
          return \`
            <div class="promo-card">
              <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px">
                <div style="display:flex;align-items:center;gap:14px">
                  <img src="/logo.svg" alt="" style="width:64px;height:64px">
                  <div>
                    <div class="bill-tag" style="margin-bottom:4px">MEMBRESÍAS Y TARIFAS OFICIALES</div>
                    <h2 style="margin:0;font-size:2rem;font-weight:900">ENTRENA EN <span style="color:var(--gold)">GIMNASIO RED GYM</span></h2>
                  </div>
                </div>
                <span class="chip" style="border-color:var(--gold);color:var(--gold)">Pase Diario: S/ 6 Musculación · S/ 8 Boxeo y Baile</span>
              </div>
              <div class="promo-grid" style="grid-template-columns:repeat(5,1fr)">
                <div class="promo-plan-box">
                  <div class="promo-plan-name">1 Mes</div>
                  <div class="promo-plan-price">S/ 80</div>
                  <div class="promo-plan-sub">30 días · Acceso total + App</div>
                </div>
                <div class="promo-plan-box">
                  <div class="promo-plan-name">2 Meses</div>
                  <div class="promo-plan-price">S/ 140</div>
                  <div class="promo-plan-sub">Ahorras S/ 20</div>
                </div>
                <div class="promo-plan-box featured">
                  <div class="promo-plan-name" style="color:var(--gold)">3 Meses ⭐</div>
                  <div class="promo-plan-price">S/ 180</div>
                  <div class="promo-plan-sub">Ahorras S/ 60</div>
                </div>
                <div class="promo-plan-box">
                  <div class="promo-plan-name">6 Meses</div>
                  <div class="promo-plan-price">S/ 350</div>
                  <div class="promo-plan-sub">Ahorras S/ 130</div>
                </div>
                <div class="promo-plan-box">
                  <div class="promo-plan-name">1 Año VIP</div>
                  <div class="promo-plan-price">S/ 600</div>
                  <div class="promo-plan-sub">Ahorras S/ 360</div>
                </div>
              </div>
              <div style="margin-top:20px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px">
                <span style="font-size:0.9rem;color:var(--text-muted)">Aceptamos <b>Yape, Plin, Efectivo y Tarjetas</b> · Incluye Carnet Digital QR y Rutinas</span>
                \${meter}
              </div>
            </div>\`;
        }
        if (slide === 1) {
          return \`
            <div class="promo-card">
              <div style="display:flex;align-items:center;gap:16px;margin-bottom:16px">
                <img src="/logo.svg" alt="" style="width:64px;height:64px">
                <div>
                  <div class="bill-tag" style="margin-bottom:4px">NUESTROS SERVICIOS</div>
                  <h2 style="margin:0;font-size:1.95rem;font-weight:900">FUERZA · PASIÓN · RESULTADOS</h2>
                </div>
              </div>
              <div class="promo-grid" style="grid-template-columns:repeat(4,1fr)">
                <div class="promo-plan-box" style="text-align:left">
                  <div style="color:var(--gold);font-weight:900;font-size:1.05rem;margin-bottom:6px">Sala de Máquinas</div>
                  <div class="promo-plan-sub">Musculación con máquinas y pesas libres para todos los niveles.</div>
                </div>
                <div class="promo-plan-box" style="text-align:left">
                  <div style="color:var(--gold);font-weight:900;font-size:1.05rem;margin-bottom:6px">Zona de Boxeo</div>
                  <div class="promo-plan-sub">Ring, sacos de golpeo y guantes de 12 oz. Pase diario S/ 8.</div>
                </div>
                <div class="promo-plan-box" style="text-align:left">
                  <div style="color:var(--gold);font-weight:900;font-size:1.05rem;margin-bottom:6px">Clases de Baile</div>
                  <div class="promo-plan-sub">Cardio, ritmo y tonificación en grupo. Pase diario S/ 8.</div>
                </div>
                <div class="promo-plan-box" style="text-align:left">
                  <div style="color:var(--gold);font-weight:900;font-size:1.05rem;margin-bottom:6px">Entrenador y Tienda</div>
                  <div class="promo-plan-sub">Rutinas guiadas, suplementos, accesorios y bebidas en recepción.</div>
                </div>
              </div>
              <div style="margin-top:20px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px">
                <span style="font-size:0.9rem;color:var(--text-muted)">Lun a Sáb 5:30 am a 10:00 pm · Calle Piérola con Garcilaso de la Vega, Chivay · WhatsApp <b>954 196 867</b></span>
                \${meter}
              </div>
            </div>\`;
        }
        return \`
          <div class="promo-card">
            <div style="display:flex;align-items:center;gap:16px;margin-bottom:16px">
              <img src="/logo.svg" alt="" style="width:64px;height:64px">
              <div>
                <div class="bill-tag" style="margin-bottom:4px">TECNOLOGÍA Y RENDIMIENTO DEPORTIVO</div>
                <h2 style="margin:0;font-size:1.95rem;font-weight:900">TU ENTRENADOR DIGITAL EN EL CELULAR + TIENDA FITNESS</h2>
              </div>
            </div>
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-top:16px">
              <div class="promo-plan-box" style="text-align:left">
                <div style="color:var(--gold);font-weight:900;font-size:1.05rem;margin-bottom:6px">1. Carnet QR Digital</div>
                <div class="promo-plan-sub">Ingresa en 0.1 segundos acercando tu celular o tarjeta al escáner óptico de recepción.</div>
              </div>
              <div class="promo-plan-box" style="text-align:left">
                <div style="color:#38bdf8;font-weight:900;font-size:1.05rem;margin-bottom:6px">2. Rutinas y Récords (PRs)</div>
                <div class="promo-plan-sub">Consulta tus ejercicios paso a paso, registra tus pesos, mide tu progreso corporal y descarga tu ficha PDF.</div>
              </div>
              <div class="promo-plan-box" style="text-align:left">
                <div style="color:#10b981;font-weight:900;font-size:1.05rem;margin-bottom:6px">3. Hidratación y Energía</div>
                <div class="promo-plan-sub">Aguas, bebidas rehidratantes, proteínas, vendas y guantes disponibles al instante en recepción.</div>
              </div>
            </div>
            <div style="margin-top:20px;display:flex;justify-content:space-between;align-items:center">
              <span style="font-size:0.88rem;color:var(--text-muted)">Monitoreo de seguridad activo en esquina inferior derecha (PiP) cuando hay cámaras</span>
              \${meter}
            </div>
          </div>\`;
      }

      `;
    s = s.slice(0, a) + block + s.slice(b);
    write('public/display.html', s);
    log.push('public/display.html: spots de tarifas/servicios Red Gym');
  }
}
patch('public/display.html', [
  ['Simular Cobro Yape S/ 60', 'Simular Cobro Yape S/ 80'],
  ["title: 'Membresía 1 Mes - GIMNASIO RED GYM', amount: 60", "title: 'Membresía 1 Mes - GIMNASIO RED GYM', amount: 80"],
  ['540560.00', '540580.00']
]);

// ---------- 7) Pase diario con 2 tarifas (Musculación S/ 6 / Boxeo y Baile S/ 8) ----------
patch('public/js/admin-scan.js', [
  [
`          <label class="field"><span>Monto (S/) *</span><input name="price" type="number" step="0.5" value="\${price}" required></label>`,
`          <label class="field"><span>Monto (S/) *</span><input name="price" type="number" step="0.5" value="\${price}" required></label>`
  ]
]);
{
  let s = read('public/js/admin-scan.js');
  if (!s.includes('dp_type')) {
    const anchor = `<div class="grid g2 keep">
          <label class="field"><span>Monto (S/) *</span>`;
    const idx = s.indexOf(anchor);
    if (idx < 0) warn.push('admin-scan.js: no se encontró el campo Monto del pase diario');
    else {
      const typeField = `\${passTypes.length > 1 ? \`<label class="field"><span>Tipo de pase *</span>
            <select id="dp_type">\${passTypes.map(t => \`<option value="\${t.price}">\${esc(t.label)} · S/ \${t.price}</option>\`).join('')}</select>
          </label>\` : ''}
        `;
      s = s.slice(0, idx) + typeField + s.slice(idx);
      s = s.replace(`const price = cfg.daily_pass_price || 6;`,
`// Tipos de pase diario = planes de 1 día activos (Red Gym: Musculación S/ 6 y Boxeo / Baile S/ 8)
    let passTypes = [];
    try {
      passTypes = JSON.parse(localStorage.getItem('rd_plans') || '[]')
        .filter(p => p.active && p.days > 0 && !p.months)
        .map(p => ({ label: String(p.name).replace(/^Pase diario\\s*/i, '').replace(/^\\(|\\)$/g, '') || 'General', price: p.price }));
    } catch { passTypes = []; }
    const price = passTypes[0]?.price ?? (cfg.daily_pass_price || 6);`);
      s = s.replace(`pInp.oninput = () => bTot.textContent = pInp.value || '0';`,
`pInp.oninput = () => bTot.textContent = pInp.value || '0';
    const typeSel = d.el.querySelector('#dp_type');
    if (typeSel) typeSel.onchange = () => { pInp.value = typeSel.value; bTot.textContent = typeSel.value; };`);
      write('public/js/admin-scan.js', s);
      log.push('public/js/admin-scan.js: selector de tipo de pase diario');
    }
  }
}

// ---------- 8) Reemplazar RD.LOGO_SVG (escudo RD Fitness heredado) por el logo oficial de GIMNASIO RED GYM ----------
for (const f of ['public/js/common.js', 'public/js/admin-other.js']) {
  let s = read(f);
  const start = s.indexOf('RD.LOGO_SVG = function');
  if (start >= 0) {
    const end = s.indexOf('</svg>`;\n  };', start);
    if (end >= 0 && s.slice(start, end).includes('rdGold')) {
      const newFn = `RD.LOGO_SVG = function (size = 54) {
    return \`<img src="/logo.svg?v=6.1" alt="GIMNASIO RED GYM" style="width:\${size}px;height:\${size}px;object-fit:contain;display:inline-block;vertical-align:middle;border-radius:10px">\`;
  };`;
      s = s.slice(0, start) + newFn + s.slice(end + '</svg>`;\n  };'.length);
      write(f, s);
      log.push(`${f}: RD.LOGO_SVG actualizado con /logo.svg?v=6.1`);
    }
  }
}

// ---------- 9) Compatibilidad dual en escáner QR/códigos (emite RED1/RG-, acepta RED1|RD1 y RG-|RD-) ----------
patch('server/server.js', [
  ['/^RED1\\.(RG-\\d{1,8})\\.([PD])(\\d+)\\.([0-9a-f]{12})$/', '/^(?:RED1|RD1)\\.((?:RG|RD)-\\d{1,8})\\.([PD])(\\d+)\\.([0-9a-f]{12})$/'],
  ['/^RED1\\.DAY\\.(RG-DAY-[A-Za-z0-9\\-]+)\\.(\\d{4}-\\d{2}-\\d{2})\\.([0-9a-f]{12})$/', '/^(?:RED1|RD1)\\.DAY\\.((?:RG|RD)-DAY-[A-Za-z0-9\\-]+)\\.(\\d{4}-\\d{2}-\\d{2})\\.([0-9a-f]{12})$/'],
  ['/^RG-DAY-[A-Za-z0-9\\-]+$/i', '/^(?:RG|RD)-DAY-[A-Za-z0-9\\-]+$/i'],
  ['/^(RG-?\\d{1,8})$/i', '/^((?:RG|RD)-?\\d{1,8})$/i'],
  ["replace(/^RG(?=\\d)/, 'RG-')", "replace(/^(?:RG|RD)-?(?=\\d)/i, 'RG-')"],
  ["startsWith('RG-DAY-')", "startsWith('RG-DAY-') || String(parsed.code).startsWith('RD-DAY-')"],
  ['/^RED1\\.DAY\\.([A-Za-z0-9\\-]+)\\.(\\d{4}-\\d{2}-\\d{2})\\.([0-9a-f]{12})$/', '/^(?:RED1|RD1)\\.DAY\\.([A-Za-z0-9\\-]+)\\.(\\d{4}-\\d{2}-\\d{2})\\.([0-9a-f]{12})$/']
]);
patch('public/js/common.js', [
  ['/^RED1\\.(RG-\\d{1,8})\\.([PD])(\\d+)\\.([0-9a-f]{12})$/', '/^(?:RED1|RD1)\\.((?:RG|RD)-\\d{1,8})\\.([PD])(\\d+)\\.([0-9a-f]{12})$/'],
  ['/^RED1\\.DAY\\.(RG-DAY-[A-Za-z0-9\\-]+)\\.(\\d{4}-\\d{2}-\\d{2})\\.([0-9a-f]{12})$/', '/^(?:RED1|RD1)\\.DAY\\.((?:RG|RD)-DAY-[A-Za-z0-9\\-]+)\\.(\\d{4}-\\d{2}-\\d{2})\\.([0-9a-f]{12})$/'],
  ['/^RG-DAY-[A-Za-z0-9\\-]+$/i', '/^(?:RG|RD)-DAY-[A-Za-z0-9\\-]+$/i'],
  ['/^(RG-?\\d{1,8})$/i', '/^((?:RG|RD)-?\\d{1,8})$/i'],
  ["replace(/^RG(?=\\d)/, 'RG-')", "replace(/^(?:RG|RD)-?(?=\\d)/i, 'RG-')"]
]);
patch('server/member-hub.js', [
  ['/^rg-?\\d+$/i', '/^(?:rg|rd)-?\\d+$/i']
]);

// ---------- 10) Paquete / metadatos ----------
patch('package.json', [['"name": "rd-fitness"', '"name": "red-gym"']]);
patch('package-lock.json', [['"name": "rd-fitness"', '"name": "red-gym"']]);
patch('data/exercises_es.js', [['RD Fitness Club', GYM]]);

console.log(log.join('\n'));
if (warn.length) console.log('\nAVISOS:\n' + warn.join('\n'));

// ---------- 11) Normalizar Base de Datos SQLite + Bóveda JSON + Bóveda en la Nube ----------
(async () => {
  const { q, saveVault, getVaultData, restoreVaultFromCloud, CloudVault, checkpoint } = require('../server/db');
  await restoreVaultFromCloud();
  q.tx(() => {
    q.run("UPDATE members SET code=REPLACE(code,'RD-','RG-') WHERE code LIKE 'RD-%'");
    q.run("UPDATE members SET phone='954196867' WHERE phone='982404043'");
    q.run("UPDATE attendance SET code=REPLACE(code,'RD-DAY-','RG-DAY-') WHERE code LIKE 'RD-DAY-%'");
    q.run("UPDATE attendance SET code=REPLACE(code,'RD-','RG-') WHERE code LIKE 'RD-%'");
    q.run("UPDATE daily_passes SET code=REPLACE(code,'RD-DAY-','RG-DAY-') WHERE code LIKE 'RD-DAY-%'");
    q.run("UPDATE users SET name='Administrador RED GYM' WHERE name='Administrador RD'");
    q.run("UPDATE cash_shifts SET user_name='Administrador RED GYM' WHERE user_name='Administrador RD'");
    q.run("UPDATE products SET name='Toalla Red Gym' WHERE name='Toalla RD'");
    q.run("UPDATE payments SET concept=REPLACE(concept,'Toalla RD','Toalla Red Gym') WHERE concept LIKE '%Toalla RD%'");
    q.run("UPDATE settings SET value='' WHERE key='gym_ruc' AND value='10702548911'");
    q.run("UPDATE settings SET value='#dc2626' WHERE key='color'");
    q.run("UPDATE settings SET value='GIMNASIO RED GYM' WHERE key IN ('gym_name','yape_name')");
    q.run("UPDATE settings SET value='Fuerza · Pasión · Resultados' WHERE key='gym_slogan'");
    q.run("UPDATE settings SET value='954196867' WHERE key IN ('gym_phone','yape_phone')");
    q.run("UPDATE settings SET value='Calle Piérola con Garcilaso de la Vega, Chivay, Arequipa' WHERE key='gym_address'");
    q.run("UPDATE settings SET value='Lun a Sáb 5:30 am a 10:00 pm' WHERE key='opening'");
    q.run("UPDATE settings SET value='6' WHERE key='daily_pass_price'");
  });
  checkpoint();
  saveVault();
  if (CloudVault.isConfigured()) {
    const res = await CloudVault.push(getVaultData());
    console.log('CloudVault push:', res);
  }
  console.log('Socios en BD:', q.all('SELECT id,code,name,phone FROM members'));
  console.log('\nOK');
  process.exit(0);
})();
