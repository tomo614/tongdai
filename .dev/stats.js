// README 统计口径：node .dev/stats.js
// 输出可直接替换 README「规模」段的数字。
const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, '..', 'data');
const FILES = fs.readdirSync(DIR).filter(f => f.endsWith('.js')).sort();

global.window = {};
for (const f of FILES) {
  try {
    eval(fs.readFileSync(path.join(DIR, f), 'utf8'));
  } catch (e) {
    console.log('PARSE FAIL ' + f + ': ' + String(e.message).split('\n')[0]);
  }
}
const A = global.window.AUTHORS || [];

const CN = A.filter(a => /中国/.test(a.country || '')).length;
let pairs = 0, withEv = 0, events = 0, metKnown = 0, ended = 0, broke = 0;
const persons = new Set();
const BREAK = /绝交|反目|决裂|背弃|断交|翻脸|离婚|断绝/;

A.forEach(a => {
  (a.peers || []).forEach(p => {
    pairs++;
    persons.add(p.n);
    if (Array.isArray(p.ev) && p.ev.length) { withEv++; events += p.ev.length; }
    if (typeof p.met === 'number') metKnown++;
    if (p.end !== null && p.end !== undefined) {
      ended++;
      if (BREAK.test(p.endWhy || '')) broke++;
    }
  });
});

const span = Math.min(...A.map(a => a.birth));
const out = [
  '作家总数 = ' + A.length,
  '中国 = ' + CN + ' ｜ 世界 = ' + (A.length - CN),
  '关系条数 = ' + pairs,
  '涉及时代人物 = ' + persons.size,
  '带年表关系 = ' + withEv + ' ｜ 事件数 = ' + events,
  '相识年份可考 = ' + metKnown,
  '写有终结 = ' + ended + ' ｜ 其中决裂类 = ' + broke,
  '最早生年 = ' + span,
];
console.log(out.join('\n'));
