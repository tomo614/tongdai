const fs = require('fs'), path = require('path');
global.window = {};
const FILES = ['cn-a','cn-b','cn-c','cn-d','cn-e','cn-f','w-a','w-b','w-c','w-d','w-e'];
FILES.forEach(f => eval(fs.readFileSync(path.join('data', f + '.js'), 'utf8')));
const A = window.AUTHORS || [];

const norm = s => (s || '').replace(/[·•・\s\-—–.()（）]/g, '').toLowerCase();
const known = new Map();
A.forEach(a => { known.set(norm(a.name), a.name); (a.alias || []).forEach(x => known.set(norm(x), a.name)); });

const raw = fs.readFileSync('.dev/targets.txt', 'utf8').split(/\r?\n/);
const regions = [];
let cur = null;
raw.forEach(line => {
  const t = line.trim();
  if (!t) return;
  if (t.indexOf('、') < 0) { cur = { name: t, names: [] }; regions.push(cur); return; }
  t.split('、').map(s => s.trim()).filter(Boolean).forEach(n => { if (cur) cur.names.push(n); });
});

let total = 0, hit = 0, miss = 0;
const out = [];
regions.forEach(r => {
  const have = [], lack = [];
  r.names.forEach(n => { total++; (known.has(norm(n)) ? have : lack).push(n); });
  hit += have.length; miss += lack.length;
  out.push({ region: r.name, total: r.names.length, have, lack });
});
console.log('名单总数', total, '｜已在库', hit, '｜缺', miss, '｜现有库', A.length);
out.forEach(o => console.log(String(o.region).padEnd(14), '共', String(o.total).padStart(3), '已有', String(o.have.length).padStart(3), '缺', String(o.lack.length).padStart(3)));
fs.writeFileSync('.dev/gap.json', JSON.stringify(out, null, 1));
