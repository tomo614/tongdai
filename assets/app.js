(function () {
  'use strict';

  var AUTHORS = (window.AUTHORS || []).slice();
  var NOW = new Date().getFullYear();
  var CATS = ['文学', '思想', '科学', '艺术', '权力', '其他'];
  var TYPE_SHORT = {
    friend: '挚友', rival: '论敌', mentor: '师承', family: '亲属',
    circle: '同圈', patron: '知遇', context: '背景', influence: '影响', none: '无交集'
  };

  /* ---------- utils ---------- */
  function norm(s) {
    return (s || '').toLowerCase().replace(/[\s·・.,'"’“”\-—－_()（）\[\]【】《》\/]/g, '');
  }

  function fmtYear(y) {
    if (y === null || y === undefined || y === '') return '?';
    return y < 0 ? '前' + Math.abs(y) : String(y);
  }

  function lifeText(o) {
    var b = fmtYear(o.birth !== undefined ? o.birth : o.b);
    var d = (o.death !== undefined ? o.death : o.d);
    var tail = (d === null || d === undefined) ? '今' : fmtYear(d);
    return (o.approx ? '约' : '') + b + '–' + tail;
  }

  function catOf(f) {
    var s = f || '';
    if (/科学|数学|物理|天文|生物|医学|心理|经济|农学|发明|工程/.test(s)) return '科学';
    if (/绘画|书法|音乐|雕塑|建筑|摄影|电影|舞蹈|设计|插画/.test(s)) return '艺术';
    if (/君主|政治|军事|外交|革命|教皇|皇帝|宫廷|武术/.test(s)) return '权力';
    if (/哲学|思想|佛|神学|经院|史学|学术|评论|语言|教育|理学/.test(s)) return '思想';
    if (/诗|词|辞赋|小说|戏剧|杂剧|散文|童话|文学|作家|出版|记者|缪斯/.test(s)) return '文学';
    return '其他';
  }

  function yearsOf(o) {
    var b = (o.b !== undefined ? o.b : o.birth);
    var d = (o.d !== undefined ? o.d : o.death);
    return { b: b, d: (d === null || d === undefined) ? NOW : d, alive: (d === null || d === undefined) };
  }

  function overlapOf(a, p) {
    var A = yearsOf(a), P = yearsOf(p);
    if (A.b === null || P.b === null) return null;
    return Math.min(A.d, P.d) - Math.max(A.b, P.b);
  }

  /* ---------- indexes ---------- */
  var byName = {};
  AUTHORS.forEach(function (a) {
    [a.name, a.en].concat(a.alias || []).forEach(function (k) {
      if (k) byName[norm(k)] = a;
    });
  });

  var people = {};   // key -> {name, en, b, d, f, c, authors: []}
  AUTHORS.forEach(function (a) {
    a.peers.forEach(function (p) {
      var k = p.n;
      if (!people[k]) {
        people[k] = { name: p.n, en: p.e || '', b: p.b, d: p.d, f: p.f, c: p.c, authors: [] };
      }
      if (people[k].authors.indexOf(a) < 0) people[k].authors.push(a);
      if (p.e && !people[k].en) people[k].en = p.e;
    });
  });

  function authorOf(name) {
    return byName[norm(name)] || null;
  }

  function findAuthors(q, limit) {
    var n = norm(q);
    if (!n) return [];
    var exact = [], part = [];
    AUTHORS.forEach(function (a) {
      var keys = [a.name, a.en].concat(a.alias || []).filter(Boolean).map(norm);
      if (keys.indexOf(n) >= 0) { exact.push(a); return; }
      if (keys.some(function (k) { return k.length >= 2 && (k.indexOf(n) >= 0 || n.indexOf(k) >= 0); })) part.push(a);
    });
    return exact.concat(part).slice(0, limit || 8);
  }

  function findPeople(q, limit) {
    var n = norm(q);
    if (!n) return [];
    var exact = [], part = [];
    Object.keys(people).forEach(function (k) {
      var p = people[k];
      var keys = [p.name, p.en].filter(Boolean).map(norm);
      if (keys.indexOf(n) >= 0) { exact.push(p); return; }
      if (keys.some(function (kk) { return kk.length >= 2 && (kk.indexOf(n) >= 0 || n.indexOf(kk) >= 0); })) part.push(p);
    });
    return exact.concat(part).slice(0, limit || 8);
  }

  /* ---------- boot ---------- */
  document.addEventListener('DOMContentLoaded', function () {
    var input = document.getElementById('q');
    if (window.innerWidth < 560) input.placeholder = '输入作家名字';
    var form = document.getElementById('searchForm');
    var suggest = document.getElementById('suggest');

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      go(input.value);
    });

    input.addEventListener('input', function () { renderSuggest(input.value); });
    input.addEventListener('focus', function () { if (input.value) renderSuggest(input.value); });
    document.addEventListener('click', function (e) {
      if (!suggest.contains(e.target) && e.target !== input) hideSuggest();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === '/' && document.activeElement !== input) {
        e.preventDefault(); input.focus();
      }
      if (e.key === 'Escape') hideSuggest();
    });

    window.addEventListener('hashchange', route);
    route();
  });

  function hideSuggest() {
    document.getElementById('suggest').classList.remove('on');
  }

  function renderSuggest(q) {
    var box = document.getElementById('suggest');
    if (!norm(q)) { hideSuggest(); return; }
    var as = findAuthors(q, 5), ps = findPeople(q, 4);
    var html = '';
    as.forEach(function (a) {
      html += '<a href="#a/' + a.id + '"><span class="s-n">' + esc(a.name) + '</span>' +
        '<span class="s-t">作家</span><span class="s-m">' + lifeText(a) + '</span></a>';
    });
    ps.forEach(function (p) {
      html += '<a href="#p/' + encodeURIComponent(p.name) + '"><span class="s-n">' + esc(p.name) + '</span>' +
        '<span class="s-t">同代人物 · ' + p.authors.length + ' 位作家</span>' +
        '<span class="s-m">' + lifeText(p) + '</span></a>';
    });
    if (!html) {
      html = '<a href="javascript:void 0" style="color:var(--muted);cursor:default">没有收录「' + esc(q) + '」，试试 李白 / 张爱玲 / 卡夫卡 / 马尔克斯</a>';
    }
    box.innerHTML = html;
    box.classList.add('on');
  }

  function go(q) {
    q = (q || '').trim();
    if (!q) return;
    var as = findAuthors(q, 1);
    if (as.length) {
      location.hash = 'a/' + as[0].id;
      document.getElementById('q').value = as[0].name;
      document.getElementById('q').blur();
      hideSuggest();
      return;
    }
    var ps = findPeople(q, 1);
    if (ps.length) {
      location.hash = 'p/' + encodeURIComponent(ps[0].name);
      document.getElementById('q').value = ps[0].name;
      document.getElementById('q').blur();
      hideSuggest();
      return;
    }
    location.hash = 'x/' + encodeURIComponent(q);
    hideSuggest();
  }

  function esc(s) {
    return String(s === undefined || s === null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /* ---------- routing ---------- */
  function route() {
    var raw = (location.hash || '').slice(1), h = raw;
    try { h = decodeURIComponent(raw); } catch (e) { h = raw; }
    var home = document.getElementById('home');
    var detail = document.getElementById('detail');
    var cross = document.getElementById('cross');

    home.classList.add('hidden');
    detail.classList.add('hidden');
    cross.classList.add('hidden');

    if (h.indexOf('a/') === 0) {
      var a = null;
      AUTHORS.forEach(function (x) { if (x.id === h.slice(2)) a = x; });
      if (a) { renderDetail(a); detail.classList.remove('hidden'); window.scrollTo(0, 0); return; }
    }
    if (h.indexOf('p/') === 0) {
      renderPerson(h.slice(2));
      cross.classList.remove('hidden');
      window.scrollTo(0, 0);
      return;
    }
    if (h.indexOf('x/') === 0) {
      renderNotFound(h.slice(2));
      cross.classList.remove('hidden');
      window.scrollTo(0, 0);
      return;
    }
    renderHome();
    home.classList.remove('hidden');
    document.title = '同代 · 一个作家的同时代人';
  }

  /* ---------- home ---------- */
  function renderHome() {
    var el = document.getElementById('home');
    if (el.dataset.done) return;
    var cn = AUTHORS.filter(function (a) { return (a.country || '').indexOf('中国') === 0; })
      .sort(function (x, y) { return x.birth - y.birth; });
    var wd = AUTHORS.filter(function (a) { return (a.country || '').indexOf('中国') !== 0; })
      .sort(function (x, y) { return x.birth - y.birth; });

    function lib(list) {
      return list.map(function (a) {
        return '<button class="lib-item" data-id="' + a.id + '">' +
          '<span class="li-n">' + esc(a.name) + '</span>' +
          '<span class="li-m">' + lifeText(a) + ' · ' + esc(a.field) + '</span></button>';
      }).join('');
    }

    var peopleCount = Object.keys(people).length;

    el.innerHTML =
      '<div class="home">' +
      '<p class="eyebrow">输入一个名字 · 看见一整个时代</p>' +
      '<h1>同代<em>。</em></h1>' +
      '<p class="lede">输入任意一位作家——<b>古今中外都可以</b>——立刻看到与 TA 同时代的所有著名人物：' +
      '诗人、哲人、科学家、画家、君王。每一段关系都写明<b>什么时候认识、交往中发生了什么</b>，' +
      '连<b>绝交</b>也一并记下；确实没有交集的，照实列出，标注“同代无交集”。</p>' +
      '<div class="quick" id="quick">' +
      ['李白', '苏轼', '鲁迅', '张爱玲', '莎士比亚', '歌德', '托尔斯泰', '卡夫卡', '马尔克斯', '村上春树']
        .map(function (n) { return '<button class="q-chip" data-q="' + n + '">' + n + '</button>'; }).join('') +
      '<button class="q-chip" data-random="1">随便看一位 →</button>' +
      '</div>' +
      '<p class="hint">共收录 ' + AUTHORS.length + ' 位作家 · ' + peopleCount + ' 位时代人物 · 每位作家 10–16 位同代人 · 每段关系都写明相识时间与交往大事（绝交也记）</p>' +

      '<div class="section-head"><h2>中国作家</h2><span>' + cn.length + ' 位</span></div>' +
      '<div class="lib-grid">' + lib(cn) + '</div>' +
      '<div class="section-head"><h2>世界作家</h2><span>' + wd.length + ' 位</span></div>' +
      '<div class="lib-grid">' + lib(wd) + '</div>' +

      '<div class="note"><b>怎么用：</b>顶部搜索框输入名字（支持中英文、笔名、别名），回车即出结果。' +
      '结果页会先给出“同代时间轴”，再用卡片列出每一位同时代人物及其与 TA 的关系。' +
      '卡片下方的时间条表示两人生命重叠的长度；点击右上角标签可按“有交集 / 无交集”和领域筛选。<br>' +
      '<b>数据说明：</b>人物与关系为人工整理，生卒年多取通行说法，部分标“约”。' +
      '“同时代”指生命期有重叠；少数跨时代的影响者（如维吉尔之于但丁）会单独标注相隔年数。</div>' +
      '</div>';

    el.dataset.done = '1';
    el.querySelector('#quick').addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b) return;
      if (b.dataset.random) {
        location.hash = 'a/' + AUTHORS[Math.floor(Math.random() * AUTHORS.length)].id;
      } else if (b.dataset.q) {
        go(b.dataset.q);
      }
    });
    el.querySelectorAll('.lib-item').forEach(function (b) {
      b.addEventListener('click', function () { location.hash = 'a/' + b.dataset.id; });
    });
  }

  /* ---------- 交往年表 ---------- */
  function evBlock(p) {
    if (p.t === 'none') return '';
    var hasMet = p.met !== null && p.met !== undefined;
    var hasEv = p.ev && p.ev.length;
    if (!hasMet && !hasEv && !p.end) return '';
    var h = '<div class="ev">';
    var sub = p.metAt || '';
    if (!hasMet && /失载|不详|不明/.test(sub)) {
      h += '<div class="ev-head"><span class="k">相识</span><em>' + esc(sub) + '</em></div>';
    } else {
      h += '<div class="ev-head"><span class="k">相识</span>' +
        (hasMet ? '<b>' + fmtYear(p.met) + '</b>' : '<b>年月失载</b>') +
        (sub ? '<em>' + esc(sub) + '</em>' : '') + '</div>';
    }
    var rows = (p.ev || []).map(function (v) {
      return { y: (v.y === null || v.y === undefined) ? null : v.y, t: v.e, end: false };
    });
    if (p.end) rows.push({ y: p.end, t: p.endWhy || '关系终结', end: true });

    // 按年份排序；年份失载的排在最前，避免打断时间线
    rows.sort(function (x, y) {
      if (x.y === null && y.y === null) return 0;
      if (x.y === null) return -1;
      if (y.y === null) return 1;
      return x.y - y.y;
    });

    var body = rows.map(function (v) {
      return '<div class="ev-i' + (v.end ? ' is-end' : '') + '"><span class="ev-d"></span>' +
        '<span class="ev-y">' + (v.y === null ? '' : esc(fmtYear(v.y))) + '</span>' +
        '<span class="ev-t">' + esc(v.t) + '</span></div>';
    }).join('');
    return h + '<div class="ev-body">' + body + '</div></div>';
  }

  /* ---------- detail ---------- */
  var cur = { peers: [], author: null };

  function renderDetail(a) {
    document.title = a.name + ' 的同时代人 · 同代';
    var peers = a.peers.map(function (p, i) {
      return { p: p, i: i, cat: catOf(p.f), ov: overlapOf(a, p) };
    });
    cur = { peers: peers, author: a };
    var F = { rel: 'all', cat: 'all' };

    var fixed = peers.filter(function (x) { return x.ov !== null && x.ov > 0; });
    var ys = [];
    fixed.forEach(function (x) { var P = yearsOf(x.p), A = yearsOf(a); ys.push(P.b, P.d, A.b, A.d); });
    ys.push(a.birth, a.death || NOW);
    var minY = Math.min.apply(null, ys), maxY = Math.max.apply(null, ys);
    var pad = Math.max(3, Math.round((maxY - minY) * 0.035));
    minY -= pad; maxY += pad;
    var span = maxY - minY;

    var rows = fixed.slice().sort(function (x, y) { return x.p.b - y.p.b; });

    function pct(y) { return (y - minY) / span * 100; }

    // axis ticks
    var step = niceStep(span / 6.5);
    var ticks = '';
    for (var t = Math.ceil(minY / step) * step; t <= maxY; t += step) {
      var tp = pct(t);
      if (tp < 3 || tp > 92) continue;
      ticks += '<b style="left:' + tp.toFixed(2) + '%">' + fmtYear(t) + '</b>';
    }

    var items = rows.map(function (x) {
      var P = yearsOf(x.p);
      return { name: x.p.n, b: P.b, d: P.d, none: x.p.t === 'none', i: x.i, yr: lifeText(x.p).replace('–今', '–') };
    });
    items.push({ name: a.name, b: a.birth, d: a.death || NOW, me: true, yr: lifeText(a).replace('–今', '–') });
    items.sort(function (x, y) { return x.b - y.b; });

    var tlRows = items.map(function (x) {
      var left = pct(x.b), w = Math.max((x.d - x.b) / span * 100, 0.6);
      var cls = x.me ? 'me' : (x.none ? '' : 'has');
      return '<div class="tl-row ' + cls + '"' + (x.me ? '' : ' data-i="' + x.i + '"') +
        ' title="' + esc(x.name) + ' · ' + esc(x.yr) + '">' +
        '<div class="tl-nm">' + esc(x.name) + '</div>' +
        '<div class="tl-track"><i class="tl-bar" style="left:' + left.toFixed(2) + '%;width:' + w.toFixed(2) + '%"></i></div>' +
        '<div class="tl-yr">' + esc(x.yr) + '</div></div>';
    }).join('');

    var hasRel = a.peers.filter(function (p) { return p.t !== 'none'; }).length;
    var evN = a.peers.filter(function (p) { return p.t !== 'none' && p.ev && p.ev.length; }).length;
    var crossN = a.peers.filter(function (p) { return p.c && p.c.indexOf('中国') !== 0; }).length;
    var eraSpan = maxY - minY;

    var presentCats = CATS.filter(function (c) { return peers.some(function (x) { return x.cat === c; }); });

    var chips = '<div class="filters" id="filters">' +
      '<div class="fgroup" data-group="rel"><span class="fl">关系</span>' +
      '<button class="chip on" data-v="all">全部</button>' +
      '<button class="chip" data-v="yes">有直接关系</button>' +
      '<button class="chip" data-v="no">同代无交集</button></div>' +
      '<div class="fgroup" data-group="cat"><span class="fl">领域</span>' +
      '<button class="chip on" data-v="all">全部</button>' +
      presentCats.map(function (c) { return '<button class="chip" data-v="' + c + '">' + c + '</button>'; }).join('') +
      '</div><span class="fcount" id="fcount">' + peers.length + ' / ' + peers.length + ' 位</span></div>';

    var cards = peers.slice().sort(function (x, y) {
      if (x.p.b === null) return 1;
      if (y.p.b === null) return -1;
      return x.p.b - y.p.b;
    }).map(function (x) {
      var p = x.p, ta = authorOf(p.n);
      var P = yearsOf(p);
      var body = '';
      if (x.ov === null) {
        body = '<div class="life"><span class="lt">生卒年不详</span></div>';
      } else if (x.ov <= 0) {
        var A = yearsOf(a);
        var gap = p.b > A.d ? p.b - A.d : A.b - P.d;
        body = '<div class="life"><div class="tr"><i style="width:0%"></i></div>' +
          '<span class="lt">相隔约 ' + gap + ' 年 · 未曾同时在世</span></div>';
      } else {
        var A2 = yearsOf(a);
        var ratio = Math.round(x.ov / Math.max(1, A2.d - A2.b) * 100);
        body = '<div class="life"><div class="tr"><i style="width:' + Math.min(100, ratio) + '%"></i></div>' +
          '<span class="lt">同世 ' + x.ov + ' 年 · 占 ' + esc(a.name) + ' 一生的 ' + ratio + '%</span></div>';
      }
      return '<article class="card t-' + p.t + '" id="p' + x.i + '" data-i="' + x.i + '" data-cat="' + x.cat + '" data-has="' + (p.t === 'none' ? '0' : '1') + '">' +
        '<div class="card-h"><h3 class="nm">' + esc(p.n) +
        (p.e ? '<span class="en">' + esc(p.e) + '</span>' : '') + '</h3>' +
        '<span class="badge t-' + p.t + '">' + (TYPE_SHORT[p.t] || '同代') + '</span></div>' +
        '<div class="card-meta"><span>' + lifeText(p) + '</span><span>' + esc(p.c || '') + '</span><span>' + esc(p.f || '') + '</span></div>' +
        '<div class="rel">' + esc(p.r) + '</div>' +
        '<p class="x">' + esc(p.x) + '</p>' + evBlock(p) + body +
        (ta ? '<a class="jump" href="#a/' + ta.id + '">查看 TA 的主页 →</a>' : '') +
        '</article>';
    }).join('');

    var related = peers.map(function (x) { return authorOf(x.p.n); })
      .filter(function (x, i, arr) { return x && arr.indexOf(x) === i; })
      .map(function (x) {
        return '<a class="rel-link" href="#a/' + x.id + '">' + esc(x.name) + '<small>' + lifeText(x) + '</small></a>';
      }).join('');

    document.getElementById('detail').innerHTML =
      '<div class="detail">' +
      '<a class="crumb" href="#"><svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M9.5 3.5 5 8l4.5 4.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg> 返回首页</a>' +
      '<div class="a-head">' +
      '<div><h1 class="a-name">' + esc(a.name) + (a.en ? '<span class="a-en">' + esc(a.en) + '</span>' : '') + '</h1>' +
      '<div class="a-life">' +
      '<span><span class="k">生卒</span>' + lifeText(a) + '</span>' +
      '<span><span class="k">地域</span>' + esc(a.country) + '</span>' +
      '<span><span class="k">时代</span>' + esc(a.era) + '</span>' +
      '<span><span class="k">身份</span>' + esc(a.field) + '</span></div></div>' +
      '<div class="seal">' + esc(a.name.charAt(0)) + '</div></div>' +
      '<p class="a-bio">' + esc(a.bio) + '</p>' +
      '<div class="a-works"><span class="k">代表作</span>' +
      (a.works || []).map(function (w) { return '<span class="w-tag">' + esc(w) + '</span>'; }).join('') + '</div>' +

      '<div class="stats">' +
      '<div class="stat"><b>' + a.peers.length + '</b><span>同代人物</span></div>' +
      '<div class="stat"><b>' + hasRel + '</b><span>有直接关系</span></div>' +
      '<div class="stat"><b>' + evN + '</b><span>交往年表</span></div>' +
      '<div class="stat"><b>' + eraSpan + '</b><span>跨度（年）</span></div>' +
      '</div>' +

      '<div class="block"><div class="block-head"><h2>同代时间轴</h2>' +
      '<p>横条 = 生卒年，位置相同即曾同时活在世上</p>' +
      '<div class="legend"><span><i style="background:var(--accent)"></i>' + esc(a.name) + '</span>' +
      '<span><i style="background:var(--bar-has)"></i>有直接关系</span>' +
      '<span><i style="background:var(--bar-none)"></i>仅同代</span></div></div>' +
      '<div class="tl-scroll"><div class="tl-inner">' +
      '<div class="tl-axis"><div></div><div class="tl-ticks">' + ticks + '</div><div class="tl-sp"></div></div>' +
      tlRows +
      '</div></div>' +
      (crossN ? '<p class="tl-note">其中有 ' + crossN + ' 位来自其他文明／国家，可与 TA 形成跨文化对照。</p>' : '') +
      '</div>' +

      '<div class="block"><div class="block-head"><h2>同时代人物与关系</h2>' +
      '<p>按出生年排序，共 ' + a.peers.length + ' 位</p></div>' + chips +
      '<div class="grid" id="cards">' + cards + '</div></div>' +

      (related ? '<div class="block"><div class="block-head"><h2>这些同代人也在本库中</h2></div><div class="related">' + related + '</div></div>' : '') +

      '<div class="note"><b>关于“同时代”：</b>此处收录的是与 ' + esc(a.name) + ' 生命期有重叠的著名人物，' +
      '不限文学，包含思想、科学、艺术与权力人物。凡无直接交往或影响关系的，一律标注“同代无交集”，并说明他们各自在做什么。<br>' +
      '<b>交往年表：</b>每张卡片下方的“相识”是该年两人首次见面的年份与地点，其下按时间列出交往中的大事；若关系以绝交、反目或决裂收场，会用红点单独标出。<br>'+
      '<b>数据说明：</b>人工整理，生卒年取通行说法；带“约”者为学界尚有争议的年代。年月失载处写“年月失载”，不作推测。</div>' +
      '</div>';

    // interactions
    var filters = document.getElementById('filters');
    filters.addEventListener('click', function (e) {
      var b = e.target.closest('.chip');
      if (!b) return;
      var g = b.parentNode.dataset.group;
      b.parentNode.querySelectorAll('.chip').forEach(function (c) { c.classList.remove('on'); });
      b.classList.add('on');
      F[g] = b.dataset.v;
      applyFilters(F);
    });

    document.querySelector('.tl-inner').addEventListener('click', function (e) {
      var row = e.target.closest('.tl-row');
      if (!row || row.classList.contains('me')) return;
      var i = row.dataset.i;
      var card = document.getElementById('p' + i);
      if (!card) return;
      card.classList.remove('hide');
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      card.classList.remove('flash');
      void card.offsetWidth;
      card.classList.add('flash');
    });
  }

  function applyFilters(F) {
    var n = 0;
    document.querySelectorAll('#cards .card').forEach(function (c) {
      var okR = F.rel === 'all' || (F.rel === 'yes' ? c.dataset.has === '1' : c.dataset.has === '0');
      var okC = F.cat === 'all' || c.dataset.cat === F.cat;
      var show = okR && okC;
      c.classList.toggle('hide', !show);
      if (show) n++;
    });
    var fc = document.getElementById('fcount');
    if (fc) fc.textContent = n + ' / ' + cur.peers.length + ' 位';
  }

  function niceStep(raw) {
    var c = [1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000];
    for (var i = 0; i < c.length; i++) if (c[i] >= raw) return c[i];
    return 1000;
  }

  /* ---------- person (reverse lookup) ---------- */
  function renderPerson(name) {
    document.title = name + ' · 同代作家 · 同代';
    var p = people[name];
    var el = document.getElementById('cross');
    if (!p) { renderNotFound(name); return; }
    var list = p.authors.slice().sort(function (x, y) { return x.birth - y.birth; });

    el.innerHTML =
      '<div class="cross-head">' +
      '<a class="crumb" href="#"><svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M9.5 3.5 5 8l4.5 4.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg> 返回首页</a>' +
      '<p class="eyebrow">反向查询 · 同代作家</p>' +
      '<h1>' + esc(p.name) + (p.en ? ' <span style="font-size:.5em;color:var(--muted);letter-spacing:.06em">' + esc(p.en) + '</span>' : '') + '</h1>' +
      '<p>' + lifeText(p) + ' · ' + esc(p.c || '') + ' · ' + esc(p.f || '') +
      '。在本库中，TA 是 <b>' + list.length + '</b> 位作家的同时代人——下面是这些作家和 TA 的关系。</p>' +
      '</div>' +
      '<div class="cross-list">' + list.map(function (a) {
        return '<a class="rel-link" href="#a/' + a.id + '">' + esc(a.name) + '<small>' + lifeText(a) + '</small></a>';
      }).join('') + '</div>' +
      '<div class="grid">' + list.map(function (a) {
        var peer = null;
        a.peers.forEach(function (x) { if (x.n === p.name) peer = x; });
        if (!peer) return '';
        return '<article class="card t-' + peer.t + '">' +
          '<div class="card-h"><h3 class="nm">' + esc(a.name) + '<span class="en">' + lifeText(a) + ' · ' + esc(a.field) + '</span></h3>' +
          '<span class="badge t-' + peer.t + '">' + (TYPE_SHORT[peer.t] || '同代') + '</span></div>' +
          '<div class="rel">' + esc(peer.r) + '</div>' +
          '<p class="x">' + esc(peer.x) + '</p>' + evBlock(peer) +
          '<a class="jump" href="#a/' + a.id + '">打开 ' + esc(a.name) + ' 的同代星图 →</a>' +
          '</article>';
      }).join('') + '</div>' +
      '<div class="note">这张“反向清单”说明：同一个人往往同时出现在好几位作家的时代里。换个角度，历史就是一张互相重叠的网。</div>';
  }

  function renderNotFound(q) {
    var el = document.getElementById('cross');
    var samples = AUTHORS.slice(0, 8);
    el.innerHTML =
      '<div class="cross-head">' +
      '<a class="crumb" href="#"><svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M9.5 3.5 5 8l4.5 4.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg> 返回首页</a>' +
      '<p class="eyebrow">未收录</p>' +
      '<h1>“' + esc(q) + '”</h1>' +
      '<p>这个库里暂时没有 TA。当前收录 ' + AUTHORS.length + ' 位作家，' +
      '以及他们时代里的数百位人物。你可以先试试下面这些。</p>' +
      '</div>' +
      '<div class="cross-list">' + samples.map(function (a) {
        return '<a class="rel-link" href="#a/' + a.id + '">' + esc(a.name) + '<small>' + lifeText(a) + '</small></a>';
      }).join('') + '</div>';
  }

})();
