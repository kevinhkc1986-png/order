/* 公司點餐頁（第 2 步；第 4 步加上 ?view=history 直接開「我的訂單」）
 * 第 6 步：合計不是整數（例如 $22.5）不能送出；菜單和數量旁顯示「最多 20 份」。
 * 第 7 步：取消的團顯示「已取消」和作廢的訂單；每一團的公告顯示在首頁和菜單上方；「我的訂單」標「開團取消」。
 * 第 12 步：頁首名稱改為「YK中午吃什麼-點餐系統」。
 * 第 9 步：菜單列表品項底下的小字不再顯示「最多 20 份」（品項視窗數量旁和按到 20 的提示保留）。
 * 第 36 步：品項視窗「數量」旁的「最多 20 份」標籤也拿掉；上限 20 份和按到 20 的提示保留。
 * 第 15 步：菜單頁店名下方加「看菜單圖」連結。
 * 第 16 步（加速）：
 *   - 打開時先顯示上一次的首頁（存在這支手機裡，只限今天），最新資料回來再換掉。
 *   - 首頁出現後，在背景一家一家先把今天的菜單載好，點進去就不用再等。
 *   - 送單、取消、申請遇到「系統忙碌」會自動等 1.5 秒再送一次。
 * 第 18 步（使用體驗）：
 *   - 購物車暫存在這支手機（只限今天、同一團），關掉再開會自動帶回；送出或取消後清掉。
 *   - 截止前 15 分鐘出現紅色倒數；購物車還沒送出或還沒點餐也會提醒。
 *   - 送出後顯示「已送出」畫面，按「回首頁」才離開。
 *   - 菜單上方加搜尋框；捲動時分類列自動標出目前所在的分類。
 *   - 「上次在這家點的」一鍵加入（記在這支手機，第 18 步上線後的訂單才有）。
 * 第 20 步（行政代點）：
 *   - 行政（Users「角色」＝行政）首頁上方多一列「幫誰點」，選了人之後首頁、菜單、購物車、訂單都是那個人的。
 *   - 幫別人點的時候畫面上方一直有黃色提示；購物車暫存分開存，「上次在這家點的」不顯示也不記。
 *   - 截止後行政還能補單、改單、取消（只限當天），送出前多確認一次。
 * 第 25 步：
 *   - 首次使用導覽：核准後第一次打開首頁跳出 3 頁說明（看過記在這支手機），首頁最下面「使用說明」可以再看一次；代點時不跳。
 *   - 改單提示：首頁已點餐的卡片寫「幾點截止前都可以修改或取消」，截止後寫「已截止」（第 31 步拿掉「要更改請找行政」）；取消確認多一句說明。
 * 第 29 步：首頁不顯示已取消的團，只留可以點餐或已截止的店；全部都取消時顯示「今天沒有可以點餐的店」。
 *   （取消前點的單仍在「我的訂單」標「開團取消」。）
 * 第 37 步：
 *   - 取消的團如果有作廢的訂單，首頁最上方顯示黃色提示「○○店已取消，你的 $N 訂單已作廢」（已付款多一句請找行政退款）。
 *   - 斷線、伺服器回應讀不懂時，錯誤訊息改成中文（送單斷線不自動重送，避免變兩張單）。
 * 第 31 步（讓同仁記得按送出）：
 *   - 拿掉「確認訂單」頁，從 3 步減成 2 步：查看購物車 → 送出訂單。
 *   - 購物車頁最上面黃色提示「還沒送出」，底部改成全寬大按鈕「送出訂單 $金額」；店名、截止時間、訂購人移到購物車頁。
 *   - 首頁有購物車還沒送出時，改成紅色框提醒。
 *   - 首頁已截止的卡片只寫「已截止」，拿掉「要更改請找行政」。
 *   - 使用說明第 2 頁改文字；說明的記號改成 yk_guide_v2，所以每個人下次打開首頁會再跳出一次說明。
 * 在 LINE 裡用 LIFF 開啟，資料讀寫都透過 Apps Script（Api.gs）。
 * 第 38 步：手機返回鍵回上一層（品項視窗→菜單→首頁），首頁再按才離開點餐頁。
 * 第 40 步（紅隊 4、7、9、11、12、13）：
 *   - 截止後送不出：購物車頁提示「請找行政幫你補單」，加「複製購物車內容」按鈕（複製不了就顯示文字框讓人長按複製）。
 *   - 品項視窗：加入按鈕固定在視窗底部；點背景或返回鍵時，有改過選項/數量/備註會先問要不要放棄。
 *   - 改單時購物車刪光：問「要取消這筆訂單嗎？」，可以直接取消訂單或回菜單。
 *   - 購物車按「刪除」先確認。
 *   - 行政代點送出後，送出成功畫面有「繼續幫 ○○ 點」和「改回自己」。
 *   - 還沒付的單標籤改成灰色「待付款」；改單前已付過的單顯示「已付 $X，差 $Y」或「已付 $X，要退 $Y」（第 39 步 credit）。
 * 第 42 步（紅隊 10）：等待核准頁開著時每 30 秒自動檢查一次（頁面在背景時暫停、回到前景馬上查），
 *   核准後自動切到首頁（接著照舊跳出 3 頁使用說明）。文字改成「等待核准後就可以點餐。」。
 * 第 46 步（投票）：
 *   - 首頁最下面多一張「候選店」卡片（後端有給 vote 才顯示：Settings「投票開放」或測試人員），
 *     列出下一個有投票的日子的候選店、自己選了哪家，按「看看大家想吃什麼 ›」進投票頁。不催投票。
 *   - 投票頁：點一家就算選，截止前點別家就是改票；選過的那一類才看得到票數，不顯示誰投哪家。
 *   - 網址帶 ?view=vote（LINE「投票」回覆的連結）直接開投票頁。行政代點時不顯示投票。
 */
(function () {
  'use strict';

  var CFG = window.APP_CONFIG || {};
  var MAX_QTY = 20; // 每行最多幾份（和 Api.gs 的 MAX_QTY 相同）
  var WARN_MIN = 15; // 第 18 步：截止前幾分鐘開始顯示紅色倒數

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
    busy: false,
    forId: '',       // 第 20 步：行政正在幫誰點（空白＝自己）
    forName: ''
  };

  // 第 20 步：幫別人點的時候，畫面最上面的黃色提示（index.html 不用改，這裡自己加）
  var $proxy = document.createElement('div');
  $proxy.className = 'proxy-banner';
  $proxy.hidden = true;
  $view.parentNode.insertBefore($proxy, $view);
  $proxy.addEventListener('click', function (e) {
    if (e.target.closest('[data-act="proxyOff"]')) setProxy('', '');
  });

  /* ---------- 第 25 步：首次使用導覽（只有文字；看過記在這支手機） ---------- */

  var GUIDE_KEY = 'yk_guide_v2'; // 第 31 步：說明改了，讓大家再看一次
  var GUIDE_PAGES = [
    { h: '選今天的店', p: '每天會開一家餐點、一家飲料。在首頁找到想點的店，按「開始點餐」。' },
    { h: '選品項、送出', p: '選好加進購物車，最後按綠色「送出訂單」，看到大勾勾才算點好。' },
    { h: '截止前都可以改', p: '截止前都可以回首頁「修改訂單」或「取消訂單」。餐點送到後，再付錢給行政。' }
  ];
  var $guide = document.createElement('div');
  $guide.className = 'guide-wrap';
  $guide.hidden = true;
  document.body.appendChild($guide);
  var guidePage = 0;

  function guideSeen() { try { return !!localStorage.getItem(GUIDE_KEY); } catch (x) { return true; } }
  function markGuideSeen() { try { localStorage.setItem(GUIDE_KEY, '1'); } catch (x) {} }

  function openGuide() { guidePage = 0; renderGuide(); $guide.hidden = false; syncBack(); }
  function closeGuide() { $guide.hidden = true; markGuideSeen(); syncBack(); } // 第 38 步：syncBack
  function maybeShowGuide() {
    if (S.forId || !$guide.hidden || guideSeen()) return;
    openGuide();
  }

  function renderGuide() {
    var g = GUIDE_PAGES[guidePage];
    var last = guidePage === GUIDE_PAGES.length - 1;
    $guide.innerHTML = '<div class="sheet-backdrop"></div>' +
      '<section class="guide" role="dialog" aria-modal="true" aria-labelledby="guideTitle">' +
      '<p class="small muted guide-step">使用說明 ' + (guidePage + 1) + ' / ' + GUIDE_PAGES.length + '</p>' +
      '<h2 id="guideTitle">' + esc(g.h) + '</h2>' +
      '<p>' + esc(g.p) + '</p>' +
      '<div class="guide-dots" aria-hidden="true">' + GUIDE_PAGES.map(function (x, i) {
        return '<span class="' + (i === guidePage ? 'on' : '') + '"></span>';
      }).join('') + '</div>' +
      '<div class="btn-row">' +
      (last ? '' : '<button class="btn" data-gact="skip">略過</button>') +
      (guidePage ? '<button class="btn" data-gact="prev">上一步</button>' : '') +
      '<button class="btn primary" data-gact="' + (last ? 'done' : 'next') + '">' + (last ? '開始使用' : '下一步') + '</button>' +
      '</div></section>';
  }

  $guide.addEventListener('click', function (e) {
    var b = e.target.closest('[data-gact]');
    if (!b) return;
    var a = b.getAttribute('data-gact');
    if (a === 'next') { guidePage++; return renderGuide(); }
    if (a === 'prev') { guidePage--; return renderGuide(); }
    closeGuide();
  });

  function guideLink() {
    return S.forId ? '' : '<p class="center-text guide-link"><button class="link-btn" data-act="guide">使用說明</button></p>';
  }

  var PROXY_ACTIONS = { init: true, menu: true, submit: true, cancel: true, history: true };

  /* ---------- 呼叫後端 ---------- */

  // 第 16 步：LINE 登入完成前先不送出請求（先顯示上次的首頁時，按鈕可能比登入還早被按）
  var liffReadyResolve;
  var liffReady = new Promise(function (r) { liffReadyResolve = r; });

  // 第 16 步：送單這類要排隊的操作，遇到 BUSY（系統忙碌）自動再送一次
  var RETRY_ON_BUSY = { submit: true, cancel: true, apply: true };

  function api(action, data) {
    return liffReady.then(function () { return apiOnce(action, data); }).catch(function (e) {
      if (e && e.code === 'BUSY' && RETRY_ON_BUSY[action]) {
        return new Promise(function (r) { setTimeout(r, 1500); }).then(function () { return apiOnce(action, data); });
      }
      throw e;
    });
  }

  // 第 20 步：幫別人點的時候，每個請求都帶上對方的 LineID（後端會再確認自己是行政）
  function withFor(action, data) {
    data = data || {};
    if (S.forId && PROXY_ACTIONS[action] && !data.forLineId) {
      var copy = {};
      Object.keys(data).forEach(function (k) { copy[k] = data[k]; });
      copy.forLineId = S.forId;
      return copy;
    }
    return data;
  }

  var NET_MSG = '網路連線不穩，請確認網路後再按一次。'; // 第 37 步

  function apiOnce(action, data) {
    var idToken = window.liff ? liff.getIDToken() : '';
    return fetch(CFG.API_URL, {
      method: 'POST',
      // 用 text/plain 送出，瀏覽器不會先發 CORS 預檢（Apps Script 不處理預檢）
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: action, idToken: idToken, data: withFor(action, data) }),
      redirect: 'follow'
    }).catch(function () {
      // 第 37 步：斷線時瀏覽器只給英文（Failed to fetch／Load failed），改成中文
      throw new Error(NET_MSG);
    }).then(function (r) {
      if (!r.ok) throw new Error('連線失敗（' + r.status + '），請稍後再試一次。');
      return r.json().catch(function () { throw new Error('伺服器回應讀取失敗，請稍後再試一次。'); }); // 第 37 步
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
  // 第 46 步：?view=vote 直接開投票頁（和 ?view=history 一樣的看法）
  var wantVote = (function () {
    var q = location.search;
    var m = q.match(/[?&]liff\.state=([^&]*)/);
    if (m) { try { q += '&' + decodeURIComponent(m[1]).replace(/^[^?]*\?/, ''); } catch (x) {} }
    return /(^|[?&])view=vote(&|$)/.test(q);
  })();

  function start() {
    if (!CFG.LIFF_ID || !CFG.API_URL) return showFatal('點餐頁還沒設定完成（config.js 的 LIFF_ID 或 API_URL 是空的），請通知行政。');
    if (!window.liff) return showFatal('LINE 登入元件載入失敗，請關閉後重新開啟。');
    var cached = !wantHistory && !wantVote && readHomeCache();
    if (cached) { S.home = cached; S.homeStale = true; go('home'); }
    liff.init({ liffId: CFG.LIFF_ID }).then(function () {
      if (!liff.isLoggedIn()) {
        liff.login({ redirectUri: location.href });
        return new Promise(function () {}); // 等待跳轉
      }
      liffReadyResolve();
      return loadHome(!!cached);
    }).catch(function (e) { showFatal(e.message); });
  }

  // quiet = true：畫面上已經有上次的首頁，不要換成「載入中…」
  function loadHome(quiet) {
    if (!quiet) setLoading('載入中…');
    S.prefetch = {}; // 首頁重新讀了，背景預載的菜單也要重新載
    return api('init').then(function (d) {
      S.homeStale = false;
      if (!S.forId) saveHomeCache(d); // 第 20 步：幫別人點的首頁不存
      if (S.forId && !d.forUser) { S.forId = ''; S.forName = ''; } // 對方已不在名單
      var keepView = quiet && S.view !== 'home'; // 等待時已經點進菜單了，就不要跳回首頁
      S.home = d;
      if (!keepView) { S.menu = null; S.cart = []; go('home'); }
      // 第 4 步：圖文選單「我的訂單」用 ?view=history 開啟時，直接進我的訂單（只在第一次載入時）
      if (wantHistory && d.user.status === '核准') { wantHistory = false; openHistory(); return; }
      if (wantVote && d.user.status === '核准') { wantVote = false; if (d.vote) { openVote(); return; } } // 第 46 步
      prefetchMenus();
    }).catch(function (e) { S.homeStale = false; showError(e); });
  }

  /* ---------- 第 16 步：上次的首頁、背景預載菜單 ---------- */

  var HOME_KEY = 'yk_home_v1';

  function localToday() {
    var d = new Date();
    function p2(n) { return (n < 10 ? '0' : '') + n; }
    return d.getFullYear() + '-' + p2(d.getMonth() + 1) + '-' + p2(d.getDate());
  }

  function readHomeCache() {
    try {
      var d = JSON.parse(localStorage.getItem(HOME_KEY) || 'null');
      if (d && d.today === localToday() && d.user && d.user.status === '核准') return d;
    } catch (x) {}
    return null;
  }

  function saveHomeCache(d) {
    try {
      if (d && d.user && d.user.status === '核准') localStorage.setItem(HOME_KEY, JSON.stringify(d));
      else localStorage.removeItem(HOME_KEY);
    } catch (x) {}
  }

  // 一家一家載（不同時送出），避免大家同時打開時一次佔用太多 Apps Script 執行數
  function prefetchMenus() {
    var list = ((S.home && S.home.sessions) || []).filter(function (s) { return !s.canceled; });
    var token = S.prefetch;
    list.reduce(function (chain, s) {
      return chain.then(function () {
        if (S.prefetch !== token || token[s.id]) return;
        var p = api('menu', { sessionId: s.id });
        token[s.id] = p;
        return p.catch(function () { if (S.prefetch === token) delete token[s.id]; });
      });
    }, Promise.resolve());
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
    S.err = false; // 第 38 步
    renderProxyBanner(); // 第 20 步
    if (S.view === 'menu' || S.view === 'cart' || S.view === 'confirm') saveCartDraft(); // 第 18 步
    if (S.view === 'confirm') S.view = 'cart'; // 第 31 步：確認頁已拿掉，併進購物車
    ({ home: renderHome, menu: renderMenu, cart: renderCart, history: renderHistory, done: renderDone, vote: renderVote })[S.view](); // 第 46 步：vote
    refreshCountdown();
    syncBack(); // 第 38 步
  }

  /* ---------- 第 38 步：手機返回鍵回上一層（原本 Android 按返回會直接關掉點餐頁） ----------
     做法：不在首頁、或有視窗開著時，在瀏覽器歷史紀錄多放一筆「記號」。
     按返回鍵時瀏覽器先吃掉記號（不會離開頁面），再做和左上角「‹」一樣的動作。
     用「‹」回到首頁時，自己把記號清掉，首頁按一次返回就能離開。 */

  var guardOn = false; // 歷史紀錄裡現在有沒有記號
  var skipPop = 0;     // 自己清記號時觸發的 popstate 要略過

  function canGoBack() {
    return !$guide.hidden || !$sheet.hidden || S.err || S.view !== 'home';
  }

  function syncBack() {
    if (!window.history || !history.pushState) return;
    var want = canGoBack();
    if (want && !guardOn) {
      try { history.pushState({ ykBack: 1 }, ''); guardOn = true; } catch (x) {}
    } else if (!want && guardOn) {
      guardOn = false; skipPop++; history.back();
    }
  }

  function goBack() {
    if (S.busy) return; // 送出中先不動，等送完
    if (!$guide.hidden) return closeGuide();
    if (!$sheet.hidden) return askCloseSheet(); // 第 40 步：有改過才問；不放棄的話 popstate 會再放一筆記號
    if (S.err) { S.view = 'loading'; return loadHome(); } // 錯誤畫面：跟按「回首頁」一樣
    if (S.view === 'cart') return go('menu');
    if (S.view === 'home') return;
    // 菜單、我的訂單、送出成功、讀取中 → 首頁
    if (S.view === 'menu' && S.menu && S.menu.session.open && S.cart.length && cartChanged()) toast('購物車已暫存，截止前記得回來送出');
    go('home');
  }

  window.addEventListener('popstate', function () {
    if (skipPop) { skipPop--; return; }
    guardOn = false; // 記號被返回鍵吃掉了
    goBack();
    syncBack(); // 還沒回到首頁就再放一筆記號
  });

  $back.addEventListener('click', function () {
    if (S.view === 'cart') return go('menu');
    // 第 18 步：購物車已經存在手機裡，離開不用再確認，只提醒一下
    if (S.view === 'menu' && S.menu && S.menu.session.open && S.cart.length && cartChanged()) toast('購物車已暫存，截止前記得回來送出');
    go('home');
  });
  $historyBtn.addEventListener('click', openHistory);

  /* ---------- 第 42 步：等待核准時自動檢查 ---------- */

  var PENDING_POLL_MS = 30000;
  var pendingTimer = null;
  var pendingBusy = false;
  var pendingLast = clockNow();

  function clockNow() {
    var d = new Date();
    function p2(n) { return (n < 10 ? '0' : '') + n; }
    return p2(d.getHours()) + ':' + p2(d.getMinutes()) + ':' + p2(d.getSeconds());
  }

  function isPendingHome() {
    return S.view === 'home' && !S.forId && S.home && S.home.user && S.home.user.status === '待審核';
  }

  function stopPendingPoll() { if (pendingTimer) clearTimeout(pendingTimer); pendingTimer = null; }

  function startPendingPoll() {
    stopPendingPoll();
    pendingTimer = setTimeout(pendingTick, PENDING_POLL_MS);
  }

  function pendingTick() {
    pendingTimer = null;
    if (!isPendingHome()) return;
    if (document.hidden || pendingBusy) { startPendingPoll(); return; } // 在背景就先不查
    pendingBusy = true;
    api('init').then(function (d) {
      pendingBusy = false;
      pendingLast = clockNow();
      if (!isPendingHome()) return;
      if (d.user && d.user.status !== '待審核') {
        // 核准（或停用）了：換成新的首頁，核准的話 renderHome 會照舊跳出使用說明
        S.home = d;
        saveHomeCache(d);
        go('home');
        prefetchMenus();
        return;
      }
      S.home = d;
      var el = document.getElementById('pendingCheck'); // 只更新時間，不重畫（姓名欄正在打字也不會被清掉）
      if (el) el.textContent = '⟳ 每 ' + (PENDING_POLL_MS / 1000) + ' 秒自動檢查一次（上次檢查時間 ' + pendingLast + '）';
      startPendingPoll();
    }).catch(function () { pendingBusy = false; startPendingPoll(); }); // 網路不穩就下次再查，不跳錯誤
  }

  document.addEventListener('visibilitychange', function () {
    if (!document.hidden && isPendingHome() && pendingTimer) { stopPendingPoll(); pendingTick(); } // 回到前景馬上查一次
  });

  /* ---------- 首頁 ---------- */

  function renderHome() {
    $title.textContent = 'YK中午吃什麼-點餐系統';
    var u = S.home.user;
    var hello = '<p class="muted small">' + esc(S.home.today) + '　你好，' + esc(u.realName || u.lineName || '') +
      (S.forId ? '　<b>（正在幫 ' + esc(S.forName) + ' 點）</b>' : '') +
      (S.homeStale ? '　<span class="tag">更新中…</span>' : '') + '</p>'; // 第 16 步：先顯示上次的首頁時

    if (u.status === '未申請' || u.status === '待審核') {
      var pending = u.status === '待審核';
      if (pending && !pendingTimer) pendingLast = clockNow(); // 第 42 步：剛讀過首頁，就是剛檢查過
      $view.innerHTML = hello +
        '<div class="card">' +
        (pending
          ? '<h2>已送出申請</h2><p>等待核准後就可以點餐。</p>' + // 第 42 步
            '<p class="muted small" id="pendingCheck">⟳ 每 ' + (PENDING_POLL_MS / 1000) + ' 秒自動檢查一次（上次檢查時間 ' + esc(pendingLast) + '）</p>'
          : '<h2>第一次使用</h2><p>請填寫你的姓名送出申請，行政核准後就可以點餐。</p>') +
        '<label class="field" for="realName">姓名</label>' +
        '<input id="realName" type="text" maxlength="20" autocomplete="name" value="' + esc(u.realName || '') + '" placeholder="例如：王小明">' +
        '<div class="btn-row"><button class="btn primary" data-act="apply">' + (pending ? '更新姓名' : '送出申請') + '</button></div>' +
        (pending ? '<div class="btn-row"><button class="btn" data-act="reload">重新整理</button></div>' : '') +
        '</div>';
      if (pending) startPendingPoll(); else stopPendingPoll(); // 第 42 步
      return;
    }
    stopPendingPoll(); // 第 42 步
    if (u.status !== '核准') {
      $view.innerHTML = hello + '<div class="card"><h2>帳號已停用</h2><p>如有疑問請聯絡行政。</p></div>';
      return;
    }

    var all = S.home.sessions || [];
    var list = all.filter(function (s) { return !s.canceled; }); // 第 29 步：已取消的團不顯示
    var voided = voidedNotices(all); // 第 37 步
    if (!list.length) {
      $view.innerHTML = hello + proxyPicker() + voided + '<div class="card center"><p>' + (all.length ? '今天沒有可以點餐的店。' : '今天還沒有開團。') + '</p><button class="btn" data-act="reload">重新整理</button></div>' + voteCard() + guideLink(); // 第 46 步
      maybeShowGuide(); // 第 25 步
      return;
    }
    list = list.slice().sort(function (a, b) { return a.type === b.type ? 0 : (a.type === '餐點' ? -1 : 1); });
    var who = S.forId ? S.forName : '你'; // 第 20 步
    $view.innerHTML = hello + proxyPicker() + voided + '<div id="cdHome"></div>' + list.map(function (s) {
      var o = s.myOrder;
      var draftN = s.open ? draftCount(s.id) : 0; // 第 18 步：手機裡還沒送出的購物車
      var btns;
      var notice = s.notice ? '<div class="notice">公告：' + esc(s.notice) + '</div>' : '';
      // 第 7 步：取消的團
      if (s.canceled) {
        var v = s.voidedOrder;
        return '<div class="card">' +
          '<div class="row"><span class="tag type">' + esc(s.type) + '</span><span class="tag warn">已取消</span></div>' +
          '<h2 style="margin-top:8px;text-decoration:line-through;color:#888">' + esc(s.storeName) + '</h2>' + notice +
          (v ? '<p class="small">' + esc(who) + '在這團的訂單（$' + v.total + '）已作廢。</p>'
             : '<p class="small muted">這一團已取消。</p>') +
          '</div>';
      }
      if (s.open) {
        btns = o
          ? '<button class="btn" data-act="cancel" data-id="' + esc(s.id) + '">取消訂單</button>' +
            '<button class="btn primary" data-act="menu" data-id="' + esc(s.id) + '">修改訂單</button>'
          : '<button class="btn primary" data-act="menu" data-id="' + esc(s.id) + '">' + (draftN ? '繼續點餐' : '開始點餐') + '</button>';
      } else {
        btns = '<button class="btn" data-act="menu" data-id="' + esc(s.id) + '">看菜單</button>';
      }
      return '<div class="card">' +
        '<div class="row"><span class="tag type">' + esc(s.type) + '</span>' +
        (s.late ? '<span class="tag warn">已截止・行政補單</span>' // 第 20 步
          : s.open ? '<span class="tag open">開放中・' + esc(s.cutoff) + ' 截止</span>' : '<span class="tag">已截止</span>') + '</div>' +
        '<h2 style="margin-top:8px">' + esc(s.storeName) + '</h2>' + notice +
        (o ? '<p class="small">' + esc(who) + '已點餐：<b>$' + o.total + '</b>　' + payTag(o) + '</p>' // 第 40 步
           : '<p class="small muted">' + esc(who) + (s.open ? '還沒點餐' : '這團沒有點餐') + '</p>') +
        (draftN ? '<div class="cart-pending">⚠ 購物車有 ' + draftN + ' 份' + (o ? '修改' : '') + '<b>還沒送出</b>，按「' + (o ? '修改訂單' : '繼續點餐') + '」→「送出訂單」才算點好</div>' : '') + // 第 31 步：紅框
        editHint(s, o) + // 第 25 步
        '<div class="btn-row">' + btns + '</div></div>';
    }).join('') + voteCard() + guideLink(); // 第 46 步
    maybeShowGuide(); // 第 25 步
  }

  // 第 40 步：付款標籤。credit＝改單前已付、可以抵用的錢（第 39 步後端給的）
  function payTag(o) {
    if (o.paid) return '<span class="tag open">已付款</span>';
    var c = Number(o.credit) || 0;
    if (c > 0) {
      var diff = (Number(o.total) || 0) - c;
      if (diff > 0) return '<span class="tag due">已付 $' + c + '，差 $' + diff + '</span>';
      if (diff < 0) return '<span class="tag due">已付 $' + c + '，要退 $' + (-diff) + '</span>';
      return '<span class="tag open">已付款</span>';
    }
    return '<span class="tag due">待付款</span>'; // 第 40 步：原本橘色「未付款」，餐點送到才收錢，改成灰色
  }

  // 第 37 步：取消的團有作廢的訂單時，首頁最上方的黃色提示
  function voidedNotices(all) {
    var who = S.forId ? S.forName + ' 的' : '你的';
    return all.filter(function (s) { return s.canceled && s.voidedOrder; }).map(function (s) {
      var v = s.voidedOrder;
      return '<div class="notice">' + esc(s.storeName) + '已取消，' + esc(who) + ' $' + esc(v.total) + ' 訂單已作廢' +
        (v.paid ? '。已付款，請找行政退款' : '') + '</div>';
    }).join('');
  }

  // 第 25 步：已點餐時，按鈕上方說明還能不能改
  function editHint(s, o) {
    if (!o) return '';
    if (s.late) return '<p class="small edit-hint">已截止，行政可以補單或更改</p>';
    if (s.open) return '<p class="small edit-hint">' + esc(s.cutoff) + ' 截止前都可以修改或取消</p>';
    return '<p class="small edit-hint muted">已截止</p>'; // 第 31 步：拿掉「要更改請找行政」
  }

  /* ---------- 第 46 步：投票 ---------- */

  // 首頁的候選店卡片：介紹下一次有哪些店，不催投票
  function voteCard() {
    var v = S.home && S.home.vote;
    if (!v || S.forId) return '';
    return '<div class="card vote-card"><h3>🍱 ' + esc(v.when) + ' 候選店</h3>' +
      v.types.map(function (t) {
        var mine = t.candidates.filter(function (c) { return c.id === t.myVote; })[0];
        return '<div class="vote-row"><span class="tag type">' + esc(t.type) + '</span>' +
          esc(t.candidates.map(function (c) { return c.name; }).join('・')) +
          (mine ? '<span class="vote-mine">✓ 你選了' + esc(mine.name) + '</span>' : '') + '</div>';
      }).join('') +
      '<p class="small muted vote-hint">想吃哪家可以選一下（' + esc(v.cutoffLabel) + ' 前）</p>' +
      '<div class="vote-more"><button class="link-btn" data-act="vote">看看大家想吃什麼 ›</button></div></div>';
  }

  function openVote() {
    setLoading('讀取中…');
    S.view = 'loading';
    api('voteInfo').then(function (d) {
      if (S.view !== 'loading') return; // 讀取中按了返回
      S.voteInfo = d;
      go('vote');
    }).catch(showError);
  }

  function renderVote() {
    var days = (S.voteInfo && S.voteInfo.days) || [];
    $title.textContent = days.length === 1 ? days[0].label + '吃什麼' : '想吃哪家';
    if (!days.length) {
      $view.innerHTML = '<div class="card center"><p>目前沒有進行中的投票。</p><button class="btn" data-act="home">回首頁</button></div>';
      return;
    }
    $view.innerHTML = days.map(function (d) {
      return (days.length > 1 ? '<h3 class="vote-day">' + esc(d.label) + '</h3>' : '') +
        '<p class="small muted">' + esc(d.cutoffLabel) + ' 截止</p>' +
        d.types.map(function (t) {
          var voted = !!t.myVote;
          var total = voted ? t.candidates.reduce(function (n, c) { return n + (c.count || 0); }, 0) : 0;
          return '<div class="card"><div class="vote-head"><span class="tag type">' + esc(t.type) + '</span>' +
            '<span class="small muted">' + (voted ? '可改票' : '投完看票數') + '</span></div>' +
            t.candidates.map(function (c) {
              var me = c.id === t.myVote;
              var pct = voted && total ? Math.round((c.count || 0) * 100 / total) : 0;
              return '<button class="vote-opt' + (me ? ' me' : '') + '" data-act="castVote" data-date="' + esc(d.date) +
                '" data-type="' + esc(t.type) + '" data-id="' + esc(c.id) + '"' + (S.voteBusy ? ' disabled' : '') + '>' +
                (voted ? '<span class="vote-fill" style="width:' + pct + '%"></span>' : '') +
                '<span class="vote-dot"></span><span class="vote-name">' + esc(c.name) + '</span>' +
                (voted ? '<span class="vote-n">' + (c.count || 0) + ' 票</span>' : '') + '</button>';
            }).join('') + '</div>';
        }).join('');
    }).join('') + '<p class="small muted center-text">最後由行政決定</p>';
  }

  function castVote(date, type, storeId) {
    var day = (S.voteInfo.days || []).filter(function (d) { return d.date === date; })[0];
    var t = day && day.types.filter(function (x) { return x.type === type; })[0];
    if (!t || t.myVote === storeId || S.voteBusy) return;
    S.voteBusy = true;
    renderVote();
    api('vote', { date: date, type: type, storeId: storeId }).then(function (d) {
      S.voteBusy = false;
      S.voteInfo = d;
      syncVoteCard(d);
      if (S.view === 'vote') renderVote();
      toast('已選好，截止前都可以改');
    }).catch(function (e) {
      S.voteBusy = false;
      if (e && e.code === 'CLOSED') { toast(e.message); return openVote(); }
      if (S.view === 'vote') renderVote();
      showError(e);
    });
  }

  // 投完回首頁時，卡片上的「你選了」也要跟著變（不用重新讀首頁）
  function syncVoteCard(d) {
    var v = S.home && S.home.vote;
    if (!v) return;
    var same = (d.days || []).filter(function (x) { return x.date === v.date; })[0];
    if (!same) return;
    v.types.forEach(function (t) {
      var n = same.types.filter(function (x) { return x.type === t.type; })[0];
      if (n) t.myVote = n.myVote;
    });
    if (!S.forId) saveHomeCache(S.home);
  }

  /* ---------- 菜單 ---------- */

  function openMenu(sessionId) {
    setLoading('讀取菜單…');
    S.view = 'loading';
    // 第 16 步：背景已經預載（或正在載）就直接用；只用一次，之後回首頁會重新載
    var pre = S.prefetch && S.prefetch[sessionId];
    if (pre) delete S.prefetch[sessionId];
    (pre || api('menu', { sessionId: sessionId })).catch(function (e) {
      if (pre) return api('menu', { sessionId: sessionId }); // 預載失敗就重新讀一次
      throw e;
    }).then(function (d) {
      if (S.view !== 'loading') return; // 第 38 步：讀取中按了返回鍵，就不要再跳進菜單
      S.menu = d;
      S.cart = d.myOrder ? d.myOrder.lines.map(function (l) {
        return { itemId: l.itemId, optionIds: l.optionIds.slice(), qty: l.qty, note: l.note, stale: !!l.stale, oldName: l.name };
      }) : [];
      S.cartStart = JSON.stringify(S.cart);
      S.search = '';
      S.lateFail = false; // 第 40 步
      restoreCartDraft(); // 第 18 步
      go('menu');
    }).catch(showError);
  }

  function cartChanged() { return JSON.stringify(S.cart) !== S.cartStart; }

  // 第 15 步：店名、備註下方的「看菜單圖」連結（開雲端硬碟看圖頁，可放大，按返回回到點餐頁）
  function menuImageLinks(list) {
    if (!list || !list.length) return '';
    var style = ' style="display:inline-block;margin:6px 12px 0 0;font-weight:600"';
    return '<p class="small" style="margin:0">' + list.map(function (url, i) {
      var label = list.length > 1 ? '📋 菜單圖 ' + (i + 1) : '📋 看菜單圖';
      return '<a href="' + esc(url) + '" target="_blank" rel="noopener"' + style + '>' + label + '</a>';
    }).join('') + '</p>';
  }

  function renderMenu() {
    var m = S.menu;
    $title.textContent = m.store.name;
    var cats = [];
    m.items.forEach(function (i) { if (cats.indexOf(i.cat) < 0) cats.push(i.cat); });
    var counts = {};
    S.cart.forEach(function (l) { counts[l.itemId] = (counts[l.itemId] || 0) + l.qty; });

    var head = '<div class="store-info"><span class="tag type">' + esc(m.session.type) + '</span> ' +
      (m.session.late ? '<span class="tag warn">已截止・行政補單</span>' // 第 20 步
        : m.session.open ? '<span class="tag open">' + esc(m.session.cutoff) + ' 截止</span>' : '<span class="tag">已截止</span>') +
      (m.store.note ? '<p class="small muted">' + esc(m.store.note) + '</p>' : '') + menuImageLinks(m.store.menuImages) + '</div>';
    if (m.myOrder && m.session.open) head += '<div class="notice">你正在修改訂單，送出後會取代原本的訂單（$' + m.myOrder.total + '）。</div>';
    if (m.session.notice) head += '<div class="notice">公告：' + esc(m.session.notice) + '</div>';
    if (m.session.canceled) head += '<div class="notice">這一團已經取消，只能看菜單。</div>';
    else if (!m.session.open) head += '<div class="notice">這一團已經截止，只能看菜單。</div>';

    if (m.session.late) head += '<div class="notice">這一團已經截止，你是行政，可以幫忙補單或改單。</div>';
    if (m.session.open && !S.cart.length && !S.forId) head += lastOrderHtml(); // 第 18 步：上次在這家點的（第 20 步：幫別人點時不顯示）

    var chips = cats.length > 1 ? '<nav class="cats">' + cats.map(function (c, i) {
      return '<button class="chip' + (i === 0 ? ' on' : '') + '" data-act="cat" data-i="' + i + '">' + esc(c) + '</button>';
    }).join('') + '</nav>' : '';
    // 第 18 步：搜尋框和分類列一起固定在頂端
    var tools = '<div class="menu-tools" id="menuTools"><div class="search">' +
      '<input id="menuSearch" type="search" placeholder="搜尋品項，例如：雞腿、紅茶" autocomplete="off" value="' + esc(S.search || '') + '">' +
      '<button class="search-clear" data-act="clearSearch" aria-label="清除搜尋"' + (S.search ? '' : ' hidden') + '>×</button></div>' +
      chips + '</div>';

    var body = cats.map(function (c, ci) {
      return '<h3 class="cat-title" id="cat' + ci + '" data-ci="' + ci + '">' + esc(c) + '</h3>' +
        m.items.filter(function (i) { return i.cat === c; }).map(function (i) {
          return '<button class="item" data-act="item" data-ci="' + ci + '" data-id="' + esc(i.id) + '" data-q="' + esc((i.name + ' ' + (i.desc || '')).toLowerCase()) + '"' + (m.session.open ? '' : ' disabled') + '>' +
            '<span><span class="name">' + esc(i.name) + '</span>' + (counts[i.id] ? '<span class="count">' + counts[i.id] + '</span>' : '') +
            (i.desc ? '<br><span class="desc">' + esc(i.desc) + '</span>' : '') + '</span>' +
            '<span class="price">$' + i.price + '</span></button>';
        }).join('');
    }).join('');

    $view.innerHTML = head + tools + body + '<p class="center muted" id="noMatch" hidden>找不到符合的品項</p>';
    document.getElementById('menuSearch').addEventListener('input', function (e) { applySearch(e.target.value); });
    if (S.search) applySearch(S.search); else spyCategory(); // 重畫後（例如加入購物車）分類標示跟著目前位置
    if (m.session.open) showCartBar('查看購物車', function () { go('cart'); }, !S.cart.length);
  }

  function showCartBar(label, onClick, disabled, wide) {
    var n = S.cart.reduce(function (s, l) { return s + l.qty; }, 0);
    $bottom.innerHTML = '<div class="cd-bar" id="cdBar" hidden></div><div class="inner">' +
      (wide ? '' : '<div class="sum"><span class="small muted">共 ' + n + ' 份</span><br><b>$' + cartTotal() + '</b></div>') + // 第 31 步：購物車頁只放一顆全寬大按鈕
      '<button class="btn primary' + (wide ? ' send-big' : '') + '" id="bottomBtn"' + (disabled ? ' disabled' : '') + '>' + esc(label) + '</button></div>';
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
  // 第 6 步：合計必須是整數才能送出（例如 7.5 元的水餃點單數顆會出現 .5 元）
  function isWhole(n) { return Math.abs(n - Math.round(n)) < 1e-6; }
  function wholeMsg() { return '合計 $' + cartTotal() + ' 不是整數，請調整數量'; }

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
    draft.start = draftSig(); // 第 40 步：記下打開時的樣子，關掉時比對有沒有改
    renderSheet();
    $sheet.hidden = false;
    syncBack(); // 第 38 步
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
      '<div class="group"><div class="group-head"><b>數量</b></div>' + // 第 36 步：拿掉「最多 20 份」標籤（上限仍保留）
      '<div class="qty"><button data-sact="dec" aria-label="減少">−</button><span>' + draft.qty + '</span><button data-sact="inc" aria-label="增加">＋</button></div></div>' +
      '<label class="field" for="lineNote">備註（選填）</label>' +
      '<input id="lineNote" type="text" maxlength="50" value="' + esc(draft.note) + '" placeholder="例如：飯少、不要香菜">' +
      '<div class="sheet-foot btn-row"><button class="btn" data-sact="close">取消</button>' + // 第 40 步：固定在視窗底部
      '<button class="btn primary" data-sact="save">' + (draft.index != null ? '更新' : '加入購物車') + '　$' + linePrice(draft) + '</button></div>';
  }

  $sheetBody.addEventListener('click', function (e) {
    var b = e.target.closest('[data-sact]');
    if (!b) return;
    var noteEl = document.getElementById('lineNote');
    if (noteEl) draft.note = noteEl.value;
    var act = b.dataset.sact;
    if (act === 'close') return closeSheet();
    if (act === 'inc') {
      if (draft.qty >= MAX_QTY) return toast('同一行最多 ' + MAX_QTY + ' 份');
      draft.qty += 1;
    }
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
  $sheet.querySelector('[data-close]').addEventListener('click', askCloseSheet); // 第 40 步：點背景有改過先問

  function closeSheet() { $sheet.hidden = true; syncBack(); } // 第 38 步：syncBack

  // 第 40 步：品項視窗有沒有改過（選項、數量、備註）
  function draftSig() {
    var noteEl = document.getElementById('lineNote');
    var note = noteEl && !$sheet.hidden ? noteEl.value : draft.note;
    return JSON.stringify([draft.optionIds.slice().sort(), draft.qty, String(note || '').trim()]);
  }
  function askCloseSheet() {
    if ($sheet.hidden || !draft) return closeSheet();
    if (draftSig() !== draft.start && !window.confirm('還沒加入購物車，要放棄嗎？')) return;
    closeSheet();
  }

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

  // 第 31 步：購物車就是最後一步，底部大按鈕直接送出（原本的「確認訂單」頁拿掉）
  function sendLabel() {
    return (S.menu && S.menu.myOrder ? '送出修改' : '送出訂單') + ' $' + cartTotal();
  }

  function renderCart() {
    var m = S.menu;
    $title.textContent = '購物車';
    if (!S.cart.length && m.myOrder && m.session.open) {
      // 第 40 步：改單時刪光了，送不出空的單，引導改成取消訂單
      $view.innerHTML = '<div class="card center"><p><b>購物車已清空，要取消這筆訂單嗎？</b></p>' +
        '<p class="small muted">原本的 $' + m.myOrder.total + ' 訂單還在，沒有取消前仍算數。</p>' +
        '<div class="btn-row"><button class="btn danger" data-act="cancel" data-id="' + esc(m.session.id) + '">取消這筆訂單</button>' +
        '<button class="btn" data-act="back">回菜單</button></div></div>';
      return;
    }
    if (!S.cart.length) {
      $view.innerHTML = '<div class="card center"><p>購物車是空的。</p><button class="btn" data-act="back">回菜單</button></div>';
    } else {
      $view.innerHTML = (S.forId ? '<div class="notice">這張單會記在 <b>' + esc(S.forName) + '</b> 名下，並註明是行政代點。</div>' : '') + // 第 20 步
        (S.lateFail ? lateFailHtml()
          : '<div class="notice unsent">⚠ 還沒送出喔！確認品項和金額後，按下方「' + (m.myOrder ? '送出修改' : '送出訂單') + '」才算點好。</div>') + // 第 40 步
        '<div class="card"><div class="row"><h2>' + esc(m.store.name) + '</h2><span class="tag type">' + esc(m.session.type) + '</span></div>' +
        '<p class="small muted">' + esc(m.session.date) + '・' + esc(m.session.cutoff) + ' 截止・訂購人 ' + esc(m.userName || '') + '</p>' +
        S.cart.map(function (l, i) { return lineHtml(l, i, true); }).join('') +
        '<div class="total-row"><span>總金額</span><span>$' + cartTotal() + '</span></div></div>' +
        (isWhole(cartTotal()) ? '' : '<div class="notice">' + wholeMsg() + '才能送出。</div>') +
        '<button class="btn block" data-act="back">＋ 繼續加點</button>' +
        '<p class="small muted center-text">送出後，截止前仍可回首頁修改或取消。</p>';
    }
    var stale = S.cart.some(function (l) { return l.stale; });
    var odd = !isWhole(cartTotal());
    if (S.lateFail) return showCartBar('已截止，請找行政補單', submitOrder, true, true); // 第 40 步
    showCartBar(stale ? '請先處理標示的品項' : (odd ? '金額需為整數' : sendLabel()), submitOrder, !S.cart.length || stale || odd || S.busy, true);
  }

  // 第 40 步：截止後送不出的提示＋複製購物車內容
  function lateFailHtml() {
    return '<div class="notice late-fail"><b>已過截止時間，這張單送不出去。</b><br>請找行政幫你補單，可以先複製購物車內容貼給行政。' +
      '<button class="btn primary block" data-act="copyCart" style="margin-top:8px">複製購物車內容</button>' +
      '<textarea id="cartText" class="copy-box" readonly hidden></textarea></div>';
  }
  function cartText() {
    var m = S.menu;
    return [m.session.type + '・' + m.store.name + '（' + m.session.date + '）', '訂購人：' + (S.forId ? S.forName : (m.userName || ''))]
      .concat(S.cart.map(function (l) {
        var item = itemOf(l.itemId);
        var o = !l.stale && optText(l);
        return '- ' + (item ? item.name : (l.oldName || l.itemId)) + ' ×' + l.qty + (o ? '（' + o + '）' : '') +
          (l.note ? ' 備註：' + l.note : '') + (l.stale ? '' : '　$' + linePrice(l));
      }), ['合計 $' + cartTotal()]).join('\n');
  }
  function copyCart() {
    var text = cartText();
    var box = document.getElementById('cartText');
    function fallback() {
      // LINE 內建瀏覽器有時不給直接複製：先試舊方法，再不行就顯示文字框讓人長按複製
      box.value = text; box.hidden = false;
      box.style.height = (text.split('\n').length * 22 + 26) + 'px';
      box.focus(); box.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (x) {}
      if (ok) { box.hidden = true; toast('已複製，可以貼給行政'); }
      else toast('請長按下方文字框，全選後複製');
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { toast('已複製，可以貼給行政'); }, fallback);
    } else fallback();
  }

  function submitOrder() {
    if (S.busy) return;
    if (!isWhole(cartTotal())) return alertMsg(wholeMsg());
    if (S.menu.session.late && !window.confirm('這一團已經截止，確定要' + (S.forId ? '幫 ' + S.forName + ' ' : '') + '補單嗎？')) return; // 第 20 步
    S.busy = true;
    var btn = document.getElementById('bottomBtn');
    btn.disabled = true; btn.textContent = '送出中…';
    var lines = S.cart.map(function (l) { return { itemId: l.itemId, optionIds: l.optionIds, qty: l.qty, note: l.note }; });
    var sent = S.cart.slice();
    api('submit', { sessionId: S.menu.session.id, lines: lines }).then(function (r) {
      S.busy = false;
      // 第 18 步：清掉暫存的購物車、記下「上次點的」，顯示已送出畫面
      clearCartDraft(S.menu.session.id);
      if (!S.forId) saveLastOrder(S.menu, sent); // 第 20 步：幫別人點的不記成自己的「上次點的」
      S.done = { menu: S.menu, lines: sent, total: r.total, edited: !!S.menu.myOrder };
      go('done');
      return loadHome(true); // 背景更新首頁資料，不換畫面
    }).catch(function (e) {
      S.busy = false;
      if (e.code === 'CLOSED' && /截止/.test(e.message || '')) { // 第 40 步：截止後送不出，引導找行政補單
        S.lateFail = true;
        render();
        loadHome(true); // 背景更新首頁（按鈕會變成「看菜單」）
        return;
      }
      btn.disabled = false; btn.textContent = sendLabel(); // 第 31 步
      alertMsg(e.message);
    });
  }

  function cancelOrder(sessionId) {
    if (!window.confirm(S.forId ? '確定要取消 ' + S.forName + ' 在這一團的訂單嗎？' : '確定要取消這一團的訂單嗎？\n取消後，截止前還可以重新點。')) return; // 第 25 步
    setLoading('取消中…');
    api('cancel', { sessionId: sessionId }).then(function () {
      clearCartDraft(sessionId); // 第 18 步
      toast('訂單已取消');
      return loadHome();
    }).catch(showError);
  }

  /* ---------- 我的訂單 ---------- */

  function openHistory() {
    setLoading('讀取訂單…');
    S.view = 'history';
    api('history').then(function (d) { if (S.view !== 'history') return; S.history = d; go('history'); }).catch(showError); // 第 38 步：讀取中按了返回就不跳
  }

  function renderHistory() {
    var d = S.history;
    $title.textContent = d.forName ? d.forName + ' 的訂單' : '我的訂單'; // 第 20 步
    var html = '<div class="card"><div class="row"><span>尚未付款</span><b style="font-size:22px">$' + d.unpaid + '</b></div>' +
      '<p class="small muted" style="margin:4px 0 0">只計算有效且尚未付款的訂單，現金請交給行政。</p></div>';
    if (!d.orders.length) html += '<p class="center muted">還沒有訂單紀錄。</p>';
    html += d.orders.map(function (o) {
      var st = o.status === '取消' ? '<span class="tag">已取消</span>'
        : o.status === '團取消' ? '<span class="tag warn">開團取消</span>'
        : payTag(o); // 第 40 步
      if (o.proxyBy) st = '<span class="tag">行政代點</span> ' + st; // 第 20 步
      return '<div class="card"><div class="row"><span class="small muted">' + esc(o.date) + '・' + esc(o.type) + '</span><span>' + st + '</span></div>' +
        '<div class="row"><h3>' + esc(o.storeName) + '</h3><b>$' + o.total + '</b></div>' +
        o.lines.map(function (l) {
          return '<div class="line"><div class="row"><span>' + esc(l.name) + ' × ' + l.qty + '</span><span>$' + l.sub + '</span></div>' +
            (l.options ? '<div class="opts-text">' + esc(l.options) + '</div>' : '') +
            (l.note ? '<div class="note">備註：' + esc(l.note) + '</div>' : '') + '</div>';
        }).join('') + '</div>';
    }).join('');
    $view.innerHTML = html;
  }

  /* ---------- 第 18 步：送出後的畫面 ---------- */

  function renderDone() {
    var d = S.done;
    var m = d.menu;
    $title.textContent = d.edited ? '訂單已修改' : '訂單已送出';
    var next = ((S.home && S.home.sessions) || []).filter(function (s) {
      return s.open && !s.canceled && !s.myOrder && s.id !== m.session.id;
    })[0];
    $view.innerHTML = '<div class="card done">' +
      '<div class="done-mark" aria-hidden="true">✓</div>' +
      '<h2 class="center-text">' + (d.edited ? '訂單已修改' : '訂單已送出') + '</h2>' +
      '<p class="center-text small muted">' + esc(m.session.type) + '・' + esc(m.store.name) + '・訂購人 ' + esc(m.userName || '') + '</p>' +
      d.lines.map(function (l, i) { return lineHtml(l, i, false); }).join('') +
      '<div class="total-row"><span>總金額</span><span>$' + d.total + '</span></div></div>' +
      (S.forId ? '<div class="notice">已記在 ' + esc(S.forName) + ' 名下（行政代點）。</div>'
        : '<div class="notice">' + esc(m.session.cutoff) + ' 截止前都可以回首頁修改或取消。餐點送到後再付錢給行政。</div>') +
      (next ? '<button class="btn primary block" data-act="menu" data-id="' + esc(next.id) + '">接著點' + esc(next.type) + '：' + esc(next.storeName) + '</button><div style="height:8px"></div>' : '') +
      (S.forId // 第 40 步：代點送出後問要繼續幫對方點，還是改回自己
        ? '<div class="btn-row"><button class="btn" data-act="home">繼續幫 ' + esc(S.forName) + ' 點</button>' +
          '<button class="btn primary" data-act="proxyOff">改回自己</button></div>'
        : '<button class="btn block" data-act="home">回首頁</button>');
  }

  /* ---------- 第 18 步：購物車暫存（存在這支手機，只限今天） ---------- */

  var DRAFT_KEY = 'yk_cart_v1';

  function readStore(key) {
    try { return JSON.parse(localStorage.getItem(key) || '{}') || {}; } catch (x) { return {}; }
  }
  function writeStore(key, obj) {
    try { localStorage.setItem(key, JSON.stringify(obj)); } catch (x) {}
  }

  // 第 20 步：幫別人點的購物車分開存（key 前面加對方的 LineID）
  function draftKey(sessionId) { return S.forId ? S.forId + '|' + sessionId : sessionId; }

  function readDrafts() {
    var all = readStore(DRAFT_KEY);
    var today = localToday();
    Object.keys(all).forEach(function (k) { if (!all[k] || all[k].date !== today) delete all[k]; });
    return all;
  }

  function plainLines(lines) {
    return lines.map(function (l) {
      var item = itemOf(l.itemId);
      return { itemId: l.itemId, optionIds: l.optionIds.slice(), qty: l.qty, note: l.note || '', name: item ? item.name : (l.oldName || l.name || '') };
    });
  }

  function saveCartDraft() {
    if (!S.menu || !S.menu.session.open) return;
    var all = readDrafts();
    var id = draftKey(S.menu.session.id);
    if (S.cart.length && cartChanged()) all[id] = { date: localToday(), cart: plainLines(S.cart) };
    else delete all[id];
    writeStore(DRAFT_KEY, all);
  }

  function clearCartDraft(sessionId) {
    var all = readDrafts();
    delete all[draftKey(sessionId)];
    writeStore(DRAFT_KEY, all);
  }

  function draftCount(sessionId) {
    var d = readDrafts()[draftKey(sessionId)];
    return d ? d.cart.reduce(function (s, l) { return s + (Number(l.qty) || 0); }, 0) : 0;
  }

  // 用現在的菜單檢查一行：品項還在、選項都還在、必選都選好，才算有效
  function lineValid(l) {
    var item = itemOf(l.itemId);
    if (!item) return false;
    var all = {};
    groupsOf(item).forEach(function (g) { g.options.forEach(function (o) { all[o.id] = true; }); });
    if (!(l.optionIds || []).every(function (id) { return all[id]; })) return false;
    return groupsOf(item).every(function (g) { return groupOk(g, l.optionIds || []); });
  }

  function restoreCartDraft() {
    var d = readDrafts()[draftKey(S.menu.session.id)];
    if (!d || !S.menu.session.open) return;
    S.cart = d.cart.map(function (l) {
      return { itemId: l.itemId, optionIds: (l.optionIds || []).slice(), qty: Math.min(MAX_QTY, Math.max(1, Number(l.qty) || 1)),
        note: l.note || '', stale: !lineValid(l), oldName: l.name };
    });
    toast('已帶回上次還沒送出的購物車');
  }

  /* ---------- 第 18 步：上次在這家點的（存在這支手機） ---------- */

  var LAST_KEY = 'yk_last_v1';

  function saveLastOrder(menu, lines) {
    var all = readStore(LAST_KEY);
    all[menu.store.name] = { date: menu.session.date || localToday(), lines: plainLines(lines.filter(function (l) { return !l.stale; })) };
    var keys = Object.keys(all).sort(function (a, b) { return all[a].date < all[b].date ? 1 : -1; });
    keys.slice(40).forEach(function (k) { delete all[k]; }); // 最多記 40 家
    writeStore(LAST_KEY, all);
  }

  function lastOrder() {
    var r = readStore(LAST_KEY)[S.menu.store.name];
    return r && r.lines && r.lines.length ? r : null;
  }

  function lastOrderHtml() {
    var r = lastOrder();
    if (!r) return '';
    var md = String(r.date).split('-');
    var when = md.length === 3 ? (+md[1]) + '/' + (+md[2]) : esc(r.date);
    return '<div class="card reorder"><div class="row"><b>上次在這家點的</b><span class="small muted">' + when + '</span></div>' +
      '<p class="small" style="margin:6px 0 0">' + r.lines.map(function (l) {
        return esc(l.name) + ' × ' + l.qty + (l.note ? '（' + esc(l.note) + '）' : '');
      }).join('、') + '</p>' +
      '<div class="btn-row"><button class="btn" data-act="reorder">一鍵加入購物車</button></div></div>';
  }

  function addLastOrder() {
    var r = lastOrder();
    if (!r) return;
    var ok = 0, bad = 0;
    r.lines.forEach(function (l) {
      if (!lineValid(l)) { bad++; return; }
      S.cart.push({ itemId: l.itemId, optionIds: l.optionIds.slice(), qty: Math.min(MAX_QTY, Math.max(1, Number(l.qty) || 1)), note: l.note || '', stale: false });
      ok++;
    });
    if (!ok) return toast('上次點的品項都已下架或變動，請重新選');
    toast('已加入 ' + ok + ' 項' + (bad ? '，有 ' + bad + ' 項菜單已變動沒有加入' : '') + '，價格以今天菜單為準');
    render();
  }

  /* ---------- 第 18 步：菜單搜尋、分類自動標示 ---------- */

  function applySearch(q) {
    S.search = q;
    var words = String(q || '').toLowerCase().split(/\s+/).filter(Boolean);
    var shown = {}, any = false;
    $view.querySelectorAll('.item[data-q]').forEach(function (el) {
      var hit = words.every(function (w) { return el.dataset.q.indexOf(w) >= 0; });
      el.hidden = !hit;
      if (hit) { shown[el.dataset.ci] = true; any = true; }
    });
    $view.querySelectorAll('.cat-title').forEach(function (el) { el.hidden = !shown[el.dataset.ci]; });
    $view.querySelectorAll('.chip').forEach(function (el) { el.hidden = !shown[el.dataset.i]; });
    var nm = document.getElementById('noMatch');
    if (nm) nm.hidden = any;
    var cb = $view.querySelector('.search-clear');
    if (cb) cb.hidden = !words.length;
    spyCategory();
  }

  function stickyBottom() {
    var el = document.getElementById('menuTools');
    return 52 + (S.forId ? 40 : 0) + (el ? el.offsetHeight : 0); // 第 20 步：黃色提示 40px
  }

  function spyCategory() {
    if (S.view !== 'menu' || Date.now() < (S.spyPause || 0)) return;
    var titles = [].filter.call($view.querySelectorAll('.cat-title'), function (t) { return !t.hidden; });
    if (!titles.length) return;
    var line = stickyBottom() + 12;
    var cur = titles[0];
    titles.forEach(function (t) { if (t.getBoundingClientRect().top <= line) cur = t; });
    var nav = $view.querySelector('.cats');
    if (!nav) return;
    var chip = nav.querySelector('.chip[data-i="' + cur.dataset.ci + '"]');
    if (!chip || chip.classList.contains('on')) return;
    nav.querySelectorAll('.chip').forEach(function (c) { c.classList.toggle('on', c === chip); });
    nav.scrollLeft = chip.offsetLeft - nav.clientWidth / 2 + chip.offsetWidth / 2;
  }

  var spyTick = false;
  window.addEventListener('scroll', function () {
    if (spyTick || S.view !== 'menu') return;
    spyTick = true;
    requestAnimationFrame(function () { spyTick = false; spyCategory(); });
  }, { passive: true });

  /* ---------- 第 18 步：截止倒數 ---------- */

  // 截止時間是台灣時間（Asia/Taipei），用 +08:00 算，手機時區設錯也不影響
  function minutesLeft(date, cutoff) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date || '') || !/^\d{2}:\d{2}$/.test(cutoff || '')) return null;
    return (new Date(date + 'T' + cutoff + ':00+08:00').getTime() - Date.now()) / 60000;
  }

  function leftText(m) { return m < 1 ? '不到 1 分鐘' : Math.ceil(m) + ' 分鐘'; }

  var reloadedAtCutoff = {};

  function refreshCountdown() {
    var homeEl = document.getElementById('cdHome');
    if (homeEl && S.view === 'home' && S.home) {
      var rows = [];
      (S.home.sessions || []).forEach(function (s) {
        if (!s.open || s.canceled || s.late) return; // 第 20 步：行政補單中不倒數
        var left = minutesLeft(S.home.today, s.cutoff);
        if (left == null) return;
        if (left <= 0) {
          // 到截止時間了：重新讀一次首頁，按鈕會變成「看菜單」
          if (!reloadedAtCutoff[s.id]) { reloadedAtCutoff[s.id] = true; loadHome(true); }
          return;
        }
        if (left > WARN_MIN) return;
        var tail = draftCount(s.id) ? '，購物車還沒送出' : (s.myOrder ? '' : '，你還沒點餐');
        rows.push('⏰ ' + esc(s.type) + '「' + esc(s.storeName) + '」剩 <b>' + leftText(left) + '</b> 截止' + tail);
      });
      homeEl.innerHTML = rows.length ? '<div class="cd-banner">' + rows.join('<br>') + '</div>' : '';
    }
    var barEl = document.getElementById('cdBar');
    if (barEl) {
      var msg = '';
      var ss = S.menu && S.menu.session;
      if (ss && ss.open && !ss.late && (S.view === 'menu' || S.view === 'cart')) {
        var l2 = minutesLeft(ss.date, ss.cutoff);
        if (l2 != null && l2 <= 0) msg = '⏰ 已到截止時間，可能無法送出';
        else if (l2 != null && l2 <= WARN_MIN) {
          msg = '⏰ 剩 <b>' + leftText(l2) + '</b> 截止' +
            (S.view === 'cart' && S.cart.length ? '，請盡快按「送出訂單」' : (S.cart.length && cartChanged() ? '，購物車還沒送出' : '')); // 第 31 步
        }
      }
      barEl.innerHTML = msg;
      barEl.hidden = !msg;
    }
  }

  setInterval(refreshCountdown, 20000);
  document.addEventListener('visibilitychange', function () { if (!document.hidden) refreshCountdown(); });

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
      case 'del': { // 第 40 步：刪除先確認
        var dl = S.cart[+d.i];
        if (!dl) return;
        var di = itemOf(dl.itemId);
        if (!window.confirm('要刪除「' + (di ? di.name : (dl.oldName || dl.itemId)) + ' ×' + dl.qty + '」嗎？')) return;
        S.cart.splice(+d.i, 1); return render();
      }
      case 'copyCart': return copyCart(); // 第 40 步
      case 'proxyOff': return setProxy('', ''); // 第 40 步：送出成功畫面的「改回自己」
      case 'back': return go('menu');
      case 'home': return go('home');
      case 'reorder': return addLastOrder();
      case 'guide': return openGuide(); // 第 25 步
      case 'vote': return openVote(); // 第 46 步
      case 'castVote': return castVote(d.date, d.type, d.id);
      case 'clearSearch': {
        var inp = document.getElementById('menuSearch');
        inp.value = ''; applySearch(''); return;
      }
      case 'cat': {
        document.querySelectorAll('.chip').forEach(function (c) { c.classList.toggle('on', c === b); });
        var t = document.getElementById('cat' + d.i);
        if (t) {
          S.spyPause = Date.now() + 800; // 平滑捲動途中不要讓自動標示搶著換
          window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - stickyBottom() - 4, behavior: 'smooth' });
        }
        return;
      }
    }
  });

  /* ---------- 第 20 步：行政代點 ---------- */

  function proxyPicker() {
    var adm = S.home && S.home.admin;
    if (!adm) return '';
    var opts = '<option value="">自己</option>' + adm.people.map(function (p) {
      return '<option value="' + esc(p.lineId) + '"' + (p.lineId === S.forId ? ' selected' : '') + '>' +
        esc(p.name) + (p.temp ? '（臨時）' : '') + '</option>';
    }).join('');
    return '<div class="card proxy-pick"><label class="field" for="forWho">幫誰點（行政）</label>' +
      '<select id="forWho">' + opts + '</select></div>';
  }

  $view.addEventListener('change', function (e) {
    if (e.target.id !== 'forWho') return;
    var sel = e.target;
    setProxy(sel.value, sel.value ? sel.options[sel.selectedIndex].text.replace(/（臨時）$/, '') : '');
  });

  function setProxy(id, name) {
    S.forId = id;
    S.forName = name;
    S.menu = null; S.cart = [];
    S.view = 'home';
    renderProxyBanner();
    loadHome(); // 重新讀這個人的首頁；背景預載的菜單也會換成這個人的
  }

  function renderProxyBanner() {
    $proxy.hidden = !S.forId;
    document.body.classList.toggle('proxying', !!S.forId);
    $proxy.innerHTML = S.forId ? '<span>正在幫 <b>' + esc(S.forName) + '</b> 點餐</span><button class="proxy-off" data-act="proxyOff">改回自己</button>' : '';
  }

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
    if (e && (e.code === 'FOR_USER' || e.code === 'FORBIDDEN') && S.forId) { // 第 20 步
      alertMsg(e.message);
      return setProxy('', '');
    }
    $bottom.hidden = true;
    $back.hidden = true;
    $view.innerHTML = '<div class="card center"><p>' + esc(e && e.message || '發生錯誤') + '</p>' +
      '<button class="btn" data-act="reload">回首頁</button></div>';
    S.err = true; syncBack(); // 第 38 步：錯誤畫面按返回＝回首頁
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
