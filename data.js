/* Iron Build - program data (transcribed from "Jon's Iron Build 13-week PDF") */
(function (root) {
  var START = new Date(2026, 9, 5); // Monday 05 Oct 2026

  var CUES = {
    'Push-up on knees': 'Keep a straight line from knees to shoulders; lower with control.',
    'Dumbbell incline bench press': 'Keep feet planted and lower the weights under control.',
    'Dumbbell incline fly': 'Keep a soft elbow bend; use a comfortable range.',
    'Dumbbell seated shoulder press': 'Keep ribs stacked over hips; avoid arching to finish.',
    'Bench dips': 'Keep shoulders comfortable; avoid forcing a deep range.',
    'Dumbbell box squat': 'Sit back to touch the box with control; stand without rocking.',
    'Kettlebell deadlift': 'Push hips back, brace your trunk, and keep the bell close.',
    'Alternating dumbbell lunge': 'Use a stable stride and control the descent on each side.',
    'Barbell hip thrust': 'Finish through your hips; avoid overextending your lower back.',
    'Machine calf raise': 'Use a controlled stretch and rise; avoid bouncing.',
    'Lat pulldown': 'Pull elbows down; keep your torso steady.',
    'Seated cable row': 'Keep the torso steady; pull elbows back without jerking.',
    'Cable upright row': 'Use a comfortable grip and stop before shoulder discomfort.',
    'Dumbbell rear fly': 'Keep a soft elbow bend; lift without swinging.',
    'Dumbbell hammer curls': 'Keep elbows steady and wrists neutral.',
    'Romanian deadlift': 'Push hips back and keep the load close to your legs.',
    'Dips': 'Use assistance as needed; keep the range comfortable.',
    'Barbell back squat': 'Brace before each rep and use a controlled, comfortable depth.',
    'Bulgarian split squat': 'Keep the front foot stable; control depth and balance.',
    'Assisted pull-ups': 'Choose enough assistance to move smoothly without swinging.',
    'Leg extension': 'Extend smoothly; lower slowly and avoid kicking the stack.'
  };
  var DEFAULT_CUE = 'Use a controlled range and steady technique. Watch the demo before your first set.';

  var CORE = {
    A: { title: 'Core A', items: [
      { name: 'Dead bug', rx: '2 x 6-8 / side', cue: 'Lie on your back, arms up and knees bent. Slowly extend opposite arm and leg; keep your lower back gently against the floor.' },
      { name: 'Side plank', rx: '2 x 15-25 sec / side', cue: 'Elbow below shoulder. Lift hips and hold a straight line. Start from bent knees if needed. Breathe steadily.' }
    ]},
    B: { title: 'Core B', items: [
      { name: 'Cable crunch', rx: '2 x 10-12', cue: 'Use a light load. Curl ribs toward pelvis. Avoid pulling with your arms or swinging your hips.' },
      { name: 'Dead bug', rx: '2 x 6-8 / side', cue: 'Lie on your back, arms up and knees bent. Slowly extend opposite arm and leg; keep your lower back gently against the floor.' }
    ]}
  };
  var CORE_NOTE = 'Core: rest 45-60 sec. Start with one set if needed. In Week 13, do one easy set or skip.';

  // ex(name, sets, reps, rest, perSide)  rest: 'L' = 2-3 min, 'S' = 60-90 sec
  function ex(n, s, r, rest, side) { return { name: n, sets: s, reps: r, rest: rest || 'L', side: !!side }; }

  var PHASES = [
    { id: 1, name: 'FOUNDATION', label: 'PHASE 1 / FOUNDATION', weeks: [1, 3], tag: 'OWN THE REP. BUILD THE HABIT.',
      mon: { warm: 'Knee push-up: 4 / 8 / 10 reps', ex: [
        ex('Push-up on knees', 3, 12, 'S'), ex('Dumbbell incline bench press', 3, 8), ex('Dumbbell incline fly', 3, 10, 'S'),
        ex('Dumbbell seated shoulder press', 4, 8), ex('Bench dips', 4, 12) ] },
      wed: { warm: 'Bodyweight squat x 15 / box squat 25% x 12 / 50% x 10', ex: [
        ex('Dumbbell box squat', 3, 8), ex('Kettlebell deadlift', 3, 8), ex('Alternating dumbbell lunge', 3, 10),
        ex('Barbell hip thrust', 4, 8), ex('Machine calf raise', 4, 12, 'S') ] },
      fri: { warm: 'Lat pulldown: 25% x 15 / 50% x 12 / 75% x 10', ex: [
        ex('Lat pulldown', 3, 8), ex('Seated cable row', 3, 8), ex('Cable upright row', 3, 10),
        ex('Dumbbell rear fly', 4, 8, 'S'), ex('Dumbbell hammer curls', 4, 12, 'S') ] } },
    { id: 2, name: 'POWER UP', label: 'PHASE 2 / POWER UP', weeks: [4, 6], tag: 'SMALL WINS. REPEATED.',
      mon: { warm: 'Knee push-up: 3 / 5 reps, then machine chest-press ramp sets', ex: [
        ex('Machine chest press', 3, 10), ex('Dumbbell incline bench press', 3, 10), ex('Standing chest cable flys', 3, 12, 'S'),
        ex('Barbell military press', 4, 10), ex('Band-assisted dips', 4, 10) ] },
      wed: { warm: 'Bodyweight squat x 15 / bar-only back squat x 12 / 50% x 10', ex: [
        ex('Dumbbell back squat', 3, 10), ex('Romanian deadlift', 3, 10), ex('Alternating dumbbell step-up', 3, 12),
        ex('Barbell hip thrust', 4, 10), ex('Machine calf raise', 4, 12, 'S') ] },
      fri: { warm: 'Lat pulldown: 25% x 15 / 50% x 12 / 75% x 10', ex: [
        ex('Lat pulldown', 3, 10), ex('Dumbbell chest-supported row', 3, 10), ex('Dumbbell incline upright row', 3, 12),
        ex('Standing cable pullover', 4, 10, 'S'), ex('Standing cable curl', 4, 12, 'S') ] } },
    { id: 3, name: 'EXPANSION', label: 'PHASE 3 / EXPANSION', weeks: [7, 9], tag: 'STRONG IN THE GYM. LIGHT ON YOUR FEET.',
      mon: { warm: 'Knee push-up: 3 / 5 reps, then flat-bench ramp sets', ex: [
        ex('Barbell flat bench press', 4, 10), ex('Barbell incline bench press', 4, 10), ex('Dumbbell single-arm shoulder press', 4, 10, 'L', true),
        ex('Dips', 4, 7), ex('Standing chest cable flys', 4, 12, 'S') ] },
      wed: { warm: 'Bodyweight squat x 15 / back squat 25% x 12 / 50% x 10', ex: [
        ex('Barbell back squat', 4, 10), ex('Romanian deadlift', 4, 10), ex('Bulgarian split squat', 3, 10, 'L', true),
        ex('Barbell hip thrust', 4, 10), ex('Machine calf raise', 4, 12, 'S') ] },
      fri: { warm: 'Lat pulldown: 25% x 15 / 50% x 12 / 75% x 10', ex: [
        ex('Assisted pull-ups', 4, 7), ex('Dumbbell single-arm row', 4, 10, 'L', true), ex('Barbell upright row', 4, 10),
        ex('Lat pulldown', 4, 10), ex('Standing dumbbell curl', 4, 12, 'S') ] } },
    { id: 4, name: 'MAX VOLUME', label: 'PHASE 4 / MAX VOLUME', weeks: [10, 12], tag: 'BUILD THE BODY. KEEP THE RHYTHM.',
      mon: { warm: 'Knee push-up, then machine chest press at 25% and 50%', ex: [
        ex('Machine chest press', 4, 12), ex('Barbell incline bench press', 4, 12), ex('Dumbbell seated rear fly', 4, 12, 'S'),
        ex('Dumbbell seated Arnold press', 4, 10), ex('Dumbbell lateral raise', 4, 8, 'S'), ex('Dumbbell kickbacks', 4, 10, 'S') ] },
      wed: { warm: 'Bodyweight squat x 15 / back squat 25% x 12 / 50% x 10', ex: [
        ex('Barbell back squat', 4, 12), ex('Barbell hip thrust', 4, 12), ex('Bulgarian split squat', 3, 12, 'L', true),
        ex('Leg extension', 3, 12, 'S'), ex('Machine calf raise', 3, 12, 'S') ] },
      fri: { warm: 'Lat pulldown: 25% x 15 / 50% x 12 / 75% x 10', ex: [
        ex('Assisted pull-ups', 4, 8), ex('Dumbbell chest-supported row', 4, 12), ex('Cable upright row', 4, 12),
        ex('Standing dumbbell curl', 4, 8, 'S'), ex('Dumbbell hammer curls', 4, 8, 'S') ] } }
  ];

  var CARDIO = [
    { weeks: '1-3', mins: '20-25 MIN', text: 'Use a bike, elliptical or brisk walk. Start at 10-15 minutes if needed. Include an easy start and finish.' },
    { weeks: '4-6', mins: '25-30 MIN', text: 'Increase only if gym recovery and Saturday dance quality remain good.' },
    { weeks: '7-12', mins: '30-35 MIN', text: 'Hold a shorter duration during demanding weeks. More is optional.' },
    { weeks: '13', mins: '15-25 MIN', text: 'Keep it comfortable. Extra rest is fine during the deload.' }
  ];

  function phaseOf(w) {
    if (w === 13) return { id: 5, name: 'DELOAD', label: 'WEEK 13 / DELOAD', tag: 'BUILD THE BODY. KEEP THE RHYTHM.', src: PHASES[3] };
    for (var i = 0; i < PHASES.length; i++) if (w >= PHASES[i].weeks[0] && w <= PHASES[i].weeks[1]) return Object.assign({ src: PHASES[i] }, PHASES[i]);
    return null;
  }
  function addDays(d, n) { return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n); }
  function weekDates(w) {
    var mon = addDays(START, (w - 1) * 7);
    return { mon: mon, wed: addDays(mon, 2), fri: addDays(mon, 4), sat: addDays(mon, 5), sun: addDays(mon, 6), tue: addDays(mon, 1), thu: addDays(mon, 3) };
  }
  // Exercises for a given week/day; deload = Phase 4 selection, 2 sets each
  function workout(w, day) {
    var p = phaseOf(w), src = p.src[day];
    var deload = w === 13;
    return {
      warm: src.warm,
      core: day === 'mon' ? 'A' : day === 'fri' ? 'B' : null,
      ex: src.ex.map(function (e) {
        return Object.assign({}, e, { sets: deload ? 2 : e.sets, deload: deload });
      })
    };
  }
  function cue(name) { return CUES[name] || DEFAULT_CUE; }

  var api = { START: START, PHASES: PHASES, CORE: CORE, CORE_NOTE: CORE_NOTE, CARDIO: CARDIO, phaseOf: phaseOf,
              weekDates: weekDates, workout: workout, cue: cue, addDays: addDays };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.IB = api;
})(typeof window !== 'undefined' ? window : globalThis);
