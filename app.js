(function () {
  'use strict';
  var KEY = 'ironbuild.v1';
  var DAYS = ['mon', 'wed', 'fri'];
  var DAYNAME = { mon: 'MONDAY', wed: 'WEDNESDAY', fri: 'FRIDAY' };
  var FOCUS = { mon: 'UPPER', wed: 'LEGS', fri: 'BACK' };
  var MON3 = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  var DOW3 = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  var HOLIDAYS = { '2026-12-25': 'Christmas Day', '2027-1-1': "New Year's Day" };

  function blank() { return { unit: 'lb', logs: {}, done: {}, check: {}, notes: {}, core: {}, fuel: {}, targets: null, music: '', moves: {} }; }
  var S = load();
  function load() {
    try {
      var o = JSON.parse(localStorage.getItem(KEY));
      if (o && typeof o === 'object') return Object.assign(blank(), o);
    } catch (e) {}
    return blank();
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
  function sd(w, d) {
    var m = S.moves && S.moves[w + '.' + d];
    if (m && /^\d{4}-\d{2}-\d{2}$/.test(m)) { var q = m.split('-'); return new Date(+q[0], +q[1] - 1, +q[2]); }
    return wd(w)[d];
  }
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
      if (dayDiff(sd(w, d), t) >= 0) return { w: w, d: d };
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
    function a(h, id, l) { return '<a href="' + h + '" class="' + (active === id ? 'on' : '') + '">' + l + '</a>'; }
    return '<nav aria-label="Main">' + a('#/', 'home', 'Home') + a('#/weeks', 'weeks', 'Weeks') + a('#/fuel', 'fuel', 'Fuel') + a('#/rules', 'rules', 'Rules') + '</nav>';
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
      cta = '<a class="cta" href="#/log/' + ns.w + '/' + ns.d + '">' + label + '<small>Week ' + ns.w + ' / ' + fmtFull(sd(ns.w, ns.d)) + ' / ' + info.ex.length + ' exercises</small></a>';
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
      '<a class="card link" href="#/fuel"><h3>FUEL / MEALS &amp; TARGETS</h3><span class="meta">EAT TO BUILD</span></a>' +
      '<a class="card link" href="#/music"><h3>&#9835; GYM MUSIC</h3><span class="meta">SPOTIFY / YOUTUBE / YT MUSIC</span></a>' +
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
        '<span class="meta">' + fmtFull(sd(w, d)) + (S.moves && S.moves[w + '.' + d] ? ' / MOVED' : '') + '</span><p class="small mute" style="margin-bottom:0">' + (info.core ? 'Core ' + info.core + ' after lifting.' : 'Leave recovery space before Saturday.') + '</p></a>';
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
    var p = IB.phaseOf(w), info = IB.workout(w, day), D = sd(w, day), unit = S.unit;
    var hol = holiday(D);
    var h = '<a class="back" href="#/week/' + w + '">&lt; BACK TO THIS WEEK</a><p class="kicker">WEEK ' + pad(w) + ' / ' + fmtFull(D) + '</p><h1 class="big">' + FOCUS[day] + ' / LOG</h1>' +
      '<p class="small mute">Load: ' + unit + '. Reps: actual completed. For dumbbells, log one dumbbell.</p>';
    var moved = !!(S.moves && S.moves[w + '.' + day]);
    h += '<div class="card"><span class="meta">SESSION DATE' + (moved ? ' / MOVED' : '') + '</span><div class="row" style="margin-top:8px;gap:8px">' +
      '<input type="date" aria-label="Session date" data-act="move" data-w="' + w + '" data-d="' + day + '" value="' + dkey(D) + '">' +
      (moved ? '<button class="btn" data-act="move-reset" data-w="' + w + '" data-d="' + day + '">RESET</button>' : '') + '</div>' +
      '<p class="mute small" style="margin:8px 0 0">Missed a day or hitting a holiday? Pick the day you actually train. Your plan and logs stay the same.</p></div>';
    if (hol) h += '<div class="dateflag"><b>' + esc(hol) + '</b> falls on this session. Move it to a day that works (e.g. the day before) and log it here.</div>';
    h += '<a class="btn" href="#/music" style="display:inline-block;margin:6px 0">&#9835; GYM MUSIC</a>';
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
    function num(f, lab) { return '<label class="lbl" for="c-' + f + '">' + lab + '</label><input id="c-' + f + '" inputmode="decimal" data-act="check" data-f="' + f + '" value="' + esc(c[f] || '') + '">'; }
    function scale(f, lab, from, to) {
      var b = '';
      for (var i = from; i <= to; i++) b += '<button data-act="scale" data-f="' + f + '" data-v="' + i + '" class="' + (String(c[f]) === String(i) ? 'on' : '') + '">' + i + '</button>';
      return '<span class="lbl">' + lab + '</span><div class="scale" role="group" aria-label="' + lab + '">' + b + '</div>';
    }
    var bodyBlock = '<h2 class="sub lime">BODY / EVERY 4 WEEKS</h2><p class="mute small">Best in W1, W5, W9 and W13. Same time of day, same spot. Keep progress photos on your phone only.</p>' +
      num('bw', 'BODYWEIGHT (' + S.unit.toUpperCase() + ')') + num('waist', 'WAIST (IN OR CM, STAY CONSISTENT)') + num('chest', 'CHEST') + num('arm', 'ARM, RELAXED');
    var h = '<a class="back" href="#/week/' + w + '">&lt; BACK TO THIS WEEK</a><p class="kicker">WEEK ' + pad(w) + ' / SUNDAY RESET / ' + fmt(D.sun) + '</p><h1 class="big">LOG THE WHOLE ATHLETE.</h1>' +
      '<p class="mute small">Quick check-in. Look for better strength, stamina and recovery together.</p>' +
      num('tue', 'TUESDAY CARDIO / MINUTES') + num('thu', 'THURSDAY CARDIO / MINUTES') + num('sat', 'SATURDAY / ACTIVE DANCE MINUTES') +
      '<label class="lbl" for="c-satnote">SATURDAY DANCE NOTES</label><textarea id="c-satnote" data-act="check" data-f="satnote" placeholder="Energy, feedback from your instructor, what felt good or heavy">' + esc(c.satnote || '') + '</textarea>' +
      scale('energy', 'DANCE ENERGY / 1 LOW - 5 HIGH', 1, 5) + scale('sore', 'LEG SORENESS / 0 NONE - 10 HIGH', 0, 10) +
      bodyBlock + '<label class="lbl" for="c-win">ONE WIN THIS WEEK</label><textarea id="c-win" data-act="check" data-f="win">' + esc(c.win || '') + '</textarea>' +
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

  /* ---------- fuel ---------- */
  var fuelDate = null, mealCat = 'breakfast';
  var CATS = ['breakfast', 'lunch', 'dinner', 'snacks'];
  function dkey(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function targets() {
    var T = Object.assign({}, IBFOOD.DEFAULTS), o = S.targets || {};
    if (o.kcal > 0) T.kcal = o.kcal;
    if (o.protein > 0) T.protein = o.protein;
    return T;
  }
  function avgWindow(from, to) {
    var t = today(), v = [];
    Object.keys(S.fuel).forEach(function (k) {
      var e = S.fuel[k], w = parseFloat(e && e.w); if (!(w > 0)) return;
      var q = k.split('-'), a = dayDiff(t, new Date(+q[0], +q[1] - 1, +q[2]));
      if (a >= from && a <= to) v.push(w);
    });
    return v.length ? v.reduce(function (a, b) { return a + b; }, 0) / v.length : null;
  }
  function bar(val, goal) { return '<div class="bar"><i style="width:' + (goal > 0 ? Math.min(100, Math.round(val / goal * 100)) : 0) + '%"></i></div>'; }
  function fuelKey() { var el = document.getElementById('fd'); return (el && el.value) || fuelDate || dkey(today()); }
  function fuelMacros() {
    var T = targets(), fat = Math.round(T.kcal * 0.28 / 9), carb = Math.max(0, Math.round((T.kcal - T.protein * 4 - fat * 9) / 4));
    return '<span class="meta">DAILY MACROS</span><p style="margin:6px 0 0"><b>' + T.protein + ' g</b> protein / about <b>' + fat + ' g</b> fat / about <b>' + carb + ' g</b> carbs</p>' +
      '<p class="mute small" style="margin:6px 0 0">Fat is about 28% of calories. Carbs fill the rest and fuel your lifting and dancing.</p>';
  }
  function fuelBars(key) {
    var T = targets(), d = S.fuel[key] || {}, k = parseFloat(d.kcal) || 0, p = parseFloat(d.p) || 0;
    return '<div class="row small"><b>CALORIES</b><span>' + k + ' / ' + T.kcal + '</span></div>' + bar(k, T.kcal) +
      '<div class="row small" style="margin-top:8px"><b>PROTEIN</b><span>' + p + ' / ' + T.protein + ' g</span></div>' + bar(p, T.protein);
  }
  function fuelTrend() {
    var f = S.unit === 'kg' ? 0.4536 : 1, cur = avgWindow(0, 6), prev = avgWindow(7, 13);
    if (cur == null) return '<p class="mute small" style="margin:0">Log your weight on a few mornings to see your 7-day average.</p>';
    var h = '<p style="margin:0"><b>7-day average: ' + cur.toFixed(1) + ' ' + S.unit + '</b></p>';
    if (prev == null) return h + '<p class="mute small" style="margin:6px 0 0">Keep logging. After 2 weeks you will see your weekly change. Goal: +0.25 to +0.5 lb per week.</p>';
    var d = (cur - prev) / f, msg;
    if (d < 0.15) msg = 'Flat or down. If this holds for 2+ weeks, add 150-200 calories a day.';
    else if (d <= 0.6) msg = 'On target. Keep going.';
    else msg = 'Gaining faster than planned. Trim 100-200 calories a day.';
    return h + '<p style="margin:6px 0 0">Change vs the week before: <b>' + (d >= 0 ? '+' : '') + (d * f).toFixed(1) + ' ' + S.unit + '</b>. ' + msg + '</p>';
  }
  function mealCard(m) {
    return '<details class="meal"><summary><span class="mn">' + esc(m.name) + '</span><span class="mm">' + m.kcal + ' kcal / P ' + m.p + ' / C ' + m.c + ' / F ' + m.f + '</span></summary>' +
      '<p class="meta" style="margin:10px 0 4px">INGREDIENTS / ' + esc(m.time).toUpperCase() + '</p><ul>' + m.ing.map(function (i) { return '<li>' + esc(i) + '</li>'; }).join('') + '</ul>' +
      '<p class="meta" style="margin:10px 0 4px">STEPS</p><ol>' + m.steps.map(function (i) { return '<li>' + esc(i) + '</li>'; }).join('') + '</ol></details>';
  }
  function vFuel() {
    var key = fuelDate || dkey(today()), d = S.fuel[key] || {}, T = targets(), byId = {};
    IBFOOD.MEALS.forEach(function (m) { byId[m.id] = m; });
    var tot = { kcal: 0, p: 0, c: 0, f: 0 }, rows = '';
    IBFOOD.SAMPLE_DAY.forEach(function (r) {
      var m = byId[r[1]]; ['kcal', 'p', 'c', 'f'].forEach(function (k) { tot[k] += m[k]; });
      rows += '<div class="row small" style="padding:5px 0;align-items:flex-start"><span><b>' + r[0] + '</b> / ' + esc(m.name) + '</span><span class="mute">' + m.kcal + '</span></div>';
    });
    var h = '<p class="kicker">FUEL</p><h1 class="big">EAT TO BUILD.</h1>' +
      '<p class="lead">Lean bulk: a small calorie surplus so you gain muscle slowly with little extra fat.</p>' +
      '<h2 class="sub lime">YOUR TARGETS</h2><div class="card"><div class="grid"><div><label class="lbl" style="margin-top:0" for="tk">CALORIES / DAY</label><input id="tk" inputmode="numeric" data-act="target" data-f="kcal" value="' + (S.targets && S.targets.kcal > 0 ? S.targets.kcal : '') + '" placeholder="' + IBFOOD.DEFAULTS.kcal + '"></div>' +
      '<div><label class="lbl" style="margin-top:0" for="tp">PROTEIN (G)</label><input id="tp" inputmode="numeric" data-act="target" data-f="protein" value="' + (S.targets && S.targets.protein > 0 ? S.targets.protein : '') + '" placeholder="' + IBFOOD.DEFAULTS.protein + '"></div></div>' +
      '<div id="fuelmacros" style="margin-top:14px">' + fuelMacros() + '</div></div>' +
      '<h2 class="sub lime">DAILY LOG</h2><div class="card"><label class="lbl" style="margin-top:0" for="fd">DATE</label><input id="fd" type="date" data-act="fuel-date" value="' + key + '" max="' + dkey(today()) + '">' +
      '<div class="grid"><div><label class="lbl" for="fw">WEIGHT (' + S.unit.toUpperCase() + ')</label><input id="fw" inputmode="decimal" data-act="fuel" data-f="w" value="' + esc(d.w || '') + '"></div>' +
      '<div><label class="lbl" for="fk">CALORIES</label><input id="fk" inputmode="numeric" data-act="fuel" data-f="kcal" value="' + esc(d.kcal || '') + '"></div></div>' +
      '<label class="lbl" for="fp">PROTEIN (G)</label><input id="fp" inputmode="numeric" data-act="fuel" data-f="p" value="' + esc(d.p || '') + '">' +
      '<div id="fuelbars" style="margin-top:14px">' + fuelBars(key) + '</div></div>' +
      '<div class="card"><span class="meta">WEEKLY TREND</span><div id="fueltrend" style="margin-top:8px">' + fuelTrend() + '</div><p class="mute small" style="margin:10px 0 0">Weigh yourself first thing in the morning. Judge by the weekly average, not single days.</p></div>' +
      '<h2 class="sub lime">A SAMPLE DAY</h2><div class="card">' + rows +
      '<div class="row" style="border-top:1px solid var(--limedim);margin-top:8px;padding-top:10px"><b>TOTAL</b><b>' + tot.kcal + ' kcal / P ' + tot.p + ' / C ' + tot.c + ' / F ' + tot.f + '</b></div></div>' +
      '<h2 class="sub lime">MEAL IDEAS</h2><div class="chip-row">' +
      CATS.map(function (c) { return '<button class="btn ' + (c === mealCat ? 'solid' : '') + '" data-act="cat" data-v="' + c + '">' + c + '</button>'; }).join('') + '</div>' +
      IBFOOD.MEALS.filter(function (m) { return m.cat === mealCat; }).map(mealCard).join('') +
      '<p class="mute small" style="margin-top:14px">Calories and macros are estimates (about plus or minus 10-15%). Brands, cuts and portions vary. Mix and match to land near your targets. Optional whey protein powder can replace or add to any meal.</p>';
    return h + nav('fuel');
  }

  /* ---------- music ---------- */
  function parseMusic(raw) {
    raw = (raw || '').trim(); if (!raw) return null;
    var m = raw.match(/^spotify:(playlist|album|track|artist|show|episode):([A-Za-z0-9]+)$/), u;
    function sp(t, id) { return { kind: 'Spotify', embed: 'https://open.spotify.com/embed/' + t + '/' + id, url: 'https://open.spotify.com/' + t + '/' + id, cls: (t === 'track' || t === 'episode') ? 'sps' : 'sp' }; }
    if (m) return sp(m[1], m[2]);
    try { u = new URL(raw); } catch (e) { return null; }
    if (u.protocol !== 'https:') return null;
    var h = u.hostname.replace(/^www\./, '');
    if (h === 'open.spotify.com') {
      m = u.pathname.match(/^\/(?:intl-[a-z-]+\/)?(playlist|album|track|artist|show|episode)\/([A-Za-z0-9]+)/);
      return m ? sp(m[1], m[2]) : null;
    }
    if (h === 'youtube.com' || h === 'm.youtube.com' || h === 'music.youtube.com' || h === 'youtu.be') {
      var list = u.searchParams.get('list'), v = h === 'youtu.be' ? u.pathname.slice(1) : u.searchParams.get('v');
      var music = h === 'music.youtube.com';
      if (list && /^[A-Za-z0-9_-]{10,64}$/.test(list)) return { kind: music ? 'YouTube Music' : 'YouTube', embed: 'https://www.youtube.com/embed/videoseries?list=' + list, url: (music ? 'https://music.youtube.com' : 'https://www.youtube.com') + '/playlist?list=' + list, cls: 'yt' };
      if (v && /^[A-Za-z0-9_-]{6,20}$/.test(v)) return { kind: music ? 'YouTube Music' : 'YouTube', embed: 'https://www.youtube.com/embed/' + v, url: (music ? 'https://music.youtube.com' : 'https://www.youtube.com') + '/watch?v=' + v, cls: 'yt' };
    }
    return null;
  }
  var DEFAULT_MUSIC = 'https://www.youtube.com/playlist?list=PLB3qQUxqNGYhkI5h3nBo2EcUnVvZAW0fZ';
  function vMusic() {
    var cur = S.music || DEFAULT_MUSIC, m = parseMusic(cur);
    var h = '<a class="back" href="#/">&lt; HOME</a><p class="kicker">GYM MUSIC</p><h1 class="big">PRESS PLAY.</h1>' +
      '<p class="mute small">Paste a link to any Spotify, YouTube or YouTube Music playlist. It plays right here, or open it in its own app so the music keeps going while you log sets.</p>' +
      '<label class="lbl" for="mlink">PLAYLIST LINK</label><input id="mlink" type="url" inputmode="url" autocomplete="off" autocapitalize="off" placeholder="https://open.spotify.com/playlist/..." value="' + esc(cur) + '">' +
      '<div class="chip-row" style="margin-top:10px"><button class="btn solid" data-act="music-save">SAVE &amp; LOAD</button>' + (S.music ? '<button class="btn" data-act="music-clear">MY GYM PLAYLIST</button>' : '') + '</div>';
    if (m) {
      h += '<iframe class="player ' + m.cls + '" src="' + esc(m.embed) + '" title="' + m.kind + ' player" loading="lazy" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" referrerpolicy="strict-origin-when-cross-origin"></iframe>' +
        '<a class="cta" href="' + esc(m.url) + '" target="_blank" rel="noopener">OPEN IN ' + m.kind.toUpperCase() + '<small>Opens the app or site so playback continues in the background.</small></a>';
    }
    h += '<h2 class="sub lime">FIND A PLAYLIST</h2>' +
      '<a class="btn block" target="_blank" rel="noopener" href="https://open.spotify.com/search/gym%20workout">SPOTIFY / GYM WORKOUT</a>' +
      '<a class="btn block" target="_blank" rel="noopener" href="https://music.youtube.com/search?q=gym+workout+playlist">YOUTUBE MUSIC / GYM WORKOUT</a>' +
      '<a class="btn block" target="_blank" rel="noopener" href="https://www.youtube.com/results?search_query=gym+workout+music+playlist">YOUTUBE / GYM WORKOUT MIX</a>' +
      '<a class="btn block" target="_blank" rel="noopener" href="https://www.youtube.com/results?search_query=ballroom+practice+music+playlist">YOUTUBE / BALLROOM PRACTICE MIX</a>' +
      '<p class="mute small" style="margin-top:14px">Find one you like, copy its share link, and paste it above. Players need an internet connection. Spotify plays full tracks if you are signed in to Spotify in this browser, and may otherwise play short previews. This app cannot sign in to your accounts.</p>';
    return h + nav('home');
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
      case 'fuel': html = vFuel(); break;
      case 'music': html = vMusic(); break;
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
      if (confirm('Erase ALL logs, check-ins and progress on this device? This cannot be undone.')) { S = Object.assign(blank(), { unit: S.unit }); saveNow(); route(); toast('Erased.'); }
    }
  });
  $app.addEventListener('change', function (e) {
    if (e.target.id !== 'imp' || !e.target.files[0]) return;
    var fr = new FileReader();
    fr.onload = function () {
      try {
        var o = JSON.parse(fr.result);
        if (!o || typeof o.logs !== 'object') throw new Error('bad');
        S = Object.assign(blank(), o); saveNow(); route(); toast('Backup imported.');
      } catch (err) { toast('That file is not an Iron Build backup.'); }
    };
    fr.readAsText(e.target.files[0]);
  });
  $app.addEventListener('input', function (e) {
    var t = e.target, act = t.getAttribute('data-act');
    if (act === 'fuel') {
      var k = fuelKey(); S.fuel[k] = S.fuel[k] || {}; S.fuel[k][t.getAttribute('data-f')] = t.value.trim(); save();
      document.getElementById('fuelbars').innerHTML = fuelBars(k); document.getElementById('fueltrend').innerHTML = fuelTrend();
    } else if (act === 'target') {
      var n = parseFloat(t.value); S.targets = S.targets || {}; var f = t.getAttribute('data-f');
      if (n > 0) S.targets[f] = n; else delete S.targets[f];
      save(); document.getElementById('fuelmacros').innerHTML = fuelMacros(); document.getElementById('fuelbars').innerHTML = fuelBars(fuelKey());
    }
  });
  $app.addEventListener('change', function (e) {
    var t = e.target, a = t.getAttribute('data-act');
    if (a === 'fuel-date') { fuelDate = t.value || null; route(); }
    else if (a === 'move' && t.value) { S.moves[t.getAttribute('data-w') + '.' + t.getAttribute('data-d')] = t.value; saveNow(); route(); }
  });
  $app.addEventListener('click', function (e) {
    var b = e.target.closest('[data-act]'); if (!b) return;
    var act = b.getAttribute('data-act');
    if (act === 'cat') { mealCat = b.getAttribute('data-v'); route(); }
    else if (act === 'move-reset') { delete S.moves[b.getAttribute('data-w') + '.' + b.getAttribute('data-d')]; saveNow(); route(); }
    else if (act === 'music-save') {
      var v = document.getElementById('mlink').value;
      if (!parseMusic(v)) { toast('Paste a Spotify, YouTube or YouTube Music link.'); return; }
      S.music = v.trim(); saveNow(); route();
    } else if (act === 'music-clear') { S.music = ''; saveNow(); route(); }
  });
  window.addEventListener('pagehide', saveNow);
  document.addEventListener('visibilitychange', function () { if (document.hidden) saveNow(); });

  route();
  if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(function () {});
  if ('serviceWorker' in navigator) window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () {}); });
})();
