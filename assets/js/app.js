/* =========================================================
   ZEROED — THE PRIVATE HONOR LEDGER · prototype app
   Vanilla JS · no build step · GitHub Pages friendly
   Bilingual (ko / en) · all data is demo only.
   ========================================================= */
(function () {
  'use strict';

  var DATA = window.ZEROED_DATA;
  var I18N = window.ZEROED_I18N;
  if (!DATA || !I18N) return;

  var BASE = DATA.BASE;
  var RATE = DATA.USD_RATE || 1355;
  var SPONSORS = DATA.SPONSORS;
  var CASES = DATA.CASES;
  var CAT_LABEL = DATA.CATEGORY_LABEL;

  var STORE_KEY = 'zeroed:v1';
  var COMMUNITY_KEY = 'zeroed:community:v1';
  var LANG_KEY = 'zeroed:lang';
  var LANG = (window.__ZEROED_LANG__ === 'en') ? 'en' : 'ko';
  var COMMUNITY_CATS = DATA.COMMUNITY_CATS || {};
  var SEED_POSTS = DATA.COMMUNITY_POSTS || [];

  var state = loadState();
  var community = loadCommunity();

  var ui = {
    hallFilter: 'all',
    boardFilter: 'all',
    communityFilter: 'all',
    communityOpen: {},
    communityFirstPaint: true,
    activeTab: 'hall',
    activeCase: null,
    selectedAmount: 0,
    lastFocused: null,
    openModal: null,
    lastCert: null,
    lastComplete: null,
    shown: { amount: 0, households: 0, sponsors: 0 }
  };

  /* ---------------- i18n ---------------- */
  function t(key, vars) {
    var table = I18N[LANG] || I18N.ko;
    var s = table[key];
    if (s === undefined) s = (I18N.ko[key] !== undefined ? I18N.ko[key] : key);
    if (vars) {
      Object.keys(vars).forEach(function (k) {
        s = s.split('{' + k + '}').join(String(vars[k]));
      });
    }
    return s;
  }
  function pick(obj, base) {
    if (!obj) return '';
    if (LANG === 'en' && obj[base + 'En']) return obj[base + 'En'];
    return obj[base];
  }
  function applyStatic() {
    document.documentElement.setAttribute('lang', LANG);
    document.documentElement.setAttribute('data-lang', LANG);
    document.title = t('meta.title');
    setMeta('meta-desc', 'meta.description');
    setMeta('og-title', 'meta.title');
    setMeta('og-desc', 'meta.description');
    setMeta('og-locale', 'meta.locale');
    var list = document.querySelectorAll('[data-i18n]');
    Array.prototype.forEach.call(list, function (el) {
      el.textContent = t(el.getAttribute('data-i18n'));
    });
    list = document.querySelectorAll('[data-i18n-html]');
    Array.prototype.forEach.call(list, function (el) {
      el.innerHTML = t(el.getAttribute('data-i18n-html'));
    });
    list = document.querySelectorAll('[data-i18n-aria]');
    Array.prototype.forEach.call(list, function (el) {
      el.setAttribute('aria-label', t(el.getAttribute('data-i18n-aria')));
    });
    list = document.querySelectorAll('[data-i18n-placeholder]');
    Array.prototype.forEach.call(list, function (el) {
      el.setAttribute('placeholder', t(el.getAttribute('data-i18n-placeholder')));
    });
    Array.prototype.forEach.call(document.querySelectorAll('[data-set-lang]'), function (btn) {
      var on = btn.getAttribute('data-set-lang') === LANG;
      btn.classList.toggle('is-active', on);
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    applyTabLabels();
  }

  /* Narrow screens use shorter tab labels so four tabs never wrap or clip. */
  function applyTabLabels() {
    var narrow = window.innerWidth <= 560;
    var meta = [
      { key: 'hall', full: 'tab.hall', short: 'tab.hallShort' },
      { key: 'board', full: 'tab.board', short: 'tab.boardShort' },
      { key: 'model', full: 'tab.model', short: 'tab.modelShort' },
      { key: 'community', full: 'tab.community', short: 'tab.communityShort' }
    ];
    meta.forEach(function (m) {
      var el = document.querySelector('#tab-' + m.key + ' [data-tab-label]');
      if (el) el.textContent = t(narrow ? m.short : m.full);
    });
  }
  function setMeta(id, key) {
    var el = document.getElementById(id);
    if (el) el.setAttribute('content', t(key));
  }
  function urlForLang(lang, keepHash) {
    try {
      var u = new URL(window.location.href);
      u.searchParams.set('lang', lang);
      return u.pathname + '?' + u.searchParams.toString() + (keepHash ? u.hash : '');
    } catch (err) {
      return null;
    }
  }
  function setLang(lang, opts) {
    if (lang !== 'ko' && lang !== 'en') return;
    opts = opts || {};
    LANG = lang;
    window.__ZEROED_LANG__ = lang;
    try { window.localStorage.setItem(LANG_KEY, lang); } catch (err) {}
    if (opts.updateUrl !== false) {
      var url = urlForLang(lang, true);
      if (url) { try { history.replaceState(null, '', url); } catch (err) {} }
    }
    applyStatic();
    renderAll(false);
    renderSim();
    refreshOpen();
    if (opts.toast !== false) {
      toast(lang === 'en' ? 'Language: English' : '언어: 한국어', 'ok');
    }
  }

  /* ---------------- utils ---------------- */
  function h(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined && text !== null) n.textContent = text;
    return n;
  }
  function $(sel) { return document.querySelector(sel); }
  function $$(sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); }
  function clamp(n, a, b) { return Math.min(b, Math.max(a, n)); }
  function num(n) { return Number(n) || 0; }

  function fmtKRW(value) {
    var n = Math.max(0, Math.round(num(value)));
    var eok = Math.floor(n / 100000000);
    var man = Math.floor((n % 100000000) / 10000);
    var won = n % 10000;
    if (eok > 0) {
      return man > 0
        ? eok.toLocaleString('ko-KR') + '억 ' + man.toLocaleString('ko-KR') + '만원'
        : eok.toLocaleString('ko-KR') + '억원';
    }
    if (man > 0) {
      return won > 0
        ? man.toLocaleString('ko-KR') + '만 ' + won.toLocaleString('ko-KR') + '원'
        : man.toLocaleString('ko-KR') + '만원';
    }
    return n.toLocaleString('ko-KR') + '원';
  }
  function fmtUSD(valueKRW) {
    var usd = Math.max(0, num(valueKRW)) / RATE;
    if (usd >= 1000000000) return '$' + trimNum(usd / 1000000000) + 'B';
    if (usd >= 1000000) return '$' + trimNum(usd / 1000000) + 'M';
    if (usd >= 1000) return '$' + trimNum(usd / 1000) + 'K';
    return '$' + Math.round(usd).toLocaleString('en-US');
  }
  function trimNum(v) {
    var s;
    if (v >= 100) s = v.toFixed(0);
    else if (v >= 10) s = v.toFixed(1);
    else s = v.toFixed(2);
    if (s.indexOf('.') >= 0) s = s.replace(/\.0+$/, '').replace(/(\.\d)0$/, '$1');
    return s;
  }
  function fmtMoney(v) { return LANG === 'en' ? fmtUSD(v) : fmtKRW(v); }
  function fmtCount(n) {
    return Math.round(num(n)).toLocaleString(LANG === 'en' ? 'en-US' : 'ko-KR');
  }
  function fmtDate(iso) {
    var d = iso ? new Date(iso) : new Date();
    if (isNaN(d.getTime())) d = new Date();
    if (LANG === 'en') {
      var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return months[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
    }
    var mm = String(d.getMonth() + 1).padStart(2, '0');
    var dd = String(d.getDate()).padStart(2, '0');
    return d.getFullYear() + '.' + mm + '.' + dd;
  }
  function fmtDateTime(iso) {
    var d = iso ? new Date(iso) : new Date();
    if (isNaN(d.getTime())) d = new Date();
    var time = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
    return fmtDate(iso) + ' ' + time;
  }
  function uid() {
    return 'e' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }

  /* ---------------- store ---------------- */
  function loadState() {
    var fresh = { v: 1, entries: [], nickname: '' };
    try {
      var raw = window.localStorage.getItem(STORE_KEY);
      if (!raw) return fresh;
      var parsed = JSON.parse(raw);
      if (!parsed || !Array.isArray(parsed.entries)) return fresh;
      parsed.entries = parsed.entries.filter(function (e) {
        return e && typeof e.caseId === 'string' && isFinite(Number(e.amount));
      }).map(function (e) {
        return {
          id: String(e.id || uid()),
          caseId: String(e.caseId),
          amount: Math.max(0, Math.round(Number(e.amount))),
          nickname: String(e.nickname || '').slice(0, 20),
          message: String(e.message || '').slice(0, 60),
          at: e.at || new Date().toISOString()
        };
      });
      return {
        v: 1,
        entries: parsed.entries,
        nickname: typeof parsed.nickname === 'string' ? parsed.nickname.slice(0, 20) : ''
      };
    } catch (err) {
      return fresh;
    }
  }
  function saveState() {
    try {
      window.localStorage.setItem(STORE_KEY, JSON.stringify(state));
    } catch (err) {
      /* storage full or private mode: keep the demo running */
    }
  }

  /* ---------------- community store ---------------- */
  function loadCommunity() {
    var fresh = { v: 1, posts: [], respect: {}, comments: {}, name: '' };
    try {
      var raw = window.localStorage.getItem(COMMUNITY_KEY);
      if (!raw) return fresh;
      var parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return fresh;
      var posts = Array.isArray(parsed.posts) ? parsed.posts.filter(function (p) {
        return p && typeof p.id === 'string' && typeof p.body === 'string' && p.body.trim();
      }).map(function (p) {
        return {
          id: String(p.id),
          cat: COMMUNITY_CATS[p.cat] ? p.cat : 'support',
          name: String(p.name || '').slice(0, 20),
          title: String(p.title || '').slice(0, 80),
          body: String(p.body).slice(0, 400),
          tier: String(p.tier || '').slice(0, 12),
          at: p.at || new Date().toISOString()
        };
      }) : [];
      var respect = {};
      if (parsed.respect && typeof parsed.respect === 'object') {
        Object.keys(parsed.respect).forEach(function (k) {
          if (parsed.respect[k]) respect[String(k)] = true;
        });
      }
      var comments = {};
      if (parsed.comments && typeof parsed.comments === 'object') {
        Object.keys(parsed.comments).forEach(function (k) {
          var list = parsed.comments[k];
          if (!Array.isArray(list)) return;
          comments[String(k)] = list.filter(function (c) {
            return c && typeof c.body === 'string' && c.body.trim();
          }).map(function (c) {
            return {
              id: String(c.id || uid()),
              name: String(c.name || '').slice(0, 20),
              body: String(c.body).slice(0, 200),
              at: c.at || new Date().toISOString()
            };
          });
        });
      }
      return {
        v: 1,
        posts: posts,
        respect: respect,
        comments: comments,
        name: typeof parsed.name === 'string' ? parsed.name.slice(0, 20) : ''
      };
    } catch (err) {
      return fresh;
    }
  }
  function saveCommunity() {
    try {
      window.localStorage.setItem(COMMUNITY_KEY, JSON.stringify(community));
    } catch (err) {
      /* storage unavailable: the feed still works for this session */
    }
  }

  /* ---------------- derived ---------------- */
  function entriesFor(caseId) {
    return state.entries.filter(function (e) { return e.caseId === caseId; });
  }
  function sumOf(list) {
    return list.reduce(function (a, e) { return a + num(e.amount); }, 0);
  }
  function caseById(id) {
    for (var i = 0; i < CASES.length; i++) if (CASES[i].id === id) return CASES[i];
    return null;
  }
  function caseRaised(c) {
    return Math.min(c.target, c.raised + sumOf(entriesFor(c.id)));
  }
  function caseRemaining(c) {
    return Math.max(0, c.target - caseRaised(c));
  }
  function userTotal() { return sumOf(state.entries); }
  function completedCaseIds() {
    return CASES.filter(function (c) { return caseRemaining(c) <= 0; }).map(function (c) { return c.id; });
  }
  function metrics() {
    return {
      amount: BASE.totalRelief + userTotal(),
      households: BASE.households + completedCaseIds().length,
      sponsors: BASE.sponsors + (state.entries.length > 0 ? 1 : 0)
    };
  }
  function myNickname(e) {
    return (e && e.nickname) ? e.nickname : t('js.certDefaultName');
  }

  /* ---------------- honor tiers ---------------- */
  var TIERS = [
    { key: 'SOVEREIGN', min: 1000000000 },
    { key: 'PATRON', min: 100000000 },
    { key: 'LAUREATE', min: 10000000 },
    { key: 'HONOR', min: 0 }
  ];
  function tierOf(amount) {
    var v = num(amount);
    for (var i = 0; i < TIERS.length; i++) {
      if (v >= TIERS[i].min) return TIERS[i];
    }
    return TIERS[TIERS.length - 1];
  }
  function tierTitle(tier) {
    return t('tier.title' + tier.key.charAt(0) + tier.key.slice(1).toLowerCase());
  }

  function myPlates() {
    var groups = {};
    state.entries.forEach(function (e) {
      var key = myNickname(e);
      if (!groups[key]) {
        groups[key] = { id: 'me-' + key, type: 'person', mine: true, name: key, amount: 0, count: 0, joined: e.at, message: e.message, title: '' };
      }
      groups[key].amount += num(e.amount);
      groups[key].count += 1;
      if (new Date(e.at) >= new Date(groups[key].joined)) {
        groups[key].joined = e.at;
        if (e.message) groups[key].message = e.message;
      }
    });
    return Object.keys(groups).map(function (k) {
      groups[k].title = t('js.myPlate');
      return groups[k];
    });
  }

  /* ---------------- animation ---------------- */
  function animateNumber(node, from, to, format) {
    if (!node) return;
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || from === to) {
      node.textContent = format(to);
      return;
    }
    var start = null;
    var dur = 850;
    function step(ts) {
      if (start === null) start = ts;
      var p = clamp((ts - start) / dur, 0, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      node.textContent = format(from + (to - from) * eased);
      if (p < 1) window.requestAnimationFrame(step);
      else node.textContent = format(to);
    }
    window.requestAnimationFrame(step);
  }

  /* ---------------- impact ---------------- */
  function renderImpact(bump) {
    var m = metrics();
    var amountEl = $('#stat-amount');
    var householdsEl = $('#stat-households');
    var sponsorsEl = $('#stat-sponsors');

    animateNumber(amountEl, ui.shown.amount, m.amount, function (v) { return fmtMoney(v); });
    animateNumber(householdsEl, ui.shown.households, m.households, function (v) { return fmtCount(v); });
    animateNumber(sponsorsEl, ui.shown.sponsors, m.sponsors, function (v) { return fmtCount(v); });

    if (bump) {
      [amountEl, householdsEl, sponsorsEl].forEach(function (el) {
        el.classList.remove('is-bump');
        void el.offsetWidth;
        el.classList.add('is-bump');
      });
    }
    ui.shown = { amount: m.amount, households: m.households, sponsors: m.sponsors };

    var myTotalVal = userTotal();
    $('#stat-amount-sub').textContent = myTotalVal > 0
      ? t('impact.sub1Mine', { money: fmtMoney(myTotalVal) })
      : t('impact.sub1');
    var doneCount = completedCaseIds().length;
    $('#stat-households-sub').textContent = doneCount > 0
      ? t('impact.sub2Mine', { n: fmtCount(doneCount) })
      : t('impact.sub2');
    $('#stat-sponsors-sub').textContent = state.entries.length > 0
      ? t('impact.sub3Mine')
      : t('impact.sub3');
  }

  /* ---------------- honor wall ---------------- */
  function hallRows() {
    var rows = SPONSORS.map(function (s) {
      return {
        id: s.id, type: s.type,
        name: pick(s, 'name'), title: pick(s, 'title'),
        amount: s.amount, count: s.count, joined: s.joined,
        message: pick(s, 'message'),
        badges: [pick(s, 'badge'), pick(s, 'badge2')].filter(Boolean),
        mine: false
      };
    }).concat(myPlates());
    return rows;
  }
  function rankMap(rows) {
    var sorted = rows.slice().sort(function (a, b) {
      if (b.amount !== a.amount) return b.amount - a.amount;
      return new Date(a.joined) - new Date(b.joined);
    });
    var map = {};
    sorted.forEach(function (r, i) { map[r.id] = i + 1; });
    return map;
  }

  function renderHall() {
    var list = $('#hall-list');
    var rows = hallRows();
    var ranks = rankMap(rows);
    var f = ui.hallFilter;
    var visible;

    if (f === 'recent') {
      visible = rows.slice().sort(function (a, b) { return new Date(b.joined) - new Date(a.joined); });
    } else {
      visible = rows.filter(function (r) {
        if (f === 'corp') return r.type === 'corp';
        if (f === 'person') return r.type === 'person';
        return true;
      }).sort(function (a, b) {
        if (b.amount !== a.amount) return b.amount - a.amount;
        return new Date(a.joined) - new Date(b.joined);
      });
    }

    list.textContent = '';
    if (!visible.length) {
      var empty = h('div', 'empty');
      empty.appendChild(h('strong', null, t('js.emptyHallTitle')));
      empty.appendChild(document.createTextNode(t('js.emptyHallText')));
      list.appendChild(empty);
    } else {
      visible.forEach(function (row) {
        list.appendChild(plaqueCard(row, ranks[row.id], f === 'recent'));
      });
    }

    $('#hall-count').textContent = t('js.hallCount', { n: fmtCount(rows.length) });

    var mineWrap = $('#hall-mine');
    var mineCard = $('#hall-mine-card');
    mineCard.textContent = '';
    var plates = myPlates();
    if (plates.length && f !== 'corp') {
      plates.sort(function (a, b) { return b.amount - a.amount; });
      mineCard.appendChild(plaqueCard(plates[0], ranks[plates[0].id], false, true));
      mineWrap.hidden = false;
    } else {
      mineWrap.hidden = true;
    }
  }

  function plaqueCard(row, rank, recentFirst, pinned) {
    var isTop = rank <= 3 && !recentFirst;
    var card = h('button', 'plaque' + (isTop ? ' plaque--top' : '') + (row.mine ? ' plaque--mine' : '') + (pinned ? ' plaque--pinned' : ''));
    card.type = 'button';
    card.setAttribute('aria-label', t('js.plaqueAria', { name: row.name }));

    var top = h('div', 'plaque__top');
    var rankWrap = h('span', 'rank');
    var medal = h('span', 'rank__medal' + (rank === 1 ? '' : rank === 2 ? ' rank__medal--silver' : rank === 3 ? ' rank__medal--bronze' : ' rank__medal--plain'), String(rank));
    rankWrap.appendChild(medal);
    rankWrap.appendChild(document.createTextNode(isTop ? (rank === 1 ? 'GOLD' : rank === 2 ? 'SILVER' : 'BRONZE') : t('js.rank')));
    top.appendChild(rankWrap);

    var badges = h('span', 'plaque__badges');
    var tier = tierOf(row.amount);
    var tierBadge = h('span', 'badge badge--tier', tier.key);
    tierBadge.setAttribute('data-tier', tier.key);
    tierBadge.title = tierTitle(tier);
    badges.appendChild(tierBadge);
    if (row.mine) badges.appendChild(h('span', 'badge badge--gold', t('js.mine')));
    (row.badges || []).forEach(function (b) { badges.appendChild(h('span', 'badge', b)); });
    top.appendChild(badges);
    card.appendChild(top);

    var nameRow = h('p', 'plaque__name');
    nameRow.appendChild(document.createTextNode(row.name));
    nameRow.appendChild(h('span', 'plaque__type', row.type === 'corp' ? t('js.corp') : t('js.person')));
    card.appendChild(nameRow);
    if (row.title) card.appendChild(h('p', 'plaque__title', row.title));

    card.appendChild(h('p', 'plaque__amount', fmtMoney(row.amount)));
    card.appendChild(h('p', 'plaque__meta', t('js.cases', { n: fmtCount(row.count), date: fmtDate(row.joined) })));

    var msg = h('p', 'plaque__msg', row.message || t('js.noMsg'));
    card.appendChild(msg);

    var open = h('span', 'plaque__open');
    open.appendChild(document.createTextNode(t('js.openCert')));
    card.appendChild(open);

    card.addEventListener('click', function () {
      openCertificate({
        name: row.name,
        type: row.type,
        amount: row.amount,
        count: row.count,
        message: row.message,
        date: row.joined,
        rank: rank,
        serial: 'ZRD-2026-' + pad4(rank) + '-' + String(row.id).replace(/[^a-zA-Z0-9]/g, '').slice(-3).toUpperCase()
      });
    });
    return card;
  }
  function pad4(n) { return String(n).padStart(4, '0'); }

  /* ---------------- relief board ---------------- */
  function renderBoard() {
    var wrap = $('#case-list');
    wrap.textContent = '';
    var f = ui.boardFilter;
    var visible = CASES.filter(function (c) { return f === 'all' || c.cat === f; });

    visible.forEach(function (c) {
      wrap.appendChild(caseCard(c));
    });

    if (!visible.length) {
      var empty = h('div', 'empty');
      empty.appendChild(h('strong', null, t('js.emptyBoardTitle')));
      empty.appendChild(document.createTextNode(t('js.emptyBoardText')));
      wrap.appendChild(empty);
    }

    $('#board-count').textContent = t('js.boardCount', { n: fmtCount(visible.length) });
    var remainingAll = CASES.reduce(function (a, c) { return a + caseRemaining(c); }, 0);
    $('#board-remaining').textContent = fmtMoney(remainingAll);
    $('#board-myTotal').textContent = fmtMoney(userTotal());

    renderLedger();
  }

  function caseCard(c) {
    var raised = caseRaised(c);
    var remaining = caseRemaining(c);
    var pct = Math.round((raised / c.target) * 100);
    var done = remaining <= 0;

    var card = h('article', 'case' + (done ? ' is-done' : ''));
    card.dataset.caseId = c.id;

    var head = h('div', 'case__head');
    var cat = CAT_LABEL[c.cat];
    head.appendChild(h('span', 'tag tag--cat', cat ? (cat[LANG] || cat.ko) : 'Case'));
    if (c.urgency === 'urgent' && !done) head.appendChild(h('span', 'tag tag--urgent', t('js.urgent')));
    if (done) head.appendChild(h('span', 'tag tag--new', t('js.zeroed')));
    card.appendChild(head);

    card.appendChild(h('h3', 'case__title', pick(c, 'title')));
    card.appendChild(h('p', 'case__story', pick(c, 'story')));

    var org = h('p', 'case__org');
    org.appendChild(checkIcon());
    org.appendChild(document.createTextNode(pick(c, 'org')));
    card.appendChild(org);
    card.appendChild(h('p', 'case__household', pick(c, 'household')));

    if (done) {
      var stamp = h('div', 'stamp');
      stamp.appendChild(h('small', null, 'JUST'));
      stamp.appendChild(document.createTextNode('ZEROED'));
      card.appendChild(stamp);
    }

    var prog = h('div', 'progress');
    var pTop = h('div', 'progress__top');
    pTop.appendChild(h('span', null, done ? t('js.fundedDone') : t('js.funded')));
    pTop.appendChild(h('span', 'progress__pct', String(pct) + '%'));
    prog.appendChild(pTop);

    var bar = h('div', 'bar');
    bar.setAttribute('role', 'progressbar');
    bar.setAttribute('aria-valuemin', '0');
    bar.setAttribute('aria-valuemax', '100');
    bar.setAttribute('aria-valuenow', String(pct));
    bar.setAttribute('aria-label', t('js.progressAria', { title: pick(c, 'title') }));
    var fill = h('div', 'bar__fill');
    bar.appendChild(fill);
    prog.appendChild(bar);

    var dl = h('dl', 'amounts');
    dl.appendChild(amountItem(t('js.goal'), fmtMoney(c.target), false));
    dl.appendChild(amountItem(t('js.raised'), fmtMoney(raised), false));
    dl.appendChild(amountItem(t('js.remaining'), done ? fmtMoney(0) : fmtMoney(remaining), true));
    prog.appendChild(dl);
    card.appendChild(prog);

    var cta = h('div', 'case__cta');
    if (done) {
      var doneActions = h('div', 'case__done-actions');
      var certBtn = h('button', 'btn btn--primary', t('js.viewCert'));
      certBtn.type = 'button';
      certBtn.addEventListener('click', function () { openCaseCertificate(c); });
      var hallBtn = h('button', 'btn btn--ghost', t('js.honorWall'));
      hallBtn.type = 'button';
      hallBtn.addEventListener('click', function () { switchTab('hall'); });
      doneActions.appendChild(certBtn);
      doneActions.appendChild(hallBtn);
      cta.appendChild(doneActions);
    } else {
      var btn = h('button', 'btn btn--primary', t('js.zeroDebt'));
      btn.type = 'button';
      btn.dataset.openRelief = c.id;
      btn.addEventListener('click', function () { openRelief(c.id); });
      cta.appendChild(btn);
    }
    card.appendChild(cta);

    window.requestAnimationFrame(function () {
      fill.style.width = Math.min(100, pct) + '%';
    });
    return card;
  }

  function amountItem(label, value, isRemain) {
    var d = h('div');
    d.appendChild(h('dt', null, label));
    d.appendChild(h('dd', isRemain ? 'is-remain' : null, value));
    return d;
  }
  function checkIcon() {
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('aria-hidden', 'true');
    var p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    p.setAttribute('d', 'M20 6 9 17l-5-5');
    p.setAttribute('fill', 'none');
    p.setAttribute('stroke', 'currentColor');
    p.setAttribute('stroke-width', '2.6');
    p.setAttribute('stroke-linecap', 'round');
    p.setAttribute('stroke-linejoin', 'round');
    svg.appendChild(p);
    return svg;
  }

  function renderLedger() {
    var box = $('#ledger');
    var list = $('#ledger-list');
    list.textContent = '';
    var entries = state.entries.slice().sort(function (a, b) { return new Date(b.at) - new Date(a.at); });
    if (!entries.length) {
      box.hidden = true;
      return;
    }
    box.hidden = false;
    entries.forEach(function (e) {
      var c = caseById(e.caseId);
      var li = h('li');
      var left = h('span', 'l-title');
      left.appendChild(document.createTextNode(c ? pick(c, 'title') : t('js.deletedCase')));
      left.appendChild(h('small', null, myNickname(e) + ' · ' + fmtDateTime(e.at) + (e.message ? ' · “' + e.message + '”' : '')));
      li.appendChild(left);
      li.appendChild(h('span', 'l-amt', fmtMoney(e.amount)));
      list.appendChild(li);
    });
  }

  /* ---------------- community feed ---------------- */
  function catLabel(cat) {
    var c = COMMUNITY_CATS[cat];
    return c ? (c[LANG] || c.ko) : '';
  }
  function userComments(postId) {
    return community.comments[postId] || [];
  }
  function commentCount(row) {
    return row.comments.length;
  }
  function communityView() {
    var mine = community.posts.map(function (p) {
      return {
        id: p.id, cat: p.cat, mine: true, name: p.name, tier: p.tier, verified: false,
        title: p.title, body: p.body, at: p.at, baseRespect: 0,
        comments: userComments(p.id)
      };
    });
    var seeds = SEED_POSTS.map(function (p) {
      var list = (p.comments || []).map(function (c, i) {
        return { id: p.id + '-c' + i, name: pick(c, 'name'), body: pick(c, 'body'), at: c.at, seed: true };
      }).concat(userComments(p.id));
      return {
        id: p.id, cat: p.cat, mine: false, name: pick(p, 'name'), tier: p.tier || '',
        verified: !!p.verified, title: pick(p, 'title'), body: pick(p, 'body'),
        at: p.joined, baseRespect: num(p.respect), comments: list
      };
    });
    return mine.concat(seeds).sort(function (a, b) {
      var d = new Date(b.at) - new Date(a.at);
      return d !== 0 ? d : (a.mine === b.mine ? 0 : (a.mine ? -1 : 1));
    });
  }
  function respectCount(row) {
    return row.baseRespect + (community.respect[row.id] ? 1 : 0);
  }

  function renderCommunity() {
    var feed = $('#community-feed');
    if (!feed) return;
    var rows = communityView();
    var visible = rows.filter(function (r) { return ui.communityFilter === 'all' || r.cat === ui.communityFilter; });

    if (ui.communityFirstPaint && visible.length) {
      ui.communityOpen[visible[0].id] = true;
      ui.communityFirstPaint = false;
    }

    feed.textContent = '';
    if (!visible.length) {
      var empty = h('div', 'empty');
      empty.appendChild(h('strong', null, t('community.emptyTitle')));
      empty.appendChild(document.createTextNode(t('community.emptyText')));
      feed.appendChild(empty);
    } else {
      visible.forEach(function (row) { feed.appendChild(communityCard(row)); });
    }

    $('#community-count').textContent = t('js.communityCount', { n: fmtCount(visible.length) });
  }

  function communityCard(row) {
    var card = h('article', 'cpost' +
      (row.cat === 'patron' ? ' cpost--patron' : '') +
      (row.mine ? ' cpost--mine' : ''));
    card.dataset.postId = row.id;
    card.dataset.cat = row.cat;

    var head = h('div', 'cpost__head');
    var initial = (row.name || '').trim().charAt(0) || '·';
    head.appendChild(h('span', 'cpost__avatar', initial));

    var who = h('div', 'cpost__who');
    var nameRow = h('p', 'cpost__name');
    nameRow.appendChild(document.createTextNode(row.name));
    if (row.tier) {
      var tierBadge = h('span', 'badge badge--tier', row.tier);
      tierBadge.setAttribute('data-tier', row.tier);
      tierBadge.title = tierTitle(tierByKey(row.tier));
      nameRow.appendChild(tierBadge);
    } else if (row.cat === 'support') {
      nameRow.appendChild(h('span', 'badge badge--visitor', t('community.visitor')));
    }
    if (row.mine) nameRow.appendChild(h('span', 'badge badge--gold', t('js.mine')));
    who.appendChild(nameRow);

    var meta = h('p', 'cpost__meta');
    meta.appendChild(h('span', 'cpost__cat', catLabel(row.cat)));
    meta.appendChild(document.createTextNode(' · ' + fmtDateTime(row.at)));
    if (row.verified) meta.appendChild(h('span', 'tag tag--new cpost__verified', t('community.verified')));
    who.appendChild(meta);
    head.appendChild(who);
    card.appendChild(head);

    if (row.title) card.appendChild(h('h3', 'cpost__title', row.title));
    card.appendChild(h('p', 'cpost__body', row.body));

    var actions = h('div', 'cpost__actions');
    var respectBtn = h('button', 'respect-btn');
    respectBtn.type = 'button';
    respectBtn.dataset.respect = row.id;
    respectBtn.dataset.base = String(row.baseRespect);
    var on = !!community.respect[row.id];
    respectBtn.classList.toggle('is-on', on);
    respectBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
    respectBtn.setAttribute('aria-label', t('community.respect'));
    respectBtn.appendChild(h('span', 'respect-btn__icon', '✨'));
    respectBtn.appendChild(h('span', 'respect-btn__label', t('community.respect')));
    respectBtn.appendChild(h('b', 'respect-btn__count', fmtCount(respectCount(row))));
    respectBtn.addEventListener('click', function () { toggleRespect(row.id); });
    actions.appendChild(respectBtn);

    var commentBtn = h('button', 'comments-toggle');
    commentBtn.type = 'button';
    commentBtn.dataset.commentsToggle = row.id;
    var open = !!ui.communityOpen[row.id];
    commentBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    commentBtn.appendChild(h('span', 'comments-toggle__icon', '💬'));
    commentBtn.appendChild(h('span', 'comments-toggle__label', commentLabel(commentCount(row))));
    commentBtn.addEventListener('click', function () { toggleComments(row.id); });
    actions.appendChild(commentBtn);
    card.appendChild(actions);

    card.appendChild(commentsPanel(row, open));
    return card;
  }

  function tierByKey(key) {
    for (var i = 0; i < TIERS.length; i++) if (TIERS[i].key === key) return TIERS[i];
    return TIERS[TIERS.length - 1];
  }
  function commentLabel(n) {
    return t(n === 1 ? 'community.commentsOne' : 'community.comments', { n: fmtCount(n) });
  }

  function commentsPanel(row, open) {
    var panel = h('div', 'cpost__comments');
    panel.hidden = !open;
    panel.dataset.commentsPanel = row.id;

    var list = h('ul', 'clist');
    if (!row.comments.length) {
      list.appendChild(h('li', 'clist__empty', t('community.noComments')));
    } else {
      row.comments.forEach(function (c) {
        var li = h('li');
        var who = h('b');
        who.appendChild(document.createTextNode(c.name || t('community.visitor')));
        li.appendChild(who);
        li.appendChild(h('span', null, c.body));
        li.appendChild(h('time', null, fmtDateTime(c.at)));
        list.appendChild(li);
      });
    }
    panel.appendChild(list);

    var form = h('form', 'cform');
    form.dataset.commentForm = row.id;
    var nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.className = 'cform__name';
    nameInput.maxLength = 20;
    nameInput.autocomplete = 'off';
    nameInput.placeholder = t('community.commentNamePh');
    nameInput.setAttribute('aria-label', t('community.nameLabel'));
    var bodyInput = document.createElement('input');
    bodyInput.type = 'text';
    bodyInput.className = 'cform__body';
    bodyInput.maxLength = 200;
    bodyInput.autocomplete = 'off';
    bodyInput.placeholder = t('community.commentPh');
    bodyInput.setAttribute('aria-label', t('community.commentPh'));
    var submit = h('button', 'cform__submit', t('community.commentSubmit'));
    submit.type = 'submit';
    form.appendChild(nameInput);
    form.appendChild(bodyInput);
    form.appendChild(submit);
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      submitComment(row.id, nameInput, bodyInput);
    });
    panel.appendChild(form);
    return panel;
  }

  function toggleRespect(id) {
    if (community.respect[id]) delete community.respect[id];
    else community.respect[id] = true;
    saveCommunity();
    var on = !!community.respect[id];
    $$('[data-respect="' + id + '"]').forEach(function (btn) {
      btn.classList.toggle('is-on', on);
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
      var count = btn.querySelector('.respect-btn__count');
      if (count) count.textContent = fmtCount(num(btn.dataset.base) + (on ? 1 : 0));
    });
    toast(t(on ? 'community.respected' : 'community.respectedOff'), 'ok');
  }

  function toggleComments(id) {
    ui.communityOpen[id] = !ui.communityOpen[id];
    var btn = $('[data-comments-toggle="' + id + '"]');
    var panel = $('[data-comments-panel="' + id + '"]');
    if (btn) btn.setAttribute('aria-expanded', ui.communityOpen[id] ? 'true' : 'false');
    if (panel) {
      panel.hidden = !ui.communityOpen[id];
      if (!panel.hidden) {
        var bodyInput = panel.querySelector('.cform__body');
        if (bodyInput) { try { bodyInput.focus(); } catch (err) {} }
      }
    }
  }

  function submitComment(postId, nameInput, bodyInput) {
    var body = (bodyInput.value || '').trim();
    if (!body) {
      toast(t('community.commentError'));
      try { bodyInput.focus(); } catch (err) {}
      return;
    }
    var name = (nameInput.value || '').trim().slice(0, 20) || t('community.visitor');
    if (!community.comments[postId]) community.comments[postId] = [];
    community.comments[postId].push({
      id: uid(),
      name: name,
      body: body.slice(0, 200),
      at: new Date().toISOString()
    });
    saveCommunity();
    ui.communityOpen[postId] = true;
    renderCommunity();
    toast(t('community.commentPosted'), 'ok');
  }

  /* ---------------- community composer ---------------- */
  function setComposerOpen(open, focus) {
    var form = $('#community-composer');
    var btn = $('#community-write');
    if (!form) return;
    form.hidden = !open;
    if (btn) {
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      btn.hidden = !!open;
    }
    if (open) {
      var nameEl = $('#post-name');
      if (nameEl && !nameEl.value) nameEl.value = state.nickname || community.name || '';
      paintNameHint();
      if (focus && nameEl) {
        window.setTimeout(function () { try { nameEl.focus(); } catch (err) {} }, 80);
      }
    }
  }

  function paintNameHint() {
    var el = $('#post-name-help');
    if (!el) return;
    var name = ($('#post-name').value || '').trim();
    var plate = plateForName(name);
    if (plate) {
      el.textContent = t('community.nameLinked', { tier: tierOf(plate.amount).key });
      el.classList.add('is-linked');
    } else {
      el.textContent = t('community.nameHelp');
      el.classList.remove('is-linked');
    }
  }

  function plateForName(name) {
    if (!name) return null;
    var plates = myPlates();
    for (var i = 0; i < plates.length; i++) {
      if (plates[i].name === name) return plates[i];
    }
    return null;
  }

  function submitPost() {
    var bodyEl = $('#post-body');
    var errEl = $('#post-error');
    if (!bodyEl) return;
    var body = (bodyEl.value || '').trim();
    if (!body) {
      if (errEl) {
        errEl.textContent = t('community.errorBodyInline');
        errEl.hidden = false;
      }
      try { bodyEl.focus(); } catch (err) {}
      toast(t('community.errorBody'));
      return;
    }
    if (errEl) errEl.hidden = true;
    var form = $('#community-composer');
    var checked = form ? form.querySelector('input[name="post-cat"]:checked') : null;
    var cat = checked ? checked.value : 'support';
    var name = ($('#post-name').value || '').trim().slice(0, 20) || t('js.certDefaultName');
    var title = ($('#post-title').value || '').trim().slice(0, 80);
    var plate = plateForName(name);
    var post = {
      id: uid(),
      cat: COMMUNITY_CATS[cat] ? cat : 'support',
      name: name,
      title: title,
      body: body.slice(0, 400),
      tier: plate ? tierOf(plate.amount).key : '',
      at: new Date().toISOString()
    };
    community.posts.unshift(post);
    community.name = name;
    saveCommunity();

    bodyEl.value = '';
    $('#post-title').value = '';
    $('#post-count').textContent = '0';
    if (errEl) errEl.hidden = true;
    if (plate) ui.communityOpen[post.id] = true;
    ui.communityFilter = 'all';
    $$('[data-community-filter]').forEach(function (b) {
      var on = b.getAttribute('data-community-filter') === 'all';
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    renderCommunity();
    setComposerOpen(false);
    toast(t('community.posted'), 'ok');
  }

  function initCommunity() {
    var write = $('#community-write');
    var form = $('#community-composer');
    if (!write || !form) return;

    setComposerOpen(window.matchMedia('(min-width: 900px)').matches, false);

    write.addEventListener('click', function () {
      setComposerOpen(form.hidden, true);
    });
    $('#post-cancel').addEventListener('click', function () { setComposerOpen(false); });
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      submitPost();
    });

    var bodyEl = $('#post-body');
    bodyEl.addEventListener('input', function () {
      $('#post-count').textContent = String(bodyEl.value.length);
    });
    $('#post-name').addEventListener('input', paintNameHint);

    $$('[data-community-filter]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        ui.communityFilter = btn.getAttribute('data-community-filter');
        $$('[data-community-filter]').forEach(function (b) {
          var on = b === btn;
          b.classList.toggle('is-active', on);
          b.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
        renderCommunity();
      });
    });
  }

  /* ---------------- tabs & routing ---------------- */
  var TABS = ['hall', 'board', 'model', 'community'];
  function switchTab(name, opts) {
    if (TABS.indexOf(name) < 0) name = 'hall';
    ui.activeTab = name;
    TABS.forEach(function (tName) {
      var tab = $('#tab-' + tName);
      var panel = $('#panel-' + tName);
      var on = tName === name;
      tab.classList.toggle('is-active', on);
      tab.setAttribute('aria-selected', on ? 'true' : 'false');
      tab.tabIndex = on ? 0 : -1;
      panel.classList.toggle('is-active', on);
      panel.hidden = !on;
    });
    try {
      var url = window.location.pathname + window.location.search + '#' + name;
      history.replaceState(null, '', url);
    } catch (err) { /* file: ignores */ }
    if (opts && opts.scroll) {
      var panelEl = $('#panel-' + name);
      if (panelEl) {
        var offset = window.innerWidth <= 760 ? 74 : 118;
        var y = panelEl.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
      }
    }
  }

  /* ---------------- modals ---------------- */
  var FOCUSABLE = 'button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])';

  function openModal(id) {
    var m = document.getElementById(id);
    if (!m) return;
    ui.lastFocused = document.activeElement;
    m.hidden = false;
    ui.openModal = id;
    document.body.style.overflow = 'hidden';
    var focusable = m.querySelectorAll(FOCUSABLE);
    if (focusable.length) {
      var first = m.querySelector('[data-autofocus]') || focusable[0];
      window.setTimeout(function () { try { first.focus(); } catch (err) {} }, 40);
    }
  }
  function closeModal(id) {
    var m = document.getElementById(id);
    if (!m) return;
    m.hidden = true;
    if (ui.openModal === id) ui.openModal = null;
    document.body.style.overflow = '';
    if (ui.lastFocused && document.contains(ui.lastFocused)) {
      try { ui.lastFocused.focus(); } catch (err) {}
    }
  }
  function closeAllModals() {
    ['cert-modal', 'relief-modal', 'confirm-modal'].forEach(function (id) {
      var m = document.getElementById(id);
      if (m && !m.hidden) closeModal(id);
    });
  }

  document.addEventListener('keydown', function (ev) {
    if (ev.key === 'Escape') {
      if (!$('#complete-overlay').hidden) { $('#complete-overlay').hidden = true; document.body.style.overflow = ''; return; }
      if ($('#cert-modal').hidden && $('#relief-modal').hidden && $('#confirm-modal').hidden) return;
      var id = !$('#confirm-modal').hidden ? 'confirm-modal' : !$('#relief-modal').hidden ? 'relief-modal' : 'cert-modal';
      closeModal(id);
      return;
    }
    if (ev.key === 'Tab' && ui.openModal) {
      var m = document.getElementById(ui.openModal);
      var items = Array.prototype.filter.call(m.querySelectorAll(FOCUSABLE), function (el) {
        return !el.disabled && el.offsetParent !== null;
      });
      if (!items.length) return;
      var first = items[0];
      var last = items[items.length - 1];
      if (ev.shiftKey && document.activeElement === first) { ev.preventDefault(); last.focus(); }
      else if (!ev.shiftKey && document.activeElement === last) { ev.preventDefault(); first.focus(); }
    }
  });

  document.addEventListener('click', function (ev) {
    var closer = ev.target.closest('[data-close]');
    if (closer) {
      var key = closer.getAttribute('data-close');
      closeModal(key === 'cert' ? 'cert-modal' : key === 'relief' ? 'relief-modal' : 'confirm-modal');
      return;
    }
    var langBtn = ev.target.closest('[data-set-lang]');
    if (langBtn) {
      setLang(langBtn.getAttribute('data-set-lang'));
      return;
    }
    var goto = ev.target.closest('[data-goto]');
    if (goto) {
      switchTab(goto.getAttribute('data-goto'), { scroll: true });
    }
  });

  /* ---------------- relief flow ---------------- */
  function openRelief(caseId) {
    var c = caseById(caseId);
    if (!c) return;
    var remaining = caseRemaining(c);
    if (remaining <= 0) {
      toast(t('js.removeTitle'));
      return;
    }
    ui.activeCase = c;
    $('#relief-case').textContent = pick(c, 'title');
    $('#relief-remain').textContent = fmtMoney(remaining);

    var nick = $('#relief-nickname');
    nick.value = state.nickname || '';
    var msg = $('#relief-message');
    msg.value = '';
    $('#msg-count').textContent = '0';

    buildAmounts(remaining);
    openModal('relief-modal');
  }

  function presetsFor(remaining) {
    if (LANG === 'en') {
      return [
        { value: Math.round(150 * RATE), label: t('js.amount1') },
        { value: Math.round(500 * RATE), label: t('js.amount2') },
        { value: Math.round(1000 * RATE), label: t('js.amount3') }
      ];
    }
    return [
      { value: 100000, label: t('js.amount1') },
      { value: 500000, label: t('js.amount2') },
      { value: 1000000, label: t('js.amount3') }
    ];
  }
  function defaultAmount(remaining) {
    var third = presetsFor(remaining)[2].value;
    return remaining <= third * 3 ? remaining : third;
  }

  function buildAmounts(remaining) {
    var grid = $('#amount-grid');
    grid.textContent = '';
    var presets = presetsFor(remaining);
    presets.forEach(function (p) {
      var b = h('button', 'amount-btn', p.label);
      b.type = 'button';
      b.dataset.amount = String(p.value);
      b.setAttribute('aria-pressed', 'false');
      if (p.value > remaining) {
        b.disabled = true;
        b.title = t('js.tooBig');
      }
      b.addEventListener('click', function () { selectAmount(p.value); });
      grid.appendChild(b);
    });
    var all = h('button', 'amount-btn amount-btn--all', t('js.amountAll', { money: fmtMoney(remaining) }));
    all.type = 'button';
    all.dataset.amount = String(remaining);
    all.setAttribute('aria-pressed', 'false');
    all.addEventListener('click', function () { selectAmount(remaining); });
    grid.appendChild(all);

    ui.selectedAmount = defaultAmount(remaining);
    highlightAmount();
  }

  function selectAmount(v) {
    ui.selectedAmount = v;
    highlightAmount();
  }
  function highlightAmount() {
    $$('#amount-grid .amount-btn').forEach(function (b) {
      var on = Number(b.dataset.amount) === ui.selectedAmount;
      b.classList.toggle('is-selected', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }

  function submitRelief() {
    var c = ui.activeCase;
    if (!c) return;
    var remaining = caseRemaining(c);
    var amount = Math.min(ui.selectedAmount, remaining);
    if (!amount || amount <= 0) {
      toast(t('js.pickAmount'));
      return;
    }
    var nickInput = $('#relief-nickname');
    var nickname = (nickInput.value || '').trim().slice(0, 20) || t('js.certDefaultName');
    var msgInput = $('#relief-message');
    var message = (msgInput.value || '').trim().slice(0, 60);

    var entry = {
      id: uid(),
      caseId: c.id,
      amount: amount,
      nickname: nickname,
      message: message,
      at: new Date().toISOString()
    };
    state.entries.push(entry);
    state.nickname = nickname;
    saveState();

    closeModal('relief-modal');
    renderAll(true);

    var done = caseRemaining(c) <= 0;
    var plate = myPlates().filter(function (p) { return p.name === nickname; })[0];
    var rank = plate ? rankMap(hallRows())[plate.id] : null;

    toast(t('js.plateToast', { name: nickname }), 'ok');

    if (done) {
      window.setTimeout(function () {
        showComplete(c, amount, message, rank);
      }, 420);
    }
  }

  function showComplete(c, amount, message, rank) {
    ui.lastComplete = { caseId: c.id, amount: amount, message: message, rank: rank };
    paintComplete();
    var overlay = $('#complete-overlay');
    overlay.hidden = false;
    document.body.style.overflow = 'hidden';
    var btn = $('#complete-cert');
    btn.onclick = function () {
      overlay.hidden = true;
      document.body.style.overflow = '';
      openCaseCertificate(c, rank);
    };
    $('#complete-close').onclick = function () {
      overlay.hidden = true;
      document.body.style.overflow = '';
    };
  }
  function paintComplete() {
    var lc = ui.lastComplete;
    if (!lc) return;
    var c = caseById(lc.caseId);
    $('#complete-case').textContent = c
      ? t('js.completeAmount', { title: pick(c, 'title'), money: fmtMoney(lc.amount) })
      : '';
    $('#complete-msg').textContent = lc.message || t('js.completeMsg');
  }

  /* ---------------- certificate ---------------- */
  function openCaseCertificate(c, rankHint) {
    var entries = entriesFor(c.id);
    var mine = entries.slice().sort(function (a, b) { return new Date(b.at) - new Date(a.at); })[0];
    var nickname = mine ? myNickname(mine) : t('js.certDefaultName');
    var amount = sumOf(entries);
    var plate = myPlates().filter(function (p) { return p.name === nickname; })[0];
    var rank = rankHint || (plate ? rankMap(hallRows())[plate.id] : null);
    openCertificate({
      name: nickname,
      type: 'person',
      amount: amount,
      count: entries.length,
      message: mine ? mine.message : '',
      date: mine ? mine.at : new Date().toISOString(),
      rank: rank,
      serial: 'ZRD-2026-' + pad4(rank || 0) + '-' + String(c.id).toUpperCase()
    }, c.id);
  }

  function openCertificate(data, caseId) {
    ui.lastCert = { data: data, caseId: caseId || null };
    paintCertificate();
    openModal('cert-modal');
  }

  function paintCertificate() {
    var lc = ui.lastCert;
    if (!lc) return;
    var data = lc.data;
    var c = lc.caseId ? caseById(lc.caseId) : null;
    $('#cert-name').textContent = data.name;
    var tier = tierOf(data.amount);
    var tierEl = $('#cert-tier');
    tierEl.textContent = tier.key;
    tierEl.setAttribute('data-tier', tier.key);
    tierEl.setAttribute('aria-label', t('cert.tierAria', { tier: tier.key }));
    tierEl.title = tierTitle(tier);
    $('#cert-amount').textContent = t('js.certAmount', { money: fmtMoney(data.amount) });
    $('#cert-msg').textContent = data.message ? '“' + data.message + '”' : '';
    $('#cert-rank').textContent = data.rank ? t('js.certRank', { n: data.rank }) : t('js.certRankNone');
    $('#cert-count').textContent = t(data.count === 1 ? 'js.certCountOne' : 'js.certCount', { n: fmtCount(data.count) });
    $('#cert-date').textContent = fmtDate(data.date);
    $('#cert-serial').textContent = data.serial;
    $('#cert-title').textContent = c ? t('cert.titleCase') : t('cert.title');

    var shareBtn = $('#cert-share');
    shareBtn.onclick = function () { shareCert(data); };

    var saveBtn = $('#cert-save');
    if (saveBtn) saveBtn.onclick = function () { downloadHonorCard(data); };
  }

  function shareCert(data) {
    var isDefaultName = !data.name || data.name === t('js.certDefaultName') ||
      data.name === I18N.ko['js.certDefaultName'] || data.name === I18N.en['js.certDefaultName'];
    var key = isDefaultName ? 'js.shareText' : 'js.shareTextNamed';
    var text = t(key, { name: data.name, money: fmtMoney(data.amount) });
    var url = window.location.href.split('#')[0];
    var payload = text + ' ' + url;

    if (navigator.share) {
      navigator.share({ title: t('js.shareTitle'), text: text, url: url }).then(function () {
        /* shared */
      }).catch(function () {
        copyText(payload);
      });
      return;
    }
    copyText(payload);
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        toast(t('js.copied'), 'ok');
      }).catch(function () {
        legacyCopy(text);
      });
      return;
    }
    legacyCopy(text);
  }
  function legacyCopy(text) {
    try {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      toast(t('js.copied'), 'ok');
    } catch (err) {
      toast(t('js.copyBlocked'));
    }
  }

  /* ---------------- honor card · canvas PNG ---------------- */
  var CARD_W = 1200;
  var CARD_H = 750;
  var CARD_IVORY = '#f7f2e6';
  var CARD_GOLD = '#c9a349';
  var CARD_GOLD_BRIGHT = '#eddb9f';
  var logoPromise = null;

  function loadLogoImage() {
    if (!logoPromise) {
      logoPromise = new Promise(function (resolve) {
        var img = new Image();
        img.onload = function () { resolve(img); };
        img.onerror = function () { resolve(null); };
        img.src = './assets/img/logo-monogram.png';
      });
    }
    return logoPromise;
  }
  function setFont(ctx, spec, spacing) {
    ctx.font = spec;
    try { ctx.letterSpacing = (spacing || 0) + 'px'; } catch (err) {}
  }
  function fitFont(ctx, text, maxWidth, weight, maxSize, family, spacing) {
    var size = maxSize;
    while (size > 14) {
      setFont(ctx, weight + ' ' + size + 'px ' + family, spacing);
      if (ctx.measureText(text).width <= maxWidth) break;
      size -= 2;
    }
    return size;
  }
  function cardTokens(ctx, text, maxWidth) {
    var words = String(text).split(/\s+/).filter(Boolean);
    var out = [];
    words.forEach(function (w) {
      if (ctx.measureText(w).width <= maxWidth) { out.push(w); return; }
      var buf = '';
      for (var i = 0; i < w.length; i++) {
        var t2 = buf + w.charAt(i);
        if (buf && ctx.measureText(t2).width > maxWidth) { out.push(buf); buf = w.charAt(i); }
        else buf = t2;
      }
      if (buf) out.push(buf);
    });
    return out;
  }
  function wrapText(ctx, text, maxWidth, maxLines) {
    var tokens = cardTokens(ctx, text, maxWidth);
    var lines = [];
    var line = '';
    var idx = 0;
    for (; idx < tokens.length; idx++) {
      var test = line ? line + ' ' + tokens[idx] : tokens[idx];
      if (!line || ctx.measureText(test).width <= maxWidth) {
        line = test;
      } else {
        lines.push(line);
        line = tokens[idx];
        if (lines.length === maxLines - 1) { idx += 1; break; }
      }
    }
    if (line) lines.push(line);
    if (idx < tokens.length) {
      var last = lines[lines.length - 1];
      while (last.length > 4 && ctx.measureText(last + ' …').width > maxWidth) last = last.slice(0, -1);
      lines[lines.length - 1] = last.replace(/[\s,.;:]+$/, '') + ' …';
    }
    return lines.slice(0, maxLines);
  }
  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function drawHonorCard(ctx, data, logo) {
    var W = CARD_W;
    var H = CARD_H;
    var tier = tierOf(data.amount);
    var name = String(data.name || t('card.noName'));
    var quote = String(data.message || t('card.noMessage'));
    var serial = String(data.serial || 'ZRD-2026-0000');

    var base = ctx.createLinearGradient(0, 0, W, H);
    base.addColorStop(0, '#131118');
    base.addColorStop(0.55, '#0b0a0e');
    base.addColorStop(1, '#07060a');
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, W, H);

    var glow = ctx.createRadialGradient(W * 0.2, -90, 40, W * 0.2, -90, 800);
    glow.addColorStop(0, 'rgba(201,163,73,0.26)');
    glow.addColorStop(0.42, 'rgba(201,163,73,0.08)');
    glow.addColorStop(1, 'rgba(201,163,73,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);

    var glow2 = ctx.createRadialGradient(W * 0.94, H * 1.08, 20, W * 0.94, H * 1.08, 640);
    glow2.addColorStop(0, 'rgba(120,96,160,0.12)');
    glow2.addColorStop(1, 'rgba(120,96,160,0)');
    ctx.fillStyle = glow2;
    ctx.fillRect(0, 0, W, H);

    ctx.save();
    ctx.globalAlpha = 0.045;
    ctx.strokeStyle = CARD_IVORY;
    ctx.lineWidth = 1;
    for (var gx = -H; gx < W; gx += 26) {
      ctx.beginPath();
      ctx.moveTo(gx, H);
      ctx.lineTo(gx + H, 0);
      ctx.stroke();
    }
    ctx.restore();

    roundRect(ctx, 34, 34, W - 68, H - 68, 6);
    ctx.strokeStyle = 'rgba(201,163,73,0.55)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    roundRect(ctx, 46, 46, W - 92, H - 92, 3);
    ctx.strokeStyle = 'rgba(201,163,73,0.22)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.strokeStyle = 'rgba(237,219,159,0.72)';
    ctx.lineWidth = 2;
    [[46, 46, 1, 1], [W - 46, 46, -1, 1], [46, H - 46, 1, -1], [W - 46, H - 46, -1, -1]].forEach(function (c) {
      ctx.beginPath();
      ctx.moveTo(c[0], c[1] + 26 * c[3]);
      ctx.lineTo(c[0], c[1]);
      ctx.lineTo(c[0] + 26 * c[2], c[1]);
      ctx.stroke();
    });

    ctx.textBaseline = 'alphabetic';
    ctx.textAlign = 'left';

    if (logo) {
      ctx.drawImage(logo, 86, 72, 70, 92);
    } else {
      ctx.strokeStyle = 'rgba(201,163,73,0.6)';
      ctx.strokeRect(86, 72, 70, 92);
    }
    setFont(ctx, '600 30px "Cinzel", "Cormorant Garamond", serif', 9);
    ctx.fillStyle = CARD_IVORY;
    ctx.fillText('ZEROED', 172, 116);
    setFont(ctx, '500 11px "Cinzel", "Cormorant Garamond", serif', 4.4);
    ctx.fillStyle = 'rgba(201,163,73,0.9)';
    ctx.fillText('THE PRIVATE HONOR LEDGER', 173, 139);

    ctx.textAlign = 'right';
    setFont(ctx, '500 10px "Cinzel", serif', 4);
    ctx.fillStyle = 'rgba(201,163,73,0.68)';
    ctx.fillText(t('card.tierLabel'), W - 86, 104);
    var tierSize = fitFont(ctx, tier.key, 300, '600', 34, '"Cinzel", serif', 7);
    setFont(ctx, '600 ' + tierSize + 'px "Cinzel", serif', 7);
    ctx.fillStyle = CARD_GOLD_BRIGHT;
    ctx.fillText(tier.key, W - 86, 144);

    var div = ctx.createLinearGradient(86, 0, W - 86, 0);
    div.addColorStop(0, 'rgba(201,163,73,0)');
    div.addColorStop(0.5, 'rgba(201,163,73,0.5)');
    div.addColorStop(1, 'rgba(201,163,73,0)');
    ctx.fillStyle = div;
    ctx.fillRect(86, 186, W - 172, 1);

    ctx.textAlign = 'left';
    setFont(ctx, '600 11px "Cinzel", serif', 6);
    ctx.fillStyle = 'rgba(201,163,73,0.92)';
    ctx.fillText(t('card.kicker'), 86, 236);

    var nameSize = fitFont(ctx, name, W - 172, '700', 58, '"Noto Serif KR", "Cinzel", "Cormorant Garamond", serif', 0);
    setFont(ctx, '700 ' + nameSize + 'px "Noto Serif KR", "Cinzel", "Cormorant Garamond", serif', 0);
    ctx.fillStyle = CARD_IVORY;
    ctx.fillText(name, 86, 318);

    var amountText = fmtMoney(data.amount);
    var amountSize = fitFont(ctx, amountText, 720, '600', 40, '"Cinzel", "Noto Serif KR", serif', 0);
    setFont(ctx, '600 ' + amountSize + 'px "Cinzel", "Noto Serif KR", serif', 0);
    ctx.fillStyle = CARD_GOLD_BRIGHT;
    ctx.fillText(amountText, 86, 382);

    ctx.fillStyle = 'rgba(201,163,73,0.6)';
    ctx.fillRect(86, 412, 64, 2);

    setFont(ctx, '400 23px "Noto Serif KR", "Cormorant Garamond", serif', 0);
    ctx.fillStyle = 'rgba(247,242,230,0.8)';
    var quoteLines = wrapText(ctx, '“' + quote + '”', W - 300, 2);
    quoteLines.forEach(function (line, i) {
      ctx.fillText(line, 86, 462 + i * 36);
    });

    setFont(ctx, '500 9px "Cinzel", serif', 3.4);
    ctx.fillStyle = 'rgba(201,163,73,0.65)';
    ctx.fillText(t('card.serialLabel'), 86, 566);
    var serialSize = fitFont(ctx, serial, W - 340, '500', 21, '"Cinzel", serif', 2.6);
    setFont(ctx, '500 ' + serialSize + 'px "Cinzel", serif', 2.6);
    ctx.fillStyle = 'rgba(247,242,230,0.92)';
    ctx.fillText(serial, 86, 596);
    setFont(ctx, '400 12px "Noto Serif KR", "Cormorant Garamond", serif', 1.2);
    ctx.fillStyle = 'rgba(247,242,230,0.45)';
    ctx.fillText(fmtDate(data.date), 86, 624);

    var sx = W - 158;
    var sy = 590;
    ctx.beginPath();
    ctx.arc(sx, sy, 58, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(201,163,73,0.7)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(sx, sy, 50, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(201,163,73,0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.textAlign = 'center';
    setFont(ctx, '600 15px "Cinzel", serif', 2.4);
    ctx.fillStyle = 'rgba(237,219,159,0.92)';
    ctx.fillText('ZEROED', sx, sy + 1);
    setFont(ctx, '500 7px "Cinzel", serif', 1.8);
    ctx.fillStyle = 'rgba(201,163,73,0.8)';
    ctx.fillText('EST. 2026', sx, sy + 19);

    ctx.textAlign = 'center';
    setFont(ctx, '500 9px "Cinzel", serif', 3.2);
    ctx.fillStyle = 'rgba(247,242,230,0.3)';
    ctx.fillText(t('card.demo'), W / 2, 676);
    ctx.textAlign = 'left';
    return ctx;
  }

  function buildHonorCardCanvas(data) {
    var canvas = document.createElement('canvas');
    canvas.width = CARD_W;
    canvas.height = CARD_H;
    var ctx = canvas.getContext('2d');
    var name = String(data.name || t('card.noName'));
    var jobs = [loadLogoImage()];
    if (document.fonts && document.fonts.load) {
      ['600 30px "Cinzel"', '700 58px "Noto Serif KR"', '400 23px "Noto Serif KR"'].forEach(function (spec) {
        try {
          jobs.push(document.fonts.load(spec, name + ' ZEROED 가나다').catch(function () {}));
        } catch (err) {}
      });
    }
    if (document.fonts && document.fonts.ready) {
      jobs.push(document.fonts.ready.catch(function () {}));
    }
    return Promise.all(jobs).then(function (out) {
      drawHonorCard(ctx, data, out[0]);
      return canvas;
    });
  }

  function downloadHonorCard(data) {
    var btn = $('#cert-save');
    if (btn && btn.disabled) return;
    var original = btn ? btn.textContent : '';
    if (btn) {
      btn.disabled = true;
      btn.textContent = t('cert.saving');
    }
    function restore() {
      if (!btn) return;
      btn.disabled = false;
      btn.textContent = original || t('cert.save');
    }
    buildHonorCardCanvas(data).then(function (canvas) {
      return new Promise(function (resolve, reject) {
        canvas.toBlob(function (blob) {
          if (!blob) { reject(new Error('empty blob')); return; }
          var serial = String(data.serial || 'ZRD-2026').replace(/[^A-Za-z0-9._-]/g, '');
          var url = URL.createObjectURL(blob);
          var a = document.createElement('a');
          a.href = url;
          a.download = 'ZEROED_Honor_Card_' + serial + '.png';
          a.rel = 'noopener';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.setTimeout(function () { URL.revokeObjectURL(url); }, 8000);
          resolve(blob);
        }, 'image/png');
      });
    }).then(function () {
      toast(t('card.saved'), 'ok');
      restore();
    }).catch(function () {
      toast(t('card.failed'));
      restore();
    });
  }

  /* ---------------- toast ---------------- */
  function toast(message, kind) {
    var box = $('#toasts');
    var el = h('div', 'toast' + (kind === 'ok' ? ' toast--ok' : ''), message);
    box.appendChild(el);
    window.setTimeout(function () {
      el.classList.add('is-out');
      window.setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 320);
    }, 2600);
  }

  /* ---------------- simulator ---------------- */
  var SIM_COST = 90000000;
  var simReady = false;
  function initSim() {
    var campEl = $('#sim-campaigns');
    var budgetEl = $('#sim-budget');
    var subsEl = $('#sim-subs');
    if (!campEl || !budgetEl || !subsEl) return;

    [campEl, budgetEl, subsEl].forEach(function (el) {
      el.addEventListener('input', renderSim);
      el.addEventListener('change', renderSim);
    });
    simReady = true;
    renderSim();
  }
  function updateTrack(el) {
    var min = Number(el.min), max = Number(el.max), v = Number(el.value);
    var pct = max > min ? ((v - min) / (max - min)) * 100 : 0;
    el.style.setProperty('--fill', pct + '%');
  }
  function renderSim() {
    if (!simReady) return;
    var campEl = $('#sim-campaigns');
    var budgetEl = $('#sim-budget');
    var subsEl = $('#sim-subs');
    var camp = Number(campEl.value);
    var budget = Number(budgetEl.value);
    var subs = Number(subsEl.value);

    var relief = camp * budget;
    var fee = relief * 0.15;
    var saas = subs * 2500000;
    var traffic = camp * 1800000;
    var revenue = fee + saas + traffic;
    var profit = revenue - SIM_COST;
    var ratio = relief > 0 ? (revenue / relief) * 100 : 0;

    $('#sim-campaigns-out').textContent = t('js.simCamp', { n: fmtCount(camp) });
    $('#sim-budget-out').textContent = fmtMoney(budget);
    $('#sim-subs-out').textContent = t('js.simSubs', { n: fmtCount(subs) });
    $('#sim-relief').textContent = fmtMoney(relief);
    $('#sim-fee').textContent = fmtMoney(fee);
    $('#sim-saas').textContent = fmtMoney(saas);
    $('#sim-traffic').textContent = fmtMoney(traffic);
    $('#sim-revenue').textContent = fmtMoney(revenue);
    $('#sim-year').textContent = fmtMoney(revenue * 12);
    $('#sim-cost').textContent = fmtMoney(SIM_COST);
    $('#sim-profit').textContent = (profit >= 0 ? '' : '-') + fmtMoney(Math.abs(profit));
    $('#sim-ratio').textContent = ratio.toFixed(1) + '%';

    [campEl, budgetEl, subsEl].forEach(updateTrack);
  }

  /* ---------------- language switch: refresh open views ---------------- */
  function refreshOpen() {
    if (!$('#relief-modal').hidden && ui.activeCase) {
      var c = ui.activeCase;
      var remaining = caseRemaining(c);
      $('#relief-case').textContent = pick(c, 'title');
      $('#relief-remain').textContent = fmtMoney(remaining);
      var keep = ui.selectedAmount;
      buildAmounts(remaining);
      if (keep > 0 && keep <= remaining) {
        ui.selectedAmount = keep;
        highlightAmount();
      }
    }
    if (!$('#cert-modal').hidden) paintCertificate();
    if (!$('#complete-overlay').hidden) paintComplete();
  }

  /* ---------------- reset ---------------- */
  function initReset() {
    var btn = $('#reset-btn');
    if (btn) {
      btn.addEventListener('click', function () { openModal('confirm-modal'); });
    }
    var yes = $('#confirm-yes');
    if (yes) {
      yes.addEventListener('click', function () {
        state = { v: 1, entries: [], nickname: '' };
        community = { v: 1, posts: [], respect: {}, comments: {}, name: '' };
        ui.communityOpen = {};
        ui.communityFilter = 'all';
        $$('[data-community-filter]').forEach(function (b) {
          var on = b.getAttribute('data-community-filter') === 'all';
          b.classList.toggle('is-active', on);
          b.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
        try { window.localStorage.removeItem(STORE_KEY); } catch (err) {}
        try { window.localStorage.removeItem(COMMUNITY_KEY); } catch (err) {}
        closeModal('confirm-modal');
        renderAll(false);
        toast(t('js.resetDone'));
      });
    }
  }

  /* ---------------- render all ---------------- */
  function renderAll(bump) {
    renderImpact(bump);
    renderHall();
    renderBoard();
    renderCommunity();
  }

  /* ---------------- init ---------------- */
  function initTabs() {
    $$('.tab').forEach(function (tab) {
      tab.addEventListener('click', function () {
        switchTab(tab.getAttribute('data-tab'), { scroll: true });
      });
      tab.addEventListener('keydown', function (ev) {
        var idx = TABS.indexOf(tab.getAttribute('data-tab'));
        if (ev.key === 'ArrowRight' || ev.key === 'ArrowLeft') {
          ev.preventDefault();
          var next = (idx + (ev.key === 'ArrowRight' ? 1 : -1) + TABS.length) % TABS.length;
          var el = $('#tab-' + TABS[next]);
          if (el) { el.focus(); switchTab(TABS[next], { scroll: true }); }
        }
      });
    });

    $$('[data-hall-filter]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        ui.hallFilter = btn.getAttribute('data-hall-filter');
        $$('[data-hall-filter]').forEach(function (b) {
          var on = b === btn;
          b.classList.toggle('is-active', on);
          b.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
        renderHall();
      });
    });

    $$('[data-board-filter]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        ui.boardFilter = btn.getAttribute('data-board-filter');
        $$('[data-board-filter]').forEach(function (b) {
          var on = b === btn;
          b.classList.toggle('is-active', on);
          b.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
        renderBoard();
      });
    });

    var initial = (window.location.hash || '').replace('#', '');
    switchTab(TABS.indexOf(initial) >= 0 ? initial : 'hall', { scroll: false });
    window.addEventListener('hashchange', function () {
      var name = (window.location.hash || '').replace('#', '');
      if (TABS.indexOf(name) >= 0 && name !== ui.activeTab) switchTab(name, { scroll: true });
    });
  }

  function initMessages() {
    var msg = $('#relief-message');
    var counter = $('#msg-count');
    if (msg && counter) {
      msg.addEventListener('input', function () {
        counter.textContent = String(msg.value.length);
      });
    }
    var submit = $('#relief-submit');
    if (submit) submit.addEventListener('click', submitRelief);
  }

  document.addEventListener('DOMContentLoaded', function () {
    applyStatic();
    initTabs();
    initMessages();
    initSim();
    initReset();
    initCommunity();
    ui.shown = { amount: BASE.totalRelief, households: BASE.households, sponsors: BASE.sponsors };
    renderAll(false);
    document.documentElement.classList.remove('i18n-boot');
    registerSW();
  });

  function registerSW() {
    if (!('serviceWorker' in navigator)) return;
    if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') return;
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('./sw.js').catch(function () {
        /* registration failure does not affect the app */
      });
    });
  }

  /* tab labels follow the breakpoint when the window is resized */
  var resizeTimer = null;
  window.addEventListener('resize', function () {
    if (resizeTimer) window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(applyTabLabels, 120);
  });
})();
