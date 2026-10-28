const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const BASE_DIR = path.resolve(__dirname, '..');
console.log('🚀 Iniciando réplica exacta y adaptación de RD Fitness a GIMNASIO RED GYM en:', BASE_DIR);

// 1. Preparar logo.svg con el Cóndor oficial de Red Gym
const logoUploadPath = 'C:/Users/cf039/.gemini/antigravity/brain/6879f0e4-a349-472a-b769-d817f1294f7e/.user_uploaded/media_1792709943445_1bc659e0.jpg';
const flyerUploadPath = 'C:/Users/cf039/.gemini/antigravity/brain/6879f0e4-a349-472a-b769-d817f1294f7e/.user_uploaded/media_1792709957289_84bbc3fa.jpg';

if (fs.existsSync(logoUploadPath)) {
  const logoBuf = fs.readFileSync(logoUploadPath);
  fs.writeFileSync(path.join(BASE_DIR, 'public', 'logo.jpg'), logoBuf);
  const b64 = logoBuf.toString('base64');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 217 204" width="217" height="204">
  <image width="217" height="204" href="data:image/jpeg;base64,${b64}"/>
</svg>`;
  fs.writeFileSync(path.join(BASE_DIR, 'public', 'logo.svg'), svg, 'utf8');
  console.log('✓ public/logo.svg y public/logo.jpg actualizados con el Cóndor de Red Gym');
}

if (fs.existsSync(flyerUploadPath)) {
  const flyerBuf = fs.readFileSync(flyerUploadPath);
  fs.writeFileSync(path.join(BASE_DIR, 'public', 'flyer.jpg'), flyerBuf);
  console.log('✓ public/flyer.jpg actualizado con el afiche oficial de Red Gym');
}

// 2. Base de Datos: Clonar rdfitness.db a redgym.db y aplicar ajustes oficiales de Red Gym
const srcDbPath = path.join(BASE_DIR, 'storage', 'rdfitness.db');
const dstDbPath = path.join(BASE_DIR, 'storage', 'redgym.db');

if (fs.existsSync(srcDbPath)) {
  fs.copyFileSync(srcDbPath, dstDbPath);
  console.log('✓ storage/rdfitness.db copiado a storage/redgym.db con todos los datos y tablas');
}

const db = new DatabaseSync(dstDbPath);
db.exec('PRAGMA foreign_keys = ON;');

// Actualizar tabla settings en redgym.db
const settingsUpdates = {
  gym_name: 'GIMNASIO RED GYM',
  gym_slogan: 'Fuerza · Pasión · Resultados',
  gym_phone: '954196867',
  gym_address: 'Calle Piérola con Garcilaso de la Vega, Chivay, Arequipa',
  gym_ruc: '10702548911',
  opening: 'Lun a Sáb 5:30 am a 10:00 pm',
  color: '#dc2626',
  yape_phone: '954196867',
  yape_name: 'GIMNASIO RED GYM',
  daily_pass_price: '6'
};

const setStmt = db.prepare('INSERT INTO settings(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value');
for (const [k, v] of Object.entries(settingsUpdates)) {
  setStmt.run(k, v);
}
console.log('✓ Tabla settings en redgym.db actualizada con datos oficiales de Red Gym');

// Actualizar tabla plans en redgym.db con las tarifas oficiales del afiche
db.exec('DELETE FROM plans;');
const plans = [
  ['1 mes', 1, null, 80, 1],
  ['2 meses', 2, null, 140, 2],
  ['3 meses', 3, null, 180, 3],
  ['6 meses', 6, null, 350, 4],
  ['1 año VIP', 12, null, 600, 5],
  ['Pase diario (Musculación)', null, 1, 6, 6],
  ['Pase diario (Box / Baile)', null, 1, 8, 7]
];
const planStmt = db.prepare('INSERT INTO plans(name,months,days,price,sort) VALUES(?,?,?,?,?)');
for (const p of plans) {
  planStmt.run(p[0], p[1], p[2], p[3], p[4]);
}
console.log('✓ Tabla plans en redgym.db actualizada con tarifas oficiales (80, 140, 180, 350, 600, 6, 8)');

// Si no hay productos de boxeo en products, añadirlos a la tienda
try {
  const pCheck = db.prepare("SELECT 1 FROM products WHERE name LIKE '%Boxeo%' LIMIT 1").get();
  if (!pCheck) {
    const prodStmt = db.prepare('INSERT INTO products(name,price,stock,barcode,category) VALUES(?,?,?,?,?)');
    prodStmt.run('Guantes de Boxeo Red Gym 12oz/14oz', 85, 8, '7750106006066', 'accesorios');
    prodStmt.run('Vendas Boxeo Semielásticas 4.5m', 25, 15, '7750106005055', 'accesorios');
    prodStmt.run('Creatina Monohidratada 5g', 5, 25, '7750106007077', 'suplementos');
    console.log('✓ Productos de Boxeo y suplementos agregados a la tienda');
  }
} catch (e) {
  console.warn('Advertencia agregando productos:', e.message);
}

db.close();

// 3. Modificaciones en Archivos de Código Fuente (Servidor y Cliente)
function replaceInFile(relPath, rules) {
  const fullPath = path.join(BASE_DIR, relPath);
  if (!fs.existsSync(fullPath)) return;
  let content = fs.readFileSync(fullPath, 'utf8');
  let changed = false;
  for (const [search, replace] of rules) {
    if (typeof search === 'string') {
      if (content.includes(search)) {
        content = content.split(search).join(replace);
        changed = true;
      }
    } else if (search instanceof RegExp) {
      if (search.test(content)) {
        content = content.replace(search, replace);
        changed = true;
      }
    }
  }
  if (changed) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✓ Archivo modificado: ${relPath}`);
  }
}

// package.json
replaceInFile('package.json', [
  ['"name": "rd-fitness"', '"name": "red-gym"']
]);

// server/db.js
replaceInFile('server/db.js', [
  ["const DB_FILE = path.join(DATA_DIR, 'rdfitness.db');", "const DB_FILE = path.join(DATA_DIR, 'redgym.db');"],
  ["gym_name: 'RD Fitness Club'", "gym_name: 'GIMNASIO RED GYM'"],
  ["gym_slogan: 'Disciplina · Constancia · Resultados'", "gym_slogan: 'Fuerza · Pasión · Resultados'"],
  ["gym_phone: '982404043'", "gym_phone: '954196867'"],
  ["const CLEAN_GYM_ADDRESS = 'Calle Antonio José de Sucre Lt. 10, Chivay';", "const CLEAN_GYM_ADDRESS = 'Calle Piérola con Garcilaso de la Vega, Chivay, Arequipa';"],
  ["yape_phone: '982404043'", "yape_phone: '954196867'"],
  ["yape_name: 'RD FITNESS CLUB'", "yape_name: 'GIMNASIO RED GYM'"],
  ["opening: 'Lun a Sáb 6:00 a 21:00'", "opening: 'Lun a Sáb 5:30 am a 10:00 pm'"],
  ["color: '#f5b400'", "color: '#dc2626'"],
  ["daily_pass_price: '5'", "daily_pass_price: '6'"],
  ["`rdfitness-${L.limaDay()}.db`", "`redgym-${L.limaDay()}.db`"],
  ["[['1 mes', 1, 60, 1], ['3 meses', 3, 170, 2], ['6 meses', 300, 3], ['1 año', 12, 500, 4]]", "[['1 mes', 1, 80, 1], ['2 meses', 2, 140, 2], ['3 meses', 3, 180, 3], ['6 meses', 6, 350, 4], ['1 año VIP', 12, 600, 5]]"]
]);

// server/server.js
replaceInFile('server/server.js', [
  ["const PORT = process.env.PORT || 3000;", "const PORT = process.env.PORT || 3001;"],
  ["RD Fitness Club", "GIMNASIO RED GYM"],
  ["RD FITNESS CLUB", "GIMNASIO RED GYM"],
  ["982404043", "954196867"],
  ["`rdfitness-${L.limaDay()}.db`", "`redgym-${L.limaDay()}.db`"],
  ["`rdfitness-data-${L.limaDay()}.json`", "`redgym-data-${L.limaDay()}.json`"]
]);

// server/lib.js
replaceInFile('server/lib.js', [
  ["phone = '982404043'", "phone = '954196867'"],
  ["merchant = 'RD FITNESS CLUB'", "merchant = 'GIMNASIO RED GYM'"],
  ["/^(?:RD1)\\.([A-Z0-9_-]+)\\.([PD])(\\d+)\\.([a-f0-9]{12})$/", "/^(?:RED1|RD1)\\.([A-Z0-9_-]+)\\.([PD])(\\d+)\\.([a-f0-9]{12})$/"]
]);

// server/cloud-vault.js
replaceInFile('server/cloud-vault.js', [
  ["'rd_fitness_vault'", "'red_gym_vault'"],
  ["RD Fitness Club", "GIMNASIO RED GYM"]
]);

// server/dataset.js
replaceInFile('server/dataset.js', [
  ["'RD Fitness Club'", "'GIMNASIO RED GYM'"]
]);

// server/xlsx-report.js
replaceInFile('server/xlsx-report.js', [
  ["RD FITNESS CLUB", "GIMNASIO RED GYM"]
]);

// server/member-hub.js
replaceInFile('server/member-hub.js', [
  ["RD Fitness Club", "GIMNASIO RED GYM"],
  ["RD FITNESS CLUB", "GIMNASIO RED GYM"]
]);

// public/display.html
replaceInFile('public/display.html', [
  ["RD Fitness Club", "GIMNASIO RED GYM"],
  ["RD FITNESS CLUB", "GIMNASIO RED GYM"],
  ["RD FITNESS", "RED GYM"],
  ["982404043", "954196867"],
  ["982 404 043", "954 196 867"],
  ["Calle Antonio José de Sucre Lt. 10", "Calle Piérola con Garcilaso de la Vega"],
  ["Lun a Sáb 6:00 a 21:00", "Lun a Sáb 5:30 am a 10:00 pm"],
  ["--gold: #f5b400;", "--gold: #dc2626;"],
  ["--gold2: #ffd700;", "--gold2: #ef4444;"]
]);

// public/admin/cards.html
replaceInFile('public/admin/cards.html', [
  ["RD FITNESS CLUB", "GIMNASIO RED GYM"],
  ["RD FITNESS", "RED GYM"],
  ["RD Fitness Club", "GIMNASIO RED GYM"],
  ["Disciplina · Constancia · Resultados", "Fuerza · Pasión · Resultados"],
  ["982 404 043", "954 196 867"],
  ["982404043", "954196867"],
  ["Calle Antonio José de Sucre Lt. 10", "Calle Piérola con Garcilaso de la Vega"]
]);

// public/admin/index.html
replaceInFile('public/admin/index.html', [
  ["RD Fitness Club", "GIMNASIO RED GYM"],
  ["RD FITNESS CLUB", "GIMNASIO RED GYM"]
]);

// public/index.html
replaceInFile('public/index.html', [
  ["RD Fitness Club", "GIMNASIO RED GYM"],
  ["RD FITNESS CLUB", "GIMNASIO RED GYM"]
]);

// public/manifest.json
replaceInFile('public/manifest.json', [
  ["RD Fitness Club", "GIMNASIO RED GYM"],
  ["RD Fitness", "RED GYM"],
  ["#f5b400", "#dc2626"]
]);

// public/admin/manifest.json
replaceInFile('public/admin/manifest.json', [
  ["RD Fitness Admin", "GIMNASIO RED GYM Admin"],
  ["RD Admin", "RED Admin"],
  ["#f5b400", "#dc2626"]
]);

// public/sw.js
replaceInFile('public/sw.js', [
  ["rd-v5.0", "rg-v5.0"],
  ["RD Fitness Club", "GIMNASIO RED GYM"]
]);

// public/css/style.css
replaceInFile('public/css/style.css', [
  ["RD Fitness", "GIMNASIO RED GYM"],
  ["--gold: #f5b400;", "--gold: #dc2626;"],
  ["--gold2: #ffd700;", "--gold2: #ef4444;"]
]);

// public/js/common.js
replaceInFile('public/js/common.js', [
  ["RD Fitness Club", "GIMNASIO RED GYM"],
  ["RD FITNESS CLUB", "GIMNASIO RED GYM"],
  ["982404043", "954196867"],
  ["982 404 043", "954 196 867"]
]);

// public/js/app.js
replaceInFile('public/js/app.js', [
  ["RD Fitness Club", "GIMNASIO RED GYM"],
  ["RD FITNESS CLUB", "GIMNASIO RED GYM"],
  ["RD Fitness", "GIMNASIO RED GYM"],
  ["982404043", "954196867"],
  ["982 404 043", "954 196 867"]
]);

// public/js/admin-core.js
replaceInFile('public/js/admin-core.js', [
  ["RD Fitness Club", "GIMNASIO RED GYM"],
  ["RD FITNESS CLUB", "GIMNASIO RED GYM"],
  ["982404043", "954196867"]
]);

// public/js/admin-members.js
replaceInFile('public/js/admin-members.js', [
  ["RD Fitness", "GIMNASIO RED GYM"],
  ["RD-", "RG-"]
]);

// public/js/admin-other.js
replaceInFile('public/js/admin-other.js', [
  ["RD Fitness Club", "GIMNASIO RED GYM"],
  ["RD FITNESS CLUB", "GIMNASIO RED GYM"],
  ["RD Fitness", "GIMNASIO RED GYM"],
  ["982404043", "954196867"],
  ["982 404 043", "954 196 867"]
]);

// public/js/member-hub.js
replaceInFile('public/js/member-hub.js', [
  ["RD Fitness Club", "GIMNASIO RED GYM"],
  ["RD FITNESS CLUB", "GIMNASIO RED GYM"],
  ["982404043", "954196867"],
  ["982 404 043", "954 196 867"]
]);

// public/js/workout.js
replaceInFile('public/js/workout.js', [
  ["RD Fitness", "GIMNASIO RED GYM"]
]);

console.log('\n🎯 ¡RÉPLICA EXACTA Y ADAPTACIÓN DE RED GYM COMPLETADA CON ÉXITO! 🚀');
