/* 公司點餐頁（第 2 步；第 4 步加上 ?view=history 直接開「我的訂單」）
 * 在 LINE 裡用 LIFF 開啟，資料讀寫都透過 Apps Script（Api.gs）。
 */
(function () {
  'use strict';
 
  var CFG = window.APP_CONFIG || {};
 
  var $view = document.getElementById('view');
  var $bottom = document.getElementById('bottom');
  var $title = document.getElementById('title');
  var $back = document.getElementById('backBtn');
  var $historyBtn = document.getElementById('historyBtn');
  var $sheet = document.getElementById('sheet');
  var $sheetBody = document.getElementById('sheetBody');
  var $toast = document.getElementById('toast');
 
  // 全部狀態放這裡
  var S = {
    home: null,      // init 回傳：user、today、sessions
    menu: null,      // menu 回傳
    cart: [],        // [{ itemId, optionIds, qty, note, stale }]
    view: 'home',
    busy: false
  };
 
  /* ---------- 呼叫後端 ---------- */
 
  function api(action, data) {
    var idToken = window.liff ? liff.getIDToken() : '';
    return fetch(CFG.API_URL, {
      method: 'POST',
      // 用 text/plain 送出，瀏覽器不會先發 CORS 預檢（Apps Script 不處理預檢）
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: action, idToken: idToken, data: data || {} }),
      redirect: 'follow'
    }).then(function (r) {
      if (!r.ok) throw new Error('連線失敗（' + r.status + '）');
      return r.json();
    }).then(function (res) {
      if (res.ok) return res.data;
      if (res.code === 'TOKEN' && window.liff) {
        liff.logout();
        liff.login({ redirectUri: location.href });
      }
      var e = new Error(res.error || '發生錯誤');
      e.code = res.code;
      throw e;
    });
  }
 
  /* ---------- 啟動 ---------- */
 
  // 網址帶 ?view=history 就直接開「我的訂單」。LIFF 第一次開啟時參數可能還包在 liff.state 裡，兩種都看。
  var wantHistory = (function () {
    var q = location.search;
    var m = q.match(/[?&]liff\.state=([^&]*)/);
    if (m) { try { q += '&' + decodeURIComponent(m[1]).replace(/^[^?]*\?/, ''); } catch (x) {} }
    return /(^|[?&])view=history(&|$)/.test(q);
  })();
 
  function start() {
    if (!CFG.LIFF_ID || !CFG.API_URL) return showFatal('點餐頁還沒設定完成（config.js 的 LIFF_ID 或 API_URL 是空的），請通知行政。');
    if (!window.liff) return showFatal('LINE 登入元件載入失敗，請關閉後重新開啟。');
    liff.init({ liffId: CFG.LIFF_ID }).then(function () {
      if (!liff.isLoggedIn()) {
        liff.login({ redirectUri: location.href });
        return new Promise(function () {}); // 等待跳轉
      }
      return loadHome();
    }).catch(function (e) { showFatal(e.message); });
  }
 
  function loadHome() {
    setLoading('載入中…');
    return api('init').then(function (d) {
      S.home = d; S.menu = null; S.cart = [];
      go('home');
      // 第 4 步：圖文選單「我的訂單」用 ?view=history 開啟時，直接進我的訂單（只在第一次載入時）
      if (wantHistory && d.user.status === '核准') { wantHistory = false; openHistory(); }
    }).catch(showError);
  }
 
  /* ---------- 畫面切換 ---------- */
 
  function go(view) {
    S.view = view;
    closeSheet();
    window.scrollTo(0, 0);
    render();
  }
 
  function render() {
    var approved = S.home && S.home.user.status === '核准';
    $historyBtn.hidden = !(approved && S.view === 'home');
    $back.hidden = S.view === 'home';
    $bottom.hidden = true;
    ({ home: renderHome, menu: renderMenu, cart: renderCart, confirm: renderConfirm, history: renderHistory })[S.view]();
  }
 
  $back.addEventListener('click', function () {
    if (S.view === 'confirm') return go('cart');
    if (S.view === 'cart') return go('menu');
    if (S.view === 'menu' && cartChanged() && !window.confirm('購物車還沒送出，確定要離開嗎？')) return;
    go('home');
  });
  $historyBtn.addEventListener('click', openHistory);
 
  /* ---------- 首頁 ---------- */
 
  function renderHome() {
    $title.textContent = '公司點餐';
    var u = S.home.user;
    var hello = '<p class="muted small">' + esc(S.home.today) + '　你好，' + esc(u.realName || u.lineName || '') + '</p>';
 
    if (u.status === '未申請' || u.status === '待審核') {
      var pending = u.status === '待審核';
      $view.innerHTML = hello +
        '<div class="card">' +
        (pending
          ? '<h2>已送出申請</h2><p>等待行政核准後就可以點餐。核准後重新開啟這個頁面即可。</p>'
          : '<h2>第一次使用</h2><p>請填寫你的姓名送出申請，行政核准後就可以點餐。</p>') +
        '<label class="field" for="realName">姓名</label>' +
        '<input id="realName" type="text" maxlength="20" autocomplete="name" value="' + esc(u.realName || '') + '" placeholder="例如：王小明">' +
        '<div class="btn-row"><button class="btn primary" data-act="apply">' + (pending ? '更新姓名' : '送出申請') + '</button></div>' +
        (pending ? '<div class="btn-row"><button class="btn" data-act="reload">重新整理</button></div>' : '') +
        '</div>';
      return;
    }
    if (u.status !== '核准') {
      $view.innerHTML = hello + '<div class="card"><h2>帳號已停用</h2><p>如有疑問請聯絡行政。</p></div>';
      return;
    }
 
    var list = S.home.sessions || [];
    if (!list.length) {
      $view.innerHTML = hello + '<div class="card center"><p>今天還沒有開團。</p><button class="btn" data-act="reload">重新整理</button></div>';
      return;
    }
    list = list.slice().sort(function (a, b) { return a.type === b.type ? 0 : (a.type === '餐點' ? -1 : 1); });
    $view.innerHTML = hello + list.map(function (s) {
      var o = s.myOrder;
      var btns;
      if (s.open) {
        btns = o
          ? '<button class="btn" data-act="cancel" data-id="' + esc(s.id) + '">取消訂單</button>' +
            '<button class="btn primary" data-act="menu" data-id="' + esc(s.id) + '">修改訂單</button>'
          : '<button class="btn primary" data-act="menu" data-id="' + esc(s.id) + '">開始點餐</button>';
      } else {
        btns = '<button class="btn" data-act="menu" data-id="' + esc(s.id) + '">看菜單</button>';
      }
      return '<div class="card">' +
        '<div class="row"><span class="tag type">' + esc(s.type) + '</span>' +
        (s.open ? '<span class="tag open">開放中・' + esc(s.cutoff) + ' 截止</span>' : '<span class="tag">已截止</span>') + '</div>' +
        '<h2 style="margin-top:8px">' + esc(s.storeName) + '</h2>' +
        (o ? '<p class="small">你已點餐：<b>$' + o.total + '</b>　' + (o.paid ? '<span class="tag open">已付款</span>' : '<span class="tag warn">未付款</span>') + '</p>'
           : '<p class="small muted">' + (s.open ? '你還沒點餐' : '你這團沒有點餐') + '</p>') +
        '<div class="btn-row">' + btns + '</div></div>';
    }).join('');
  }
 
  /* ---------- 菜單 ---------- */
 
  function openMenu(sessionId) {
    setLoading('讀取菜單…');
    api('menu', { sessionId: sessionId }).then(function (d) {
      S.menu = d;
      S.cart = d.myOrder ? d.myOrder.lines.map(function (l) {
        return { itemId: l.itemId, optionIds: l.optionIds.slice(), qty: l.qty, note: l.note, stale: !!l.stale, oldName: l.name };
      }) : [];
      S.cartStart = JSON.stringify(S.cart);
      go('menu');
    }).catch(showError);
  }
 
  function cartChanged() { return JSON.stringify(S.cart) !== S.cartStart; }
 
  function renderMenu() {
    var m = S.menu;
    $title.textContent = m.store.name;
    var cats = [];
    m.items.forEach(function (i) { if (cats.indexOf(i.cat) < 0) cats.push(i.cat); });
    var counts = {};
    S.cart.forEach(function (l) { counts[l.itemId] = (counts[l.itemId] || 0) + l.qty; });
 
    var head = '<div class="store-info"><span class="tag type">' + esc(m.session.type) + '</span> ' +
      (m.session.open ? '<span class="tag open">' + esc(m.session.cutoff) + ' 截止</span>' : '<span class="tag">已截止</span>') +
      (m.store.note ? '<p class="small muted">' + esc(m.store.note) + '</p>' : '') + '</div>';
    if (m.myOrder && m.session.open) head += '<div class="notice">你正在修改訂單，送出後會取代原本的訂單（$' + m.myOrder.total + '）。</div>';
    if (!m.session.open) head += '<div class="notice">這一團已經截止，只能看菜單。</div>';
 
    var chips = cats.length > 1 ? '<nav class="cats">' + cats.map(function (c, i) {
      return '<button class="chip' + (i === 0 ? ' on' : '') + '" data-act="cat" data-i="' + i + '">' + esc(c) + '</button>';
    }).join('') + '</nav>' : '';
 
    var body = cats.map(function (c, ci) {
      return '<h3 class="cat-title" id="cat' + ci + '">' + esc(c) + '</h3>' +
        m.items.filter(function (i) { return i.cat === c; }).map(function (i) {
          return '<button class="item" data-act="item" data-id="' + esc(i.id) + '"' + (m.session.open ? '' : ' disabled') + '>' +
            '<span><span class="name">' + esc(i.name) + '</span>' + (counts[i.id] ? '<span class="count">' + counts[i.id] + '</span>' : '') +
            (i.desc ? '<br><span class="desc">' + esc(i.desc) + '</span>' : '') + '</span>' +
            '<span class="price">$' + i.price + '</span></button>';
        }).join('');
    }).join('');
 
    $view.innerHTML = head + chips + body;
    if (m.session.open) showCartBar('查看購物車', function () { go('cart'); }, !S.cart.length);
  }
 
  function showCartBar(label, onClick, disabled) {
    var n = S.cart.reduce(function (s, l) { return s + l.qty; }, 0);
    $bottom.innerHTML = '<div class="inner"><div class="sum"><span class="small muted">共 ' + n + ' 份</span><br><b>$' + cartTotal() + '</b></div>' +
      '<button class="btn primary" id="bottomBtn"' + (disabled ? ' disabled' : '') + '>' + esc(label) + '</button></div>';
    $bottom.hidden = false;
    document.getElementById('bottomBtn').onclick = onClick;
  }
 
  /* ---------- 計價（和 Api.gs 的規則相同，只做顯示；實際金額以後端計算為準） ---------- */
 
  function itemOf(id) { return S.menu.items.filter(function (i) { return i.id === id; })[0]; }
  function groupsOf(item) { return item.groupIds.map(function (g) { return S.menu.groups[g]; }); }
 
  function linePrice(l) {
    var item = itemOf(l.itemId);
    if (!item) return 0;
    var add = 0;
    groupsOf(item).forEach(function (g) {
      g.options.forEach(function (o) { if (l.optionIds.indexOf(o.id) >= 0) add += o.price; });
    });
    return (item.price + add) * l.qty;
  }
  function cartTotal() { return S.cart.reduce(function (s, l) { return s + (l.stale ? 0 : linePrice(l)); }, 0); }
 
  function optText(l) {
    var item = itemOf(l.itemId);
    if (!item) return '';
    return groupsOf(item).map(function (g) {
      var picked = g.options.filter(function (o) { return l.optionIds.indexOf(o.id) >= 0; });
      return picked.length ? g.name + '：' + picked.map(function (o) { return o.name + (o.price ? '(+' + o.price + ')' : ''); }).join('、') : '';
    }).filter(Boolean).join('；');
  }
 
  function ruleText(g) {
    if (g.single) return g.required ? '必選・選 1' : '可不選・最多 1';
    if (g.min === g.max) return '必選・選 ' + g.min;
    return g.min ? '選 ' + g.min + '～' + g.max : '可不選・最多 ' + g.max;
  }
 
  function groupOk(g, ids) {
    var n = g.options.filter(function (o) { return ids.indexOf(o.id) >= 0; }).length;
    return n >= g.min && n <= g.max;
  }
 
  /* ---------- 選項視窗 ---------- */
 
  var draft = null; // { itemId, optionIds, qty, note, index }
 
  function openItem(itemId, index) {
    var item = itemOf(itemId);
    if (!item) return;
    var base = index != null ? S.cart[index] : null;
    var ids = base && !base.stale ? base.optionIds.slice() : [];
    if (!base || base.stale) {
      groupsOf(item).forEach(function (g) {
        var defs = g.options.filter(function (o) { return o.def; }).slice(0, g.max);
        defs.forEach(function (o) { ids.push(o.id); });
      });
    }
    draft = { itemId: itemId, optionIds: ids, qty: base ? base.qty : 1, note: base ? base.note : '', index: index, tried: false };
    renderSheet();
    $sheet.hidden = false;
  }
 
  function renderSheet() {
    var item = itemOf(draft.itemId);
    var groups = groupsOf(item);
    $sheetBody.innerHTML =
      '<div class="row"><h2>' + esc(item.name) + '</h2><b>$' + item.price + '</b></div>' +
      (item.desc ? '<p class="small muted" style="margin:4px 0 0">' + esc(item.desc) + '</p>' : '') +
      groups.map(function (g) {
        var bad = draft.tried && !groupOk(g, draft.optionIds);
        return '<div class="group' + (bad ? ' bad' : '') + '"><div class="group-head"><b>' + esc(g.name) + '</b>' +
          '<span class="tag' + (g.required ? ' warn' : '') + '">' + ruleText(g) + '</span></div><div class="opts">' +
          g.options.map(function (o) {
            var on = draft.optionIds.indexOf(o.id) >= 0;
            return '<button class="opt' + (on ? ' on' : '') + '" data-sact="opt" data-g="' + esc(g.id) + '" data-o="' + esc(o.id) + '" aria-pressed="' + on + '">' +
              esc(o.name) + (o.price ? '<small>+' + o.price + '</small>' : '') + '</button>';
          }).join('') + '</div></div>';
      }).join('') +
      '<div class="group"><div class="group-head"><b>數量</b></div>' +
      '<div class="qty"><button data-sact="dec" aria-label="減少">−</button><span>' + draft.qty + '</span><button data-sact="inc" aria-label="增加">＋</button></div></div>' +
      '<label class="field" for="lineNote">備註（選填）</label>' +
      '<input id="lineNote" type="text" maxlength="50" value="' + esc(draft.note) + '" placeholder="例如：飯少、不要香菜">' +
      '<div class="btn-row"><button class="btn" data-sact="close">取消</button>' +
      '<button class="btn primary" data-sact="save">' + (draft.index != null ? '更新' : '加入購物車') + '　$' + linePrice(draft) + '</button></div>';
  }
 
  $sheetBody.addEventListener('click', function (e) {
    var b = e.target.closest('[data-sact]');
    if (!b) return;
    var noteEl = document.getElementById('lineNote');
    if (noteEl) draft.note = noteEl.value;
    var act = b.dataset.sact;
    if (act === 'close') return closeSheet();
    if (act === 'inc') draft.qty = Math.min(20, draft.qty + 1);
    if (act === 'dec') draft.qty = Math.max(1, draft.qty - 1);
    if (act === 'opt') {
      var g = S.menu.groups[b.dataset.g];
      var id = b.dataset.o;
      var i = draft.optionIds.indexOf(id);
      if (i >= 0) {
        draft.optionIds.splice(i, 1);
      } else if (g.single) {
        g.options.forEach(function (o) { var k = draft.optionIds.indexOf(o.id); if (k >= 0) draft.optionIds.splice(k, 1); });
        draft.optionIds.push(id);
      } else {
        var n = g.options.filter(function (o) { return draft.optionIds.indexOf(o.id) >= 0; }).length;
        if (n >= g.max) return toast('「' + g.name + '」最多選 ' + g.max + ' 個');
        draft.optionIds.push(id);
      }
    }
    if (act === 'save') {
      var item = itemOf(draft.itemId);
      var badG = groupsOf(item).filter(function (g) { return !groupOk(g, draft.optionIds); })[0];
      if (badG) { draft.tried = true; renderSheet(); return toast('「' + badG.name + '」還沒選好（' + ruleText(badG) + '）'); }
      var line = { itemId: draft.itemId, optionIds: draft.optionIds.slice(), qty: draft.qty, note: draft.note.trim(), stale: false };
      if (draft.index != null) S.cart[draft.index] = line; else S.cart.push(line);
      closeSheet();
      toast(draft.index != null ? '已更新' : '已加入購物車');
      return render();
    }
    renderSheet();
  });
  $sheet.querySelector('[data-close]').addEventListener('click', closeSheet);
 
  function closeSheet() { $sheet.hidden = true; }
 
  /* ---------- 購物車 ---------- */
 
  function lineHtml(l, i, editable) {
    var item = itemOf(l.itemId);
    var name = item ? item.name : (l.oldName || l.itemId);
    var price = l.stale ? '' : '$' + linePrice(l);
    return '<div class="line' + (l.stale ? ' stale' : '') + '">' +
      '<div class="row"><b>' + esc(name) + ' × ' + l.qty + '</b><b>' + price + '</b></div>' +
      (l.stale ? '<div class="note">菜單已變動，' + (item ? '請按「修改」重新選擇' : '這個品項已下架，請刪除') + '</div>' : '') +
      (!l.stale && optText(l) ? '<div class="opts-text">' + esc(optText(l)) + '</div>' : '') +
      (l.note ? '<div class="note">備註：' + esc(l.note) + '</div>' : '') +
      (editable ? '<div class="btn-row">' +
        '<button class="btn danger" data-act="del" data-i="' + i + '">刪除</button>' +
        (item ? '<button class="btn" data-act="edit" data-i="' + i + '">修改</button>' : '') + '</div>' : '') +
      '</div>';
  }
 
  function renderCart() {
    $title.textContent = '購物車';
    if (!S.cart.length) {
      $view.innerHTML = '<div class="card center"><p>購物車是空的。</p><button class="btn" data-act="back">回菜單</button></div>';
    } else {
      $view.innerHTML = '<div class="card">' + S.cart.map(function (l, i) { return lineHtml(l, i, true); }).join('') +
        '<div class="total-row"><span>合計</span><span>$' + cartTotal() + '</span></div></div>' +
        '<button class="btn block" data-act="back">＋ 繼續加點</button>';
    }
    var stale = S.cart.some(function (l) { return l.stale; });
    showCartBar(stale ? '請先處理標示的品項' : '下一步：確認', function () { go('confirm'); }, !S.cart.length || stale);
  }
 
  /* ---------- 確認送出 ---------- */
 
  function renderConfirm() {
    var m = S.menu;
    $title.textContent = '確認訂單';
    $view.innerHTML = '<div class="notice">請再確認一次品項和金額，送出後截止前仍可修改或取消。</div>' +
      '<div class="card"><div class="row"><h2>' + esc(m.store.name) + '</h2><span class="tag type">' + esc(m.session.type) + '</span></div>' +
      '<p class="small muted">' + esc(m.session.date) + '・' + esc(m.session.cutoff) + ' 截止・訂購人 ' + esc(m.userName || '') + '</p>' +
      S.cart.map(function (l, i) { return lineHtml(l, i, false); }).join('') +
      '<div class="total-row"><span>總金額</span><span>$' + cartTotal() + '</span></div></div>';
    showCartBar(m.myOrder ? '確認修改' : '確認送出', submitOrder, S.busy);
  }
 
  function submitOrder() {
    if (S.busy) return;
    S.busy = true;
    var btn = document.getElementById('bottomBtn');
    btn.disabled = true; btn.textContent = '送出中…';
    var lines = S.cart.map(function (l) { return { itemId: l.itemId, optionIds: l.optionIds, qty: l.qty, note: l.note }; });
    api('submit', { sessionId: S.menu.session.id, lines: lines }).then(function (r) {
      S.busy = false;
      toast('訂單已送出，金額 $' + r.total);
      return loadHome();
    }).catch(function (e) {
      S.busy = false;
      btn.disabled = false; btn.textContent = S.menu.myOrder ? '確認修改' : '確認送出';
      alertMsg(e.message);
    });
  }
 
  function cancelOrder(sessionId) {
    if (!window.confirm('確定要取消這一團的訂單嗎？')) return;
    setLoading('取消中…');
    api('cancel', { sessionId: sessionId }).then(function () {
      toast('訂單已取消');
      return loadHome();
    }).catch(showError);
  }
 
  /* ---------- 我的訂單 ---------- */
 
  function openHistory() {
    setLoading('讀取訂單…');
    S.view = 'history';
    api('history').then(function (d) { S.history = d; go('history'); }).catch(showError);
  }
 
  function renderHistory() {
    $title.textContent = '我的訂單';
    var d = S.history;
    var html = '<div class="card"><div class="row"><span>尚未付款</span><b style="font-size:22px">$' + d.unpaid + '</b></div>' +
      '<p class="small muted" style="margin:4px 0 0">只計算有效且尚未付款的訂單，現金請交給行政。</p></div>';
    if (!d.orders.length) html += '<p class="center muted">還沒有訂單紀錄。</p>';
    html += d.orders.map(function (o) {
      var st = o.status === '取消' ? '<span class="tag">已取消</span>'
        : (o.paid ? '<span class="tag open">已付款</span>' : '<span class="tag warn">未付款</span>');
      return '<div class="card"><div class="row"><span class="small muted">' + esc(o.date) + '・' + esc(o.type) + '</span>' + st + '</div>' +
        '<div class="row"><h3>' + esc(o.storeName) + '</h3><b>$' + o.total + '</b></div>' +
        o.lines.map(function (l) {
          return '<div class="line"><div class="row"><span>' + esc(l.name) + ' × ' + l.qty + '</span><span>$' + l.sub + '</span></div>' +
            (l.options ? '<div class="opts-text">' + esc(l.options) + '</div>' : '') +
            (l.note ? '<div class="note">備註：' + esc(l.note) + '</div>' : '') + '</div>';
        }).join('') + '</div>';
    }).join('');
    $view.innerHTML = html;
  }
 
  /* ---------- 頁面上的按鈕 ---------- */
 
  $view.addEventListener('click', function (e) {
    var b = e.target.closest('[data-act]');
    if (!b || b.disabled) return;
    var d = b.dataset;
    switch (d.act) {
      case 'reload': return loadHome();
      case 'apply': {
        var name = document.getElementById('realName').value.trim();
        if (!name) return toast('請填寫姓名');
        setLoading('送出中…');
        return api('apply', { realName: name }).then(function (r) { S.home = r; go('home'); toast('已送出'); }).catch(showError);
      }
      case 'menu': return openMenu(d.id);
      case 'cancel': return cancelOrder(d.id);
      case 'item': return openItem(d.id, null);
      case 'edit': return openItem(S.cart[+d.i].itemId, +d.i);
      case 'del': S.cart.splice(+d.i, 1); return render();
      case 'back': return go('menu');
      case 'cat': {
        document.querySelectorAll('.chip').forEach(function (c) { c.classList.toggle('on', c === b); });
        var t = document.getElementById('cat' + d.i);
        if (t) window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - 110, behavior: 'smooth' });
        return;
      }
    }
  });
 
  /* ---------- 小工具 ---------- */
 
  function setLoading(msg) {
    closeSheet();
    $bottom.hidden = true;
    $view.innerHTML = '<div class="center muted">' + esc(msg) + '</div>';
  }
 
  function showFatal(msg) {
    $bottom.hidden = true;
    $view.innerHTML = '<div class="card center"><p>' + esc(msg) + '</p><button class="btn" onclick="location.reload()">重新載入</button></div>';
  }
 
  function showError(e) {
    if (e && e.code === 'NOT_APPROVED') return loadHome();
    $bottom.hidden = true;
    $back.hidden = true;
    $view.innerHTML = '<div class="card center"><p>' + esc(e && e.message || '發生錯誤') + '</p>' +
      '<button class="btn" data-act="reload">回首頁</button></div>';
  }
 
  function alertMsg(msg) { window.alert(msg); }
 
  var toastTimer;
  function toast(msg) {
    $toast.textContent = msg;
    $toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { $toast.hidden = true; }, 2200);
  }
 
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
 
  start();
})();
 
