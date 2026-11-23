/* =========================================================
   채움의 전당 · DEBT ZERO HALL — prototype app
   Vanilla JS · no build step · GitHub Pages friendly
   모든 데이터는 예시이며 실제 결제/송금/개인정보 전송은 없습니다.
   ========================================================= */
(function () {
  'use strict';

  var DATA = window.DZH_DATA;
  if (!DATA) return;

  var BASE = DATA.BASE;
  var SPONSORS = DATA.SPONSORS;
  var CASES = DATA.CASES;
  var CAT_LABEL = DATA.CATEGORY_LABEL;

  var STORE_KEY = 'dzh:v1';
  var state = loadState();

  var ui = {
    hallFilter: 'all',
    boardFilter: 'all',
    activeTab: 'hall',
    activeCase: null,
    selectedAmount: 0,
    lastFocused: null,
    openModal: null,
    shown: { amount: 0, households: 0, sponsors: 0 }
  };

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
  function fmtCount(n) { return Math.round(num(n)).toLocaleString('ko-KR'); }
  function fmtDate(iso) {
    var d = iso ? new Date(iso) : new Date();
    if (isNaN(d.getTime())) d = new Date();
    var mm = String(d.getMonth() + 1).padStart(2, '0');
    var dd = String(d.getDate()).padStart(2, '0');
    return d.getFullYear() + '.' + mm + '.' + dd;
  }
  function fmtDateTime(iso) {
    var d = iso ? new Date(iso) : new Date();
    if (isNaN(d.getTime())) d = new Date();
    return fmtDate(iso) + ' ' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
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
          nickname: String(e.nickname || '익명의 히어로').slice(0, 20),
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
      /* 저장 공간이 없거나 시크릿 모드인 경우: 시연은 계속 진행 */
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

  function myPlates() {
    var groups = {};
    state.entries.forEach(function (e) {
      var key = e.nickname || '익명의 히어로';
      if (!groups[key]) {
        groups[key] = { id: 'me-' + key, type: 'person', mine: true, name: key, amount: 0, count: 0, joined: e.at, message: e.message, title: '내 체험 명패' };
      }
      groups[key].amount += num(e.amount);
      groups[key].count += 1;
      if (new Date(e.at) >= new Date(groups[key].joined)) {
        groups[key].joined = e.at;
        if (e.message) groups[key].message = e.message;
      }
    });
    return Object.keys(groups).map(function (k) { return groups[k]; });
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

    animateNumber(amountEl, ui.shown.amount, m.amount, function (v) { return fmtKRW(v); });
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
    $('#stat-amount-sub').textContent = myTotalVarText(myTotalVal);
    var doneCount = completedCaseIds().length;
    $('#stat-households-sub').textContent = doneCount > 0
      ? 'DEBT ZERO 달성 · 내 체험 ' + doneCount + '가구 포함'
      : 'DEBT ZERO 달성 가구';
    $('#stat-sponsors-sub').textContent = state.entries.length > 0
      ? '개인 · 기업 · 내 명패 포함'
      : '개인 · 기업';
  }
  function myTotalVarText(v) {
    return v > 0 ? '2026년 누적 · 내 체험 ' + fmtKRW(v) + ' 포함' : '2026년 누적 · 시연 데이터';
  }

  /* ---------------- honor wall ---------------- */
  function hallRows() {
    var rows = SPONSORS.map(function (s) {
      return {
        id: s.id, type: s.type, name: s.name, title: s.title,
        amount: s.amount, count: s.count, joined: s.joined,
        message: s.message, badges: [s.badge, s.badge2].filter(Boolean), mine: false
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
  function rowBadge(isNew) {
    return isNew ? '신규 등재' : '';
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
      empty.appendChild(h('strong', null, '아직 이 필터에 명패가 없습니다'));
      empty.appendChild(document.createTextNode('탕감 보드에서 체험을 실행하면 내 명패가 이곳에 등재됩니다.'));
      list.appendChild(empty);
    } else {
      visible.forEach(function (row) {
        list.appendChild(plaqueCard(row, ranks[row.id], f === 'recent'));
      });
    }

    $('#hall-count').textContent = '명패 ' + fmtCount(rows.length) + '개';

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
    card.setAttribute('aria-label', row.name + ' 명패 — 명예 인증서 보기');

    var top = h('div', 'plaque__top');
    var rankWrap = h('span', 'rank');
    var medal = h('span', 'rank__medal' + (rank === 1 ? '' : rank === 2 ? ' rank__medal--silver' : rank === 3 ? ' rank__medal--bronze' : ' rank__medal--plain'), String(rank));
    rankWrap.appendChild(medal);
    rankWrap.appendChild(document.createTextNode(isTop ? (rank === 1 ? 'GOLD' : rank === 2 ? 'SILVER' : 'BRONZE') : 'RANK'));
    top.appendChild(rankWrap);

    var badges = h('span', 'plaque__badges');
    if (row.mine) badges.appendChild(h('span', 'badge badge--gold', 'MY · 신규'));
    (row.badges || []).forEach(function (b) { badges.appendChild(h('span', 'badge', b)); });
    top.appendChild(badges);
    card.appendChild(top);

    var nameRow = h('p', 'plaque__name');
    nameRow.appendChild(document.createTextNode(row.name));
    nameRow.appendChild(h('span', 'plaque__type', row.type === 'corp' ? '기업' : '개인'));
    card.appendChild(nameRow);
    if (row.title) card.appendChild(h('p', 'plaque__title', row.title));

    card.appendChild(h('p', 'plaque__amount', fmtKRW(row.amount)));
    card.appendChild(h('p', 'plaque__meta', '누적 탕감 ' + fmtCount(row.count) + '건 · 등재 ' + fmtDate(row.joined)));

    var msg = h('p', 'plaque__msg', row.message || '한마디 없이 조용히 채운 후원입니다.');
    card.appendChild(msg);

    var open = h('span', 'plaque__open');
    open.appendChild(document.createTextNode('명예 인증서 보기'));
    open.appendChild(document.createTextNode(' →'));
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
        serial: 'DZH-2026-' + pad4(rank) + '-' + String(row.id).replace(/[^a-zA-Z0-9]/g, '').slice(-3).toUpperCase()
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
      empty.appendChild(h('strong', null, '해당 카테고리에 열린 사연이 없습니다'));
      empty.appendChild(document.createTextNode('다른 카테고리를 선택해 보세요.'));
      wrap.appendChild(empty);
    }

    $('#board-count').textContent = '사연 ' + visible.length + '건';
    var remainingAll = CASES.reduce(function (a, c) { return a + caseRemaining(c); }, 0);
    $('#board-remaining').textContent = fmtKRW(remainingAll);
    $('#board-myTotal').textContent = fmtKRW(userTotal());

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
    head.appendChild(h('span', 'tag tag--cat', CAT_LABEL[c.cat] || '사연'));
    if (c.urgency === '긴급' && !done) head.appendChild(h('span', 'tag tag--urgent', '긴급'));
    if (done) head.appendChild(h('span', 'tag tag--new', 'DEBT ZERO 완료'));
    card.appendChild(head);

    card.appendChild(h('h3', 'case__title', c.title));
    card.appendChild(h('p', 'case__story', c.story));

    var org = h('p', 'case__org');
    org.appendChild(checkIcon());
    org.appendChild(document.createTextNode(c.org));
    card.appendChild(org);

    if (done) {
      var stamp = h('div', 'stamp');
      stamp.appendChild(h('span', null, 'DEBT'));
      stamp.appendChild(document.createTextNode('ZERO'));
      card.appendChild(stamp);
    }

    var prog = h('div', 'progress');
    var pTop = h('div', 'progress__top');
    pTop.appendChild(h('span', null, done ? '100% 달성 · 탕감 완료' : '달성률'));
    pTop.appendChild(h('span', 'progress__pct', String(pct) + '%'));
    prog.appendChild(pTop);

    var bar = h('div', 'bar');
    bar.setAttribute('role', 'progressbar');
    bar.setAttribute('aria-valuemin', '0');
    bar.setAttribute('aria-valuemax', '100');
    bar.setAttribute('aria-valuenow', String(pct));
    bar.setAttribute('aria-label', c.title + ' 달성률');
    var fill = h('div', 'bar__fill');
    bar.appendChild(fill);
    prog.appendChild(bar);

    var dl = h('dl', 'amounts');
    dl.appendChild(amountItem('목표', fmtKRW(c.target), false));
    dl.appendChild(amountItem('모인 금액', fmtKRW(raised), false));
    dl.appendChild(amountItem('남은 잔액', done ? '0원' : fmtKRW(remaining), true));
    prog.appendChild(dl);
    card.appendChild(prog);

    var cta = h('div', 'case__cta');
    if (done) {
      var doneActions = h('div', 'case__done-actions');
      var certBtn = h('button', 'btn btn--primary', '명예 인증서 보기');
      certBtn.type = 'button';
      certBtn.addEventListener('click', function () { openCaseCertificate(c); });
      var hallBtn = h('button', 'btn btn--ghost', '명예의 전당');
      hallBtn.type = 'button';
      hallBtn.addEventListener('click', function () { switchTab('hall'); });
      doneActions.appendChild(certBtn);
      doneActions.appendChild(hallBtn);
      cta.appendChild(doneActions);
    } else {
      var btn = h('button', 'btn btn--primary', '대신 갚아주기');
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
      left.appendChild(document.createTextNode(c ? c.title : '삭제된 사연'));
      left.appendChild(h('small', null, e.nickname + ' · ' + fmtDateTime(e.at) + (e.message ? ' · “' + e.message + '”' : '')));
      li.appendChild(left);
      li.appendChild(h('span', 'l-amt', fmtKRW(e.amount)));
      list.appendChild(li);
    });
  }

  /* ---------------- tabs & routing ---------------- */
  var TABS = ['hall', 'board', 'model'];
  function switchTab(name, opts) {
    if (TABS.indexOf(name) < 0) name = 'hall';
    ui.activeTab = name;
    TABS.forEach(function (t) {
      var tab = $('#tab-' + t);
      var panel = $('#panel-' + t);
      var on = t === name;
      tab.classList.toggle('is-active', on);
      tab.setAttribute('aria-selected', on ? 'true' : 'false');
      tab.tabIndex = on ? 0 : -1;
      panel.classList.toggle('is-active', on);
      panel.hidden = !on;
    });
    try {
      history.replaceState(null, '', '#' + name);
    } catch (err) { /* file: 등에서 실패해도 무시 */ }
    if (opts && opts.scroll) {
      var panel = $('#panel-' + name);
      if (panel) {
        var offset = window.innerWidth <= 760 ? 74 : 118;
        var y = panel.getBoundingClientRect().top + window.pageYOffset - offset;
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
      toast('이미 탕감이 완료된 사연입니다.');
      return;
    }
    ui.activeCase = c;
    $('#relief-case').textContent = c.title;
    $('#relief-remain').textContent = fmtKRW(remaining);

    var nick = $('#relief-nickname');
    nick.value = state.nickname || '';
    var msg = $('#relief-message');
    msg.value = '';
    $('#msg-count').textContent = '0';

    buildAmounts(remaining);
    openModal('relief-modal');
  }

  function buildAmounts(remaining) {
    var grid = $('#amount-grid');
    grid.textContent = '';
    var presets = [
      { value: 100000, label: '10만원' },
      { value: 500000, label: '50만원' },
      { value: 1000000, label: '100만원' }
    ];
    presets.forEach(function (p) {
      var b = h('button', 'amount-btn', p.label);
      b.type = 'button';
      b.dataset.amount = String(p.value);
      b.setAttribute('aria-pressed', 'false');
      if (p.value > remaining) {
        b.disabled = true;
        b.title = '남은 잔액보다 큽니다';
      }
      b.addEventListener('click', function () { selectAmount(p.value); });
      grid.appendChild(b);
    });
    var all = h('button', 'amount-btn amount-btn--all', '잔액 전액 탕감 · ' + fmtKRW(remaining));
    all.type = 'button';
    all.dataset.amount = String(remaining);
    all.setAttribute('aria-pressed', 'false');
    all.addEventListener('click', function () { selectAmount(remaining); });
    grid.appendChild(all);

    // 기본값: 남은 잔액이 300만원 이하면 전액 탕감, 그보다 크면 100만원
    ui.selectedAmount = remaining <= 3000000 ? remaining : 1000000;
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
      toast('탕감할 금액을 선택해 주세요.');
      return;
    }
    var nickInput = $('#relief-nickname');
    var nickname = (nickInput.value || '').trim().slice(0, 20) || '익명의 히어로';
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

    toast(nickname + ' 님의 명패가 명예의 전당에 등재되었습니다.', 'ok');

    if (done) {
      window.setTimeout(function () {
        showComplete(c, amount, message, rank);
      }, 420);
    }
  }

  function showComplete(c, amount, message, rank) {
    $('#complete-case').textContent = c.title + ' · ' + fmtKRW(amount) + ' 탕감';
    $('#complete-msg').textContent = message || '이 사연은 이제 빚 0원이 되었습니다.';
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

  /* ---------------- certificate ---------------- */
  function openCaseCertificate(c, rankHint) {
    var entries = entriesFor(c.id);
    var mine = entries.slice().sort(function (a, b) { return new Date(b.at) - new Date(a.at); })[0];
    var nickname = mine ? mine.nickname : '익명의 히어로';
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
      serial: 'DZH-2026-' + pad4(rank || 0) + '-' + String(c.id).toUpperCase()
    }, c.title);
  }

  function openCertificate(data, caseTitle) {
    $('#cert-name').textContent = data.name;
    $('#cert-amount').textContent = fmtKRW(data.amount) + ' 대신 탕감';
    $('#cert-msg').textContent = data.message ? '“' + data.message + '”' : '';
    $('#cert-rank').textContent = data.rank ? '명예의 전당 ' + data.rank + '위' : '명예의 전당';
    $('#cert-count').textContent = fmtCount(data.count) + '건';
    $('#cert-date').textContent = fmtDate(data.date);
    $('#cert-serial').textContent = data.serial;
    $('#cert-title').textContent = caseTitle ? '탕감 명예 인증서' : '명예 인증서';

    var shareBtn = $('#cert-share');
    shareBtn.onclick = function () { shareCert(data); };
    openModal('cert-modal');
  }

  function shareCert(data) {
    var text = '[채움의 전당] ' + data.name + ' 님이 ' + fmtKRW(data.amount) + '을 대신 갚아 ' +
      fmtCount(data.count) + '건의 빚을 지웠습니다. (시연용 인증서)';
    var url = window.location.href.split('#')[0];
    var payload = text + ' ' + url;

    if (navigator.share) {
      navigator.share({ title: '채움의 전당 · 명예 인증서', text: text, url: url }).then(function () {
        /* 공유 완료 */
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
        toast('공유 문구를 복사했습니다.', 'ok');
      }).catch(function () {
        toast('복사가 차단되었습니다. 화면의 문구를 직접 복사해 주세요.');
      });
      return;
    }
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
      toast('공유 문구를 복사했습니다.', 'ok');
    } catch (err) {
      toast('복사가 차단되었습니다. 화면의 문구를 직접 복사해 주세요.');
    }
  }

  /* ---------------- toast ---------------- */
  function toast(message, kind) {
    var box = $('#toasts');
    var t = h('div', 'toast' + (kind === 'ok' ? ' toast--ok' : ''), message);
    box.appendChild(t);
    window.setTimeout(function () {
      t.classList.add('is-out');
      window.setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 320);
    }, 2600);
  }

  /* ---------------- simulator ---------------- */
  var SIM_COST = 90000000;
  function initSim() {
    var campEl = $('#sim-campaigns');
    var budgetEl = $('#sim-budget');
    var subsEl = $('#sim-subs');
    if (!campEl || !budgetEl || !subsEl) return;

    function updateTrack(el) {
      var min = Number(el.min), max = Number(el.max), v = Number(el.value);
      var pct = max > min ? ((v - min) / (max - min)) * 100 : 0;
      el.style.setProperty('--fill', pct + '%');
    }
    function render() {
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

      $('#sim-campaigns-out').textContent = camp + '건';
      $('#sim-budget-out').textContent = fmtKRW(budget);
      $('#sim-subs-out').textContent = subs + '곳';
      $('#sim-relief').textContent = fmtKRW(relief);
      $('#sim-fee').textContent = fmtKRW(fee);
      $('#sim-saas').textContent = fmtKRW(saas);
      $('#sim-traffic').textContent = fmtKRW(traffic);
      $('#sim-revenue').textContent = fmtKRW(revenue);
      $('#sim-year').textContent = fmtKRW(revenue * 12);
      $('#sim-profit').textContent = (profit >= 0 ? '' : '-') + fmtKRW(Math.abs(profit));
      $('#sim-ratio').textContent = ratio.toFixed(1) + '%';

      [campEl, budgetEl, subsEl].forEach(updateTrack);
    }
    [campEl, budgetEl, subsEl].forEach(function (el) {
      el.addEventListener('input', render);
      el.addEventListener('change', render);
    });
    render();
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
        try { window.localStorage.removeItem(STORE_KEY); } catch (err) {}
        closeModal('confirm-modal');
        renderAll(false);
        toast('시연 데이터를 초기화했습니다.');
      });
    }
  }

  /* ---------------- render all ---------------- */
  function renderAll(bump) {
    renderImpact(bump);
    renderHall();
    renderBoard();
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
    initTabs();
    initMessages();
    initSim();
    initReset();
    ui.shown = { amount: BASE.totalRelief, households: BASE.households, sponsors: BASE.sponsors };
    renderAll(false);
    registerSW();
  });

  function registerSW() {
    if (!('serviceWorker' in navigator)) return;
    if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') return;
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('./sw.js').catch(function () {
        /* 등록 실패는 기능에 영향을 주지 않습니다 */
      });
    });
  }
})();
