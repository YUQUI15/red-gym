const fs = require('fs');
const path = require('path');

const p = path.join(__dirname, '..', 'scene-red-gym.cjs');
let s = fs.readFileSync(p, 'utf8');

s = s.split('Tu Gimnasio (Marca Propia)').join('GIMNASIO RED GYM');
s = s.split('Tu Gimnasio').join('GIMNASIO RED GYM');
s = s.split('Calle Antonio José de Sucre Lt. 10').join('Calle Piérola con Garcilaso de la Vega');
s = s.split('gympro:vault:v4').join('red_gym_vault');
s = s.split('GYMPRO:SOCIO').join('RED1.RG-1001');
s = s.split('GYMPRO:Mxxxx').join('RED1.RG-xxxx');
s = s.split('gym-v4.3').join('rg-v5.0');
s = s.split('Diario S/5, Mensual S/90').join('1M S/80, 2M S/140, 3M S/180, 6M S/350, 1A S/600, Pase S/6 y S/8');
s = s.split('Pase Diario Libre: S/ 5.00').join('Pase Máquinas: S/ 6.00 · Box/Baile: S/ 8.00');
s = s.split('#f5b400').join('#dc2626');
s = s.split('rgba(245, 180, 0, 0.75)').join('rgba(220, 38, 38, 0.75)');
s = s.split('PROGYM 360°').join('RED GYM 360°');

fs.writeFileSync(p, s, 'utf8');
console.log('scene-red-gym.cjs successfully patched for GIMNASIO RED GYM.');
