// 数据校验器：node .dev/validate.js
// 检查 schema 完整性、生卒年合理性、关系类型、交往年表字段，并输出统计。
const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, '..', 'data');
const FILES = fs.readdirSync(DIR).filter(f => f.endsWith('.js')).map(f => f.slice(0, -3)).sort();
const TYPES = new Set(['friend', 'rival', 'mentor', 'family', 'circle', 'patron', 'context', 'influence', 'none']);

global.window = {};
const perFile = {};
const parseErrs = [];
for (const f of FILES) {
  const p = path.join(DIR, f + '.js');
  if (!fs.existsSync(p)) { console.log('missing file', f); continue; }
  perFile[f] = (global.window.AUTHORS || []).length;
  try {
    eval(fs.readFileSync(p, 'utf8'));
  } catch (e) {
    // 语法错误不能让整份报告“看起来是 0 错误”，单独记一条并跳过该文件
    parseErrs.push(f + '.js: ' + String(e.message).split('\n')[0]);
  }
  perFile[f] = (global.window.AUTHORS || []).length - perFile[f];
}
const AUTHORS = global.window.AUTHORS || [];

const errs = [];
const warns = [];
const ids = new Set();
const names = new Set(AUTHORS.map(a => a.name));
let pairs = 0, withEv = 0, events = 0, metKnown = 0, broken = 0, none = 0;
const byType = {};

AUTHORS.forEach(a => {
  const who = a.name || a.id || '(无名字)';
  if (!a.id) errs.push(who + ': 缺 id');
  if (ids.has(a.id)) errs.push(who + ': id 重复 ' + a.id);
  ids.add(a.id);
  if (!a.name) errs.push(who + ': 缺 name');
  if (typeof a.birth !== 'number') errs.push(who + ': birth 非数字');
  if (a.death !== null && typeof a.death !== 'number') errs.push(who + ': death 非数字');
  if (typeof a.death === 'number' && a.death < a.birth) errs.push(who + ': death < birth');
  ['country', 'era', 'field', 'bio'].forEach(k => { if (!a[k]) errs.push(who + ': 缺 ' + k); });
  if (!Array.isArray(a.works) || !a.works.length) errs.push(who + ': works 为空');
  if (!Array.isArray(a.peers)) { errs.push(who + ': peers 非数组'); return; }
  if (a.peers.length < 8) warns.push(who + ': 同代人物只有 ' + a.peers.length + ' 位');
  if (a.peers.length > 18) warns.push(who + ': 同代人物过多 ' + a.peers.length);

  const seen = new Set();
  let noneInAuthor = 0;
  a.peers.forEach(p => {
    pairs++;
    const tag = who + ' → ' + (p.n || '?');
    if (!p.n) errs.push(who + ': 有人物缺 n');
    if (seen.has(p.n)) errs.push(tag + ': 重复出现');
    seen.add(p.n);
    if (typeof p.b !== 'number') errs.push(tag + ': b 非数字');
    if (p.d !== null && typeof p.d !== 'number') errs.push(tag + ': d 非数字');
    if (typeof p.d === 'number' && typeof p.b === 'number' && p.d < p.b) errs.push(tag + ': d < b');
    if (!p.c) errs.push(tag + ': 缺 c（地域）');
    if (!p.f) errs.push(tag + ': 缺 f（领域）');
    if (!p.r) errs.push(tag + ': 缺 r（关系短语）');
    if (!p.x) errs.push(tag + ': 缺 x（说明）');
    if (!TYPES.has(p.t)) { errs.push(tag + ': 关系类型非法 ' + p.t); return; }
    byType[p.t] = (byType[p.t] || 0) + 1;

    if (p.t === 'none') {
      none++;
      noneInAuthor++;
      if (p.ev && p.ev.length) warns.push(tag + ': 类型为 none 但写了交往年表');
      if (p.met) warns.push(tag + ': 类型为 none 但有相识年份');
      return;
    }

    // 有真实关系：必须有相识年份（可为 null 表示失载）与至少一条交往事件
    if (!('met' in p)) errs.push(tag + ': 有直接关系但缺 met 字段');
    else if (p.met !== null && typeof p.met !== 'number') errs.push(tag + ': met 非数字且非 null');
    else if (typeof p.met === 'number') metKnown++;

    if (!Array.isArray(p.ev) || !p.ev.length) {
      errs.push(tag + ': 有直接关系但缺交往年表 ev');
    } else {
      withEv++;
      events += p.ev.length;
      p.ev.forEach((v, i) => {
        if (v === null || typeof v !== 'object') { errs.push(tag + ': ev[' + i + '] 非对象'); return; }
        if (v.y !== null && typeof v.y !== 'number') errs.push(tag + ': ev[' + i + '].y 非数字且非 null');
        if (!v.e) errs.push(tag + ': ev[' + i + '].e 为空');
        if (typeof v.e === 'string' && v.e.length < 6) warns.push(tag + ': ev[' + i + '].e 过于简略');
      });
      if (p.ev.length > 6) warns.push(tag + ': 交往事件过多 ' + p.ev.length);
    }

    if (p.end !== undefined && p.end !== null) {
      broken++;
      if (typeof p.end !== 'number') errs.push(tag + ': end 非数字');
      if (!p.endWhy) errs.push(tag + ': 有 end 但缺 endWhy');
    }
  });

  if (noneInAuthor < 2) warns.push(who + ': 缺少“同代无交集”条目（建议 ≥2）');
});

console.log('文件分布：' + Object.keys(perFile).map(f => f + '=' + perFile[f]).join('  '));
console.log('作家 ' + AUTHORS.length + ' 位 ｜ 人物关系 ' + pairs + ' 条 ｜ 有直接关系 ' + (pairs - none) +
  ' ｜ 同代无交集 ' + none);
console.log('交往年表：' + withEv + ' 条关系有年表，共 ' + events + ' 个事件；相识年份已知 ' + metKnown +
  ' 条；关系终结（含绝交）' + broken + ' 条');
console.log('类型分布：' + Object.keys(byType).sort((x, y) => byType[y] - byType[x]).map(k => k + ':' + byType[k]).join('  '));
console.log('错误 ' + (errs.length + parseErrs.length) + ' 条，提醒 ' + warns.length + ' 条');
parseErrs.forEach(e => console.log(' ERR  ' + e));
errs.slice(0, 60).forEach(e => console.log(' ERR  ' + e));
warns.slice(0, 25).forEach(w => console.log(' warn ' + w));
process.exitCode = (errs.length + parseErrs.length) ? 1 : 0;
