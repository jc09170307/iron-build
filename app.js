(function () {
  'use strict';
  var KEY = 'ironbuild.v1';
  var DAYS = ['mon', 'wed', 'fri'];
  var DAYNAME = { mon: 'MONDAY', wed: 'WEDNESDAY', fri: 'FRIDAY' };
  var FOCUS = { mon: 'UPPER', wed: 'LEGS', fri: 'BACK' };
  var MON3 = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  var DOW3 = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  var HOLIDAYS = { '2026-12-25': 'Christmas Day', '2027-1-1': "New Year's Day" };

  var S = load();
  function load() {
    try {
      var o = JSON.parse(localStorage.getItem(KEY));
      if (o && typeof o === 'object') return Object.assign({ unit: 'lb', logs: {}, done: {}, check: {}, notes: {}, core: {} }, o);
    } catch (e) {}
    return { unit: 'lb', logs: {}, done: {}, check: {}, notes: {}, core: {} };
  }
  var saveTimer;
  function save() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(function () { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }, 150);
  }
  function saveNow() { clearTimeout(saveTimer); try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function fmt(d) { return pad(d.getDate()) + ' ' + MON3[d.getMonth()]; }
  function fmtFull(d) { return DOW3[d.getDay()] + ' ' + fmt(d); }
  function sod(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
  function today() { return sod(new Date()); }
  function dayDiff(a, b) { return Math.round((sod(a) - sod(b)) / 86400000); }
  function wd(w) { return IB.weekDates(w); }
  function holiday(d) { return HOLIDAYS[d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate()]; }
  function howUrl(name) { return 'https://www.youtube.com/results?search_query=' + encodeURIComponent(name + ' proper form'); }

  /* ---------- progress ---------- */
  function isDone(w, d) { return !!S.done[w + '.' + d]; }
  function weekDoneCount(w) { return DAYS.filter(function (d) { return isDone(w, d); }).length; }
  function totalDone() { var n = 0; for (var w = 1; w <= 13; w++) n += weekDoneCount(w); return n; }
  function currentWeek() {
    var n = Math.floor(dayDiff(today(), IB.START) / 7) + 1;
    return Math.max(1, Math.min(13, n));
  }
  function nextSession() {
    var t = today(), first = null;
    for (var w = 1; w <= 13; w++) for (var i = 0; i < 3; i++) {
      var d = DAYS[i];
      if (isDone(w, d)) continue;
      if (!first) first = { w: w, d: d };
      if (dayDiff(wd(w)[d], t) >= 0) return { w: w, d: d };
    }
    return first;
  }

  /* ---------- previous performance ---------- */
  function prevFor(name, w, day) {
    var cur = DAYS.indexOf(day);
    for (var ww = w; ww >= 1; ww--) {
      for (var k = 2; k >= 0; k--) {
        if (ww === w && k >= cur) continue;
        var dd = DAYS[k], wk = IB.workout(ww, dd);
        for (var i = 0; i < wk.ex.length; i++) {
          if (wk.ex[i].name !== name) continue;
          var L = S.logs[ww + '.' + dd + '.' + i];
          if (L && L.s && L.s.some(function (x) { return x && x.l && x.r; })) return { w: ww, s: L.s };
        }
      }
    }
    return null;
  }

  /* ---------- views ---------- */
  var $app = document.getElementById('app');

  function nav(active) {
    return '<nav aria-label="Main"><a href="#/" class="' + (active === 'home' ? 'on' : '') + '">Home</a>' +
      '<a href="#/weeks" class="' + (active === 'weeks' ? 'on' : '') + '">Weeks</a>' +
      '<a href="#/rules" class="' + (active === 'rules' ? 'on' : '') + '">Rules</a></nav>';
  }

  function vHome() {
    var t = today(), ns = nextSession(), toStart = dayDiff(IB.START, t), done = totalDone();
    var kick = toStart > 1 ? 'STARTS IN ' + toStart + ' DAYS' : toStart === 1 ? 'STARTS TOMORROW' : toStart === 0 ? 'DAY ONE / TODAY' : 'WEEK ' + currentWeek() + ' OF 13';
    var cta;
    if (!ns || done === 39) {
      cta = '<a class="cta" href="#/weeks">CYCLE COMPLETE<small>All 39 sessions logged. Review your weeks.</small></a>';
    } else {
      var info = IB.workout(ns.w, ns.d);
      var label = done === 0 ? 'START WEEK 1 / 05 OCT' : 'NEXT / ' + DAYNAME[ns.d] + ' ' + FOCUS[ns.d];
      cta = '<a class="cta" href="#/log/' + ns.w + '/' + ns.d + '">' + label + '<small>Week ' + ns.w + ' / ' + fmtFull(wd(ns.w)[ns.d]) + ' / ' + info.ex.length + ' exercises</small></a>';
    }
    var cw = currentWeek();
    return '<p class="kicker">JON\'S 13-WEEK</p><h1 class="hero">IRON BUILD</h1>' +
      '<p style="font-weight:800;margin-top:22px">LIFT / CARDIO / BALLROOM</p>' +
      '<div class="banner" role="img" aria-label="Iron Build"><b>LIFT.<br>DANCE.</b></div>' +
      '<p class="kicker">' + kick + '</p>' +
      '<p class="lead">A leaner-looking, stronger frame. Better stamina for Saturday.</p>' +
      '<p class="small mute">Start October 5. Finish January 3. Your next session is one tap away.</p>' +
      cta +
      '<div class="card"><div class="row"><span class="meta">PROGRESS</span><span class="meta">' + done + ' / 39 SESSIONS</span></div>' +
      '<div class="bar"><i style="width:' + Math.round(done / 39 * 100) + '%"></i></div></div>' +
      '<h2 class="sub">CHOOSE YOUR WEEK</h2>' +
      '<a class="card link" href="#/week/' + cw + '"><h3>THIS WEEK / W' + pad(cw) + '</h3><span class="meta">' + IB.phaseOf(cw).label + ' / ' + fmt(wd(cw).mon) + '</span></a>' +
      '<a class="card link" href="#/rules/cardio"><h3>CARDIO PLAN / TUE + THU</h3></a>' +
      '<a class="card link" href="#/rules"><h3>HOW TO LOG &amp; PROGRESS</h3></a>' +
      '<h2 class="sub">THE WEEK</h2>' +
      '<div class="card" style="line-height:1.9;font-weight:800;font-size:14px">MON UPPER + CORE A<br>TUE EASY CARDIO<br>WED LEGS<br>THU EASY CARDIO<br>FRI BACK + CORE B<br>SAT BALLROOM / 2 HOURS<br>SUN REST &amp; RESET</div>' +
      nav('home');
  }

  function vWeeks() {
    var cw = currentWeek(), h = '<p class="kicker">WEEK SELECTOR</p><h1 class="big">PICK YOUR WEEK.</h1><p class="mute small">Each week has its own gym logs and recovery check-in.</p><div class="grid" style="margin-top:14px">';
    for (var w = 1; w <= 13; w++) {
      var p = IB.phaseOf(w), n = weekDoneCount(w);
      h += '<a class="week ' + (w === cw ? 'now ' : '') + (w === 13 ? 'full' : '') + '" href="#/week/' + w + '"><span class="dot">' + n + '/3</span>W' + pad(w) + '<small>' + fmt(wd(w).mon) + ' / ' + (w === 13 ? 'DELOAD' : 'P' + p.id) + '</small></a>';
    }
    return h + '</div>' + nav('weeks');
  }

  function vWeek(w) {
    if (!(w >= 1 && w <= 13)) return vWeeks();
    var p = IB.phaseOf(w), D = wd(w);
    var h = '<a class="back" href="#/weeks">&lt; ALL WEEKS</a><p class="kicker">WEEK ' + pad(w) + ' / ' + fmt(D.mon) + ' ' + D.mon.getFullYear() + '</p><h1 class="big">YOUR TRAINING WEEK.</h1><p class="kicker">' + (w === 13 ? 'DELOAD' : p.name) + '</p>';
    if (w === 13) h += '<div class="banner-note"><b>Deload:</b> 2 work sets, 65-70% of Week 12 load, about 4 RIR. Keep the Phase 4 exercise selection. One easy core set or skip. Cardio 15-25 min, comfortable.</div>';
    DAYS.forEach(function (d) {
      var info = IB.workout(w, d), done = isDone(w, d);
      h += '<a class="card link" href="#/log/' + w + '/' + d + '"><div class="row"><h3>' + DAYNAME[d] + ' / ' + FOCUS[d] + '</h3><span class="pill ' + (done ? 'done' : '') + '">' + (done ? 'DONE' : 'LOG') + '</span></div>' +
        '<span class="meta">' + fmtFull(D[d]) + '</span><p class="small mute" style="margin-bottom:0">' + (info.core ? 'Core ' + info.core + ' after lifting.' : 'Leave recovery space before Saturday.') + '</p></a>';
    });
    var cr = w === 13 ? '15-25' : w <= 3 ? '20-25' : w <= 6 ? '25-30' : '30-35';
    h += '<a class="card link" href="#/rules/cardio"><h3>CARDIO / TUESDAY + THURSDAY</h3><span class="meta">' + cr + ' MIN / EASY</span></a>' +
      '<div class="card"><h3>SATURDAY DANCE + WEEK REVIEW</h3><span class="meta">SATURDAY / ' + fmt(D.sat) + ' / 2 HOURS</span></div>' +
      '<a class="card link" href="#/reset/' + w + '"><h3>SUNDAY RESET / CHECK-IN</h3><span class="meta">' + fmtFull(D.sun) + '</span></a>' +
      '<div class="row" style="margin-top:18px">' + (w > 1 ? '<a class="btn" href="#/week/' + (w - 1) + '">&lt; W' + pad(w - 1) + '</a>' : '<span></span>') + (w < 13 ? '<a class="btn solid" href="#/week/' + (w + 1) + '">NEXT WEEK &gt;</a>' : '') + '</div>';
    return h + nav('weeks');
  }

  function vLog(w, day) {
    if (!(w >= 1 && w <= 13) || DAYS.indexOf(day) < 0) return vWeeks();
    var p = IB.phaseOf(w), info = IB.workout(w, day), D = wd(w)[day], unit = S.unit;
    var hol = holiday(D);
    var h = '<a class="back" href="#/week/' + w + '">&lt; BACK TO THIS WEEK</a><p class="kicker">WEEK ' + pad(w) + ' / ' + fmtFull(D) + '</p><h1 class="big">' + FOCUS[day] + ' / LOG</h1>' +
      '<p class="small mute">Load: ' + unit + '. Reps: actual completed. For dumbbells, log one dumbbell.</p>';
    if (hol) h += '<div class="dateflag"><b>' + esc(hol) + '</b> falls on this session. Move it to a day that works (e.g. the day before) and log it here.</div>';
    h += '<div class="warm"><b>WARM-UP</b>' + esc(info.warm) + '</div>';
    info.ex.forEach(function (e, i) {
      var k = w + '.' + day + '.' + i, L = S.logs[k] || { s: [] };
      var pv = prevFor(e.name, w, day);
      var allDone = true;
      for (var s = 0; s < e.sets; s++) if (!(L.s[s] && L.s[s].d)) allDone = false;
      var rx = e.deload ? '2 easy sets / deload' : e.sets + ' x ' + e.reps + (e.side ? ' / side' : '');
      h += '<div class="ex ' + (allDone ? 'done' : '') + '" data-k="' + k + '"><h3>' + esc(e.name) + '</h3><div class="rx">' + rx + ' &nbsp; REST ' + (e.rest === 'L' ? '2-3 MIN' : '60-90 SEC') + '</div>' +
        '<p class="cue">' + esc(IB.cue(e.name)) + '</p><a class="how" href="' + howUrl(e.name) + '" target="_blank" rel="noopener">WATCH HOW-TO &gt;</a>';
      if (pv) {
        var txt = pv.s.map(function (x) { return x && (x.l || x.r) ? esc(x.l || '-') + '&times;' + esc(x.r || '-') : null; }).filter(Boolean).join(' / ');
        var hint = '';
        if (w === 13) {
          var mx = Math.max.apply(null, pv.s.map(function (x) { return parseFloat(x && x.l) || 0; }));
          if (mx) hint = ' <b>Deload target: ' + Math.round(mx * 0.65 * 10) / 10 + '-' + Math.round(mx * 0.7 * 10) / 10 + ' ' + unit + '</b>';
        } else if (pv.s.length >= e.sets && pv.s.slice(0, e.sets).every(function (x) { return x && parseFloat(x.r) >= e.reps; })) {
          hint = ' <b>Hit every rep. If form was clean with ~2 in reserve, try the smallest increase.</b>';
        }
        h += '<div class="last">LAST (W' + pad(pv.w) + '): ' + txt + hint + '</div>';
      }
      h += '<div class="sets"><span class="h">SET</span><span class="h">LOAD (' + unit + ')</span><span class="h">REPS</span><span class="h">DONE</span>';
      for (var s2 = 0; s2 < e.sets; s2++) {
        var v = L.s[s2] || {}, ph = pv && pv.s[s2] ? pv.s[s2] : {};
        h += '<span class="sn">' + (s2 + 1) + '</span>' +
          '<input inputmode="decimal" aria-label="Set ' + (s2 + 1) + ' load" data-f="l" data-i="' + s2 + '" value="' + esc(v.l || '') + '" placeholder="' + esc(ph.l || '') + '">' +
          '<input inputmode="numeric" aria-label="Set ' + (s2 + 1) + ' reps" data-f="r" data-i="' + s2 + '" value="' + esc(v.r || '') + '" placeholder="' + esc(ph.r || e.reps) + '">' +
          '<button class="chk ' + (v.d ? 'on' : '') + '" data-act="chk" data-i="' + s2 + '" data-rest="' + (e.rest === 'L' ? 150 : 75) + '" aria-label="Mark set ' + (s2 + 1) + ' done">' + (v.d ? '&#10003;' : '') + '</button>';
      }
      h += '</div></div>';
    });
    if (info.core) {
      var core = IB.CORE[info.core];
      h += '<h2 class="sub lime">CORE / ' + info.core + '</h2>';
      core.items.forEach(function (c, j) {
        var ck = w + '.' + day + '.c' + j, on = !!S.core[ck];
        h += '<div class="ex ' + (on ? 'done' : '') + '"><div class="row"><h3>' + esc(c.name) + '</h3><button class="chk ' + (on ? 'on' : '') + '" style="width:44px" data-act="core" data-ck="' + ck + '" aria-label="Mark ' + esc(c.name) + ' done">' + (on ? '&#10003;' : '') + '</button></div>' +
          '<div class="rx">' + esc(c.rx) + '</div><p class="cue">' + esc(c.cue) + '</p><a class="how" href="' + howUrl(c.name) + '" target="_blank" rel="noopener">WATCH HOW-TO &gt;</a></div>';
      });
      h += '<p class="small mute">' + esc(IB.CORE_NOTE) + '</p>';
    }
    h += '<label class="lbl" for="note">FINAL SET RIR / NOTES</label><textarea id="note" data-act="note" data-nk="' + w + '.' + day + '">' + esc(S.notes[w + '.' + day] || '') + '</textarea>';
    var done = isDone(w, day);
    h += '<button class="cta" data-act="finish" data-w="' + w + '" data-d="' + day + '" style="margin-top:20px">' + (done ? 'WORKOUT COMPLETE / TAP TO UNDO' : 'FINISH THE SESSION') + '<small>' + (done ? 'Logged. Nice work.' : 'Marks this workout done and updates your progress.') + '</small></button>';
    return h + nav('weeks');
  }

  function vReset(w) {
    if (!(w >= 1 && w <= 13)) return vWeeks();
    var c = S.check[w] || {}, D = wd(w);
    function num(f, lab) { return '<label class="lbl" for="c-' + f + '">' + lab + '</label><input id="c-' + f + '" inputmode="numeric" data-act="check" data-f="' + f + '" value="' + esc(c[f] || '') + '">'; }
    function scale(f, lab, from, to) {
      var b = '';
      for (var i = from; i <= to; i++) b += '<button data-act="scale" data-f="' + f + '" data-v="' + i + '" class="' + (String(c[f]) === String(i) ? 'on' : '') + '">' + i + '</button>';
      return '<span class="lbl">' + lab + '</span><div class="scale" role="group" aria-label="' + lab + '">' + b + '</div>';
    }
    var h = '<a class="back" href="#/week/' + w + '">&lt; BACK TO THIS WEEK</a><p class="kicker">WEEK ' + pad(w) + ' / SUNDAY RESET / ' + fmt(D.sun) + '</p><h1 class="big">LOG THE WHOLE ATHLETE.</h1>' +
      '<p class="mute small">Quick check-in. Look for better strength, stamina and recovery together.</p>' +
      num('tue', 'TUESDAY CARDIO / MINUTES') + num('thu', 'THURSDAY CARDIO / MINUTES') + num('sat', 'SATURDAY / ACTIVE DANCE MINUTES') +
      scale('energy', 'DANCE ENERGY / 1 LOW - 5 HIGH', 1, 5) + scale('sore', 'LEG SORENESS / 0 NONE - 10 HIGH', 0, 10) +
      '<label class="lbl" for="c-win">ONE WIN THIS WEEK</label><textarea id="c-win" data-act="check" data-f="win">' + esc(c.win || '') + '</textarea>' +
      '<label class="lbl" for="c-adj">ONE ADJUSTMENT FOR NEXT WEEK</label><textarea id="c-adj" data-act="check" data-f="adj">' + esc(c.adj || '') + '</textarea>' +
      '<p class="kicker" style="margin-top:22px">' + IB.phaseOf(w).tag + '</p>' +
      (w < 13 ? '<a class="cta" href="#/week/' + (w + 1) + '">OPEN NEXT WEEK</a>' : '<a class="cta" href="#/">CYCLE COMPLETE / HOME</a>');
    return h + nav('weeks');
  }

  function vRules(sub) {
    var h = '<p class="kicker">QUICK START</p><h1 class="big">OWN THE REP.</h1><p class="mute small">Read once. Return whenever you need a reset.</p>';
    var steps = [
      ['CHOOSE YOUR STARTING LOAD', 'Use a weight that leaves 2-3 good reps available. RIR means reps in reserve: reps you could still do with good form.'],
      ['FOLLOW THE PRESCRIPTION', '3 x 12 means three work sets of twelve reps. Warm-up sets are extra. Rest as listed on the exercise cards.'],
      ['LOG EVERY WORK SET', 'Enter load and actual reps for each set, then tap the check. Example: 20 / 8 reps. For dumbbells, record one dumbbell; use the same convention each week.'],
      ['EARN THE NEXT INCREASE', 'When every work set meets the target with good form and about 2 reps left, try the smallest available increase next time. If reps fall short, repeat or lower the load.'],
      ['SAVE YOUR WORK', 'Everything saves on this device automatically. Use Backup below now and then so you never lose your log.']
    ];
    steps.forEach(function (s, i) { h += '<p class="num">0' + (i + 1) + ' / ' + s[0] + '</p><p>' + s[1] + '</p>'; });
    h += '<h2 class="sub lime" id="cardio">TUESDAY + THURSDAY / BUILD YOUR ENGINE.</h2><p class="mute small">Easy effort. Consistent practice. Energy left for Saturday.</p>';
    IB.CARDIO.forEach(function (c) { h += '<div class="card"><span class="meta">WEEKS ' + c.weeks + ' / ' + c.mins + '</span><p style="margin-bottom:0">' + c.text + '</p></div>'; });
    h += '<div class="card"><span class="meta">YOUR EFFORT GUIDE</span><p style="margin-bottom:0">Breathe a little harder while still speaking in full sentences. Lessons include instruction and breaks; count actively dancing time toward cardio.</p></div>' +
      '<div class="card"><span class="meta">WHEN TO EASE OFF</span><p style="margin-bottom:0">If soreness changes your dance technique or fatigue keeps building, shorten cardio and reduce gym load or sets as needed.</p></div>';
    h += '<h2 class="sub lime">SETTINGS</h2><span class="lbl">WEIGHT UNIT</span><div class="scale"><button data-act="unit" data-v="lb" class="' + (S.unit === 'lb' ? 'on' : '') + '">LB</button><button data-act="unit" data-v="kg" class="' + (S.unit === 'kg' ? 'on' : '') + '">KG</button></div>' +
      '<span class="lbl">BACKUP</span><div class="chip-row"><button class="btn" data-act="export">EXPORT LOG</button><button class="btn" data-act="import">IMPORT LOG</button><button class="btn" data-act="reset" style="border-color:var(--warn);color:var(--warn)">ERASE ALL</button></div>' +
      '<input type="file" id="imp" accept="application/json" hidden>';
    return h + nav('rules');
  }

  /* ---------- router ---------- */
  function route() {
    var p = (location.hash || '#/').replace(/^#\/?/, '').split('/'), html;
    switch (p[0]) {
      case 'weeks': html = vWeeks(); break;
      case 'week': html = vWeek(+p[1]); break;
      case 'log': html = vLog(+p[1], p[2]); break;
      case 'reset': html = vReset(+p[1]); break;
      case 'rules': html = vRules(p[1]); break;
      default: html = vHome();
    }
    $app.innerHTML = html;
    if (p[0] === 'rules' && p[1] === 'cardio') { var el = document.getElementById('cardio'); if (el) el.scrollIntoView(); } else window.scrollTo(0, 0);
  }
  window.addEventListener('hashchange', route);

  /* ---------- rest timer ---------- */
  var tEl = document.getElementById('timer'), tInt, tEnd = 0, audioCtx;
  function beep() {
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      [0, 0.25, 0.5].forEach(function (off) {
        var o = audioCtx.createOscillator(), g = audioCtx.createGain();
        o.frequency.value = 880; g.gain.value = 0.15; o.connect(g); g.connect(audioCtx.destination);
        o.start(audioCtx.currentTime + off); o.stop(audioCtx.currentTime + off + 0.15);
      });
    } catch (e) {}
    if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
  }
  function tick() {
    var left = Math.round((tEnd - Date.now()) / 1000);
    if (left <= 0) { clearInterval(tInt); tEl.querySelector('.t').textContent = '0:00'; tEl.classList.add('ring'); beep(); setTimeout(hideTimer, 6000); return; }
    tEl.querySelector('.t').textContent = Math.floor(left / 60) + ':' + pad(left % 60);
  }
  function startTimer(sec) {
    clearInterval(tInt); tEnd = Date.now() + sec * 1000; tEl.classList.remove('ring'); tEl.classList.add('on'); tick(); tInt = setInterval(tick, 250);
    try { audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)(); if (audioCtx.state === 'suspended') audioCtx.resume(); } catch (e) {}
  }
  function hideTimer() { clearInterval(tInt); tEl.classList.remove('on', 'ring'); }
  tEl.addEventListener('click', function (e) {
    var a = e.target.getAttribute('data-t');
    if (a === 'skip') hideTimer();
    else if (a) { tEnd += (+a) * 1000; tEl.classList.remove('ring'); clearInterval(tInt); tInt = setInterval(tick, 250); tick(); }
  });

  /* ---------- events ---------- */
  function toast(msg) {
    var t = document.createElement('div'); t.className = 'toast'; t.textContent = msg; document.body.appendChild(t); setTimeout(function () { t.remove(); }, 2200);
  }
  $app.addEventListener('input', function (e) {
    var t = e.target, act = t.getAttribute('data-act');
    if (t.hasAttribute('data-f') && t.hasAttribute('data-i')) {
      var ex = t.closest('.ex'), k = ex.getAttribute('data-k'), i = +t.getAttribute('data-i');
      var L = S.logs[k] = S.logs[k] || { s: [] };
      L.s[i] = L.s[i] || {};
      L.s[i][t.getAttribute('data-f')] = t.value.trim();
      save();
    } else if (act === 'note') { S.notes[t.getAttribute('data-nk')] = t.value; save(); }
    else if (act === 'check') {
      var w = +location.hash.split('/')[2];
      S.check[w] = S.check[w] || {}; S.check[w][t.getAttribute('data-f')] = t.value; save();
    }
  });
  $app.addEventListener('click', function (e) {
    var b = e.target.closest('[data-act]'); if (!b || b.tagName === 'TEXTAREA' || b.tagName === 'INPUT') return;
    var act = b.getAttribute('data-act');
    if (act === 'chk') {
      var ex = b.closest('.ex'), k = ex.getAttribute('data-k'), i = +b.getAttribute('data-i');
      var L = S.logs[k] = S.logs[k] || { s: [] }; L.s[i] = L.s[i] || {};
      var row = b.parentElement.querySelectorAll('input[data-i="' + i + '"]');
      // fill empty fields from placeholders so a straight repeat is one tap
      row.forEach(function (inp) { if (!inp.value && inp.placeholder) { inp.value = inp.placeholder; L.s[i][inp.getAttribute('data-f')] = inp.placeholder; } });
      L.s[i].d = !L.s[i].d; b.classList.toggle('on', L.s[i].d); b.innerHTML = L.s[i].d ? '&#10003;' : '';
      var all = ex.querySelectorAll('.chk'), full = Array.prototype.every.call(all, function (x) { return x.classList.contains('on'); });
      ex.classList.toggle('done', full);
      if (L.s[i].d) startTimer(+b.getAttribute('data-rest'));
      save();
    } else if (act === 'core') {
      var ck = b.getAttribute('data-ck'); S.core[ck] = !S.core[ck]; b.classList.toggle('on', S.core[ck]); b.innerHTML = S.core[ck] ? '&#10003;' : '';
      b.closest('.ex').classList.toggle('done', S.core[ck]); if (S.core[ck]) startTimer(50); save();
    } else if (act === 'finish') {
      var key = b.getAttribute('data-w') + '.' + b.getAttribute('data-d'); S.done[key] = !S.done[key]; saveNow(); hideTimer(); route();
      if (S.done[key]) toast('Session logged. Recover well.');
    } else if (act === 'scale') {
      var w = +location.hash.split('/')[2], f = b.getAttribute('data-f'); S.check[w] = S.check[w] || {}; S.check[w][f] = b.getAttribute('data-v'); save();
      b.parentElement.querySelectorAll('button').forEach(function (x) { x.classList.toggle('on', x === b); });
    } else if (act === 'unit') { S.unit = b.getAttribute('data-v'); saveNow(); route(); }
    else if (act === 'export') {
      var blob = new Blob([JSON.stringify(S, null, 2)], { type: 'application/json' }), a = document.createElement('a');
      a.href = URL.createObjectURL(blob); a.download = 'iron-build-backup-' + new Date().toISOString().slice(0, 10) + '.json'; a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
    } else if (act === 'import') document.getElementById('imp').click();
    else if (act === 'reset') {
      if (confirm('Erase ALL logs, check-ins and progress on this device? This cannot be undone.')) { S = { unit: S.unit, logs: {}, done: {}, check: {}, notes: {}, core: {} }; saveNow(); route(); toast('Erased.'); }
    }
  });
  $app.addEventListener('change', function (e) {
    if (e.target.id !== 'imp' || !e.target.files[0]) return;
    var fr = new FileReader();
    fr.onload = function () {
      try {
        var o = JSON.parse(fr.result);
        if (!o || typeof o.logs !== 'object') throw new Error('bad');
        S = Object.assign({ unit: 'lb', logs: {}, done: {}, check: {}, notes: {}, core: {} }, o); saveNow(); route(); toast('Backup imported.');
      } catch (err) { toast('That file is not an Iron Build backup.'); }
    };
    fr.readAsText(e.target.files[0]);
  });
  window.addEventListener('pagehide', saveNow);
  document.addEventListener('visibilitychange', function () { if (document.hidden) saveNow(); });

  route();
  if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(function () {});
  if ('serviceWorker' in navigator) window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () {}); });
})();
