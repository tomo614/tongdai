const fs = require('fs');
const gap = JSON.parse(fs.readFileSync('.dev/gap.json', 'utf8'));
// 区域 → 文件名前缀
const PREFIX = {
  '中国·古代': 'cn-g', '中国·现当代': 'cn-h',
  '英国': 'w-f', '爱尔兰': 'w-f', '美国': 'w-g',
  '法国': 'w-h', '俄国 / 苏联': 'w-i',
  '德国': 'w-j', '奥地利 / 瑞士': 'w-j',
  '意大利': 'w-k', '西班牙 / 葡萄牙': 'w-k', '古希腊 / 古罗马': 'w-k',
  '北欧': 'w-l', '东欧 / 中欧': 'w-l',
  '日本': 'w-m', '印度': 'w-n',
  '阿拉伯 / 波斯 / 土耳其': 'w-n', '拉美': 'w-n', '非洲': 'w-n', '加拿大 / 大洋洲': 'w-n',
};
const bucket = {};   // prefix -> names[]
gap.forEach(g => {
  const p = PREFIX[g.region];
  (bucket[p] = bucket[p] || []).push(...g.lack);
});
const plan = [];
Object.keys(bucket).forEach(p => {
  const names = bucket[p];
  const size = 10;                       // 每片 10 位
  for (let i = 0; i < names.length; i += size) {
    plan.push({ file: p + '-' + (Math.floor(i / size) + 1), names: names.slice(i, i + size) });
  }
});
fs.writeFileSync('.dev/plan.json', JSON.stringify(plan, null, 1));
plan.forEach(p => console.log(p.file.padEnd(8), p.names.length, p.names.join('、')));
console.log('\n分片总数', plan.length, '｜待写作家', plan.reduce((s, p) => s + p.names.length, 0));
