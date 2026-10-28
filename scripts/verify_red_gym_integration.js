const http = require('http');

async function testRedGym() {
  const BASE = 'http://localhost:3001';
  console.log('🧪 Iniciando Verificación de Integración de GIMNASIO RED GYM en', BASE);

  // 1. /api/public
  const pub = await fetch(`${BASE}/api/public`).then(r => r.json());
  console.log('✓ /api/public:', pub.gym_name, '|', pub.gym_address, '| Tel:', pub.gym_phone);
  if (pub.gym_name !== 'GIMNASIO RED GYM') throw new Error('Gym name mismatch');
  if (pub.gym_phone !== '954196867') throw new Error('Gym phone mismatch');

  // 2. Login Admin
  const loginRes = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'admin123' })
  });
  if (!loginRes.ok) throw new Error('Login failed: ' + loginRes.status);
  const cookie = loginRes.headers.get('set-cookie');
  const loginData = await loginRes.json();
  console.log('✓ Login exitoso:', loginData.user.username, '| Role:', loginData.user.role);

  // 3. Members
  const memberResp = await fetch(`${BASE}/api/members`, {
    headers: { Cookie: cookie }
  }).then(r => r.json());
  const memberList = Array.isArray(memberResp) ? memberResp : (memberResp.members || []);
  console.log('✓ Socios encontrados en BD:', memberList.length);
  memberList.forEach(m => console.log(`   - [${m.code || ('RG-' + String(m.id).padStart(4, '0'))}] ${m.name} | Estado: ${m.status} | Plan: ${m.plan_name || 'Sin plan'}`));
  if (memberList.length < 4) throw new Error('Expected at least 4 demo members');

  // 4. Plans
  const plans = await fetch(`${BASE}/api/plans`, {
    headers: { Cookie: cookie }
  }).then(r => r.json());
  console.log('✓ Planes oficiales configurados:');
  plans.forEach(p => console.log(`   - ${p.name}: S/ ${p.price} (${p.duration_days} días) | ${p.description || ''}`));

  // 5. Products / Store
  const products = await fetch(`${BASE}/api/products`, {
    headers: { Cookie: cookie }
  }).then(r => r.json());
  console.log('✓ Productos en Tienda Fitness:');
  products.forEach(p => console.log(`   - ${p.name} [${p.barcode}]: S/ ${p.price} (Stock: ${p.stock})`));

  // 6. Routines / Ejercicios
  const routines = await fetch(`${BASE}/api/routines`, {
    headers: { Cookie: cookie }
  }).then(r => r.json());
  console.log('✓ Rutinas registradas:');
  routines.forEach(r => console.log(`   - ${r.name} (${r.goal || ''} | Nivel: ${r.level || ''})`));

  // 7. Verify Static Pages & Frontends
  const pages = [
    '/admin/',
    '/admin/cards.html',
    '/',
    '/display.html',
    '/propuesta.html',
    '/anatomy-pro/index.html',
    '/anatomy-pro/report.html',
    '/INFORME_PROPUESTA_COMERCIAL_RED_GYM.pdf'
  ];

  for (const page of pages) {
    const res = await fetch(`${BASE}${page}`);
    if (!res.ok) throw new Error(`Page ${page} failed with status ${res.status}`);
    const cl = res.headers.get('content-length') || res.headers.get('content-type');
    console.log(`✓ Endpoint ${page} respondiendo OK (Status: ${res.status}, Type/Size: ${cl})`);
  }

  console.log('\n🎯 ¡TODAS LAS PRUEBAS DE INTEGRACIÓN DE RED GYM PASARON AL 100%! 🚀');
}

testRedGym().catch(err => {
  console.error('❌ Error en pruebas:', err);
  process.exit(1);
});
