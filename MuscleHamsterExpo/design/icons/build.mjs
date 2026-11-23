// Muscle Hamster icon builder. node build.mjs <outdir> [name,name]
// v2 (review round 1): 3.0 silhouette / 2.3 inner outline hierarchy, bigger eyes + glints,
// no ink-only meaning lines (lines get a colour core or become filled shapes).
import fs from 'fs'; import path from 'path';
const OUT = process.argv[2] || 'out';
fs.mkdirSync(OUT, { recursive: true });

const INK = '#4A3728', OR = '#FF9500', PEACH = '#FFE3B8', SAND = '#F3E6D6', MINT = '#DDF2D8', SKY = '#D9EEF2', W = '#FFFFFF';
const CORAL = '#F2777A', GOLD = '#FFC93C';
const OUTW = 3.0;   // outer silhouette: head, ears, body, limbs, main object contour
const INW = 2.3;    // inner / face details (2.2-2.4)
const MINW = 1.6;   // absolute floor for any stroke
const r = (n) => Math.round(n * 100) / 100;
const S = (w = OUTW) => `stroke="${INK}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"`;
const NS = `stroke="none"`;

const svg = (body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">${body}</svg>\n`;
const circ = (cx, cy, rad, fill, st = S()) => `<circle cx="${r(cx)}" cy="${r(cy)}" r="${r(rad)}" fill="${fill}" ${st}/>`;
const ell = (cx, cy, rx, ry, fill, st = S()) => `<ellipse cx="${r(cx)}" cy="${r(cy)}" rx="${r(rx)}" ry="${r(ry)}" fill="${fill}" ${st}/>`;
const P = (d, fill = 'none', st = S()) => `<path d="${d}" fill="${fill}" ${st}/>`;
const line = (x1, y1, x2, y2, w = INW) => `<line x1="${r(x1)}" y1="${r(y1)}" x2="${r(x2)}" y2="${r(y2)}" ${S(w)}/>`; // inner detail lines only (on a filled shape)
const rect = (x, y, w, h, rx, fill, st = S()) => `<rect x="${r(x)}" y="${r(y)}" width="${r(w)}" height="${r(h)}" rx="${r(rx)}" fill="${fill}" ${st}/>`;
// capsule: ink stroke with a coloured core -> a "line" that is really a filled shape. ol = outline each side.
const capsule = (d, color, w, ol = 2) => `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${r(w)}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${color}" stroke-width="${r(w - 2 * ol)}" stroke-linecap="round" stroke-linejoin="round"/>`;
// limb: capsule with the full 3.0 silhouette outline
const limb = (d, color = OR, w = 9) => capsule(d, color, w, OUTW);

// ---------- hamster ----------
// head centred on (cx,cy); k = scale (1 = 31 units wide head). expr: smile|happy|hungry|sleep|breath|squeeze
function head(cx, cy, k = 1, expr = 'smile', opt = {}) {
  const X = (x) => r(cx + x * k), Y = (y) => r(cy + y * k);
  const MW = INW; // mouth / face-line stroke, never under 2.2
  let o = '';
  for (const s of [-1, 1]) {
    o += circ(cx + s * 10 * k, cy - 11.2 * k, 3.9 * k + 0.8, OR);
    o += circ(cx + s * 10.5 * k, cy - 12.3 * k, 2.2 * k + 0.4, CORAL, NS);
  }
  // chubby-cheeked head: widest just below the eyes
  const outline = `M${X(0)} ${Y(-12.5)} C${X(8.5)} ${Y(-12.5)} ${X(14)} ${Y(-8)} ${X(15)} ${Y(-1.5)} C${X(16.2)} ${Y(6)} ${X(10)} ${Y(13)} ${X(0)} ${Y(13)} C${X(-10)} ${Y(13)} ${X(-16.2)} ${Y(6)} ${X(-15)} ${Y(-1.5)} C${X(-14)} ${Y(-8)} ${X(-8.5)} ${Y(-12.5)} ${X(0)} ${Y(-12.5)} Z`;
  o += P(outline, OR);
  // cream lower face: orange dips to a soft V between the eyes
  o += P(`M${X(-14.8)} ${Y(1.5)} Q${X(-10)} ${Y(-3.8)} ${X(-4.6)} ${Y(1.2)} Q${X(0)} ${Y(4.4)} ${X(4.6)} ${Y(1.2)} Q${X(10)} ${Y(-3.8)} ${X(14.8)} ${Y(1.5)} C${X(15.6)} ${Y(7)} ${X(9.5)} ${Y(12.8)} ${X(0)} ${Y(12.8)} C${X(-9.5)} ${Y(12.8)} ${X(-15.6)} ${Y(7)} ${X(-14.8)} ${Y(1.5)} Z`, W, NS);
  if (opt.band !== false) {
    // headband (signature). Small heads get a plain stripe (no inner outline).
    o += P(`M${X(-13.9)} ${Y(-7.2)} Q${X(0)} ${Y(-15.8)} ${X(13.9)} ${Y(-7.2)} L${X(14.9)} ${Y(-2.6)} Q${X(0)} ${Y(-10.4)} ${X(-14.9)} ${Y(-2.6)} Z`, CORAL, k >= 0.75 ? S(INW) : NS);
  }
  o += P(outline); // re-stroke silhouette over face + band
  // cheeks (never bigger than the eyes)
  for (const s of [-1, 1]) o += k < 0.8 ? ell(cx + s * 10.6 * k, cy + 4 * k, 1.8 * k, 1.2 * k, CORAL, NS) : ell(cx + s * 10 * k, cy + 4 * k, 2.3 * k, 1.5 * k, CORAL, NS);
  // eyes
  if (expr === 'sleep' || expr === 'breath') {
    for (const s of [-1, 1]) o += P(`M${X(s * 5.5 - 3)} ${Y(0)} Q${X(s * 5.5)} ${Y(3)} ${X(s * 5.5 + 3)} ${Y(0)}`, 'none', S(2.8));
  } else if (expr === 'squeeze') {
    for (const s of [-1, 1]) o += P(`M${X(s * 5.5 - 2.6)} ${Y(1)} Q${X(s * 5.5)} ${Y(-2.6)} ${X(s * 5.5 + 2.6)} ${Y(1)}`, 'none', S(2.6));
  } else {
    const hungry = expr === 'hungry';
    const er = (hungry ? 3.8 : 2.9) * k;
    const gl = hungry ? 1.6 * k : Math.max(0.42 * er, 1.0);
    for (const s of [-1, 1]) {
      const ex = cx + s * 5.6 * k, ey = cy + 0.4 * k;
      o += circ(ex, ey, er, INK, NS);
      o += circ(ex + 0.38 * er, ey - 0.38 * er, gl, W, NS);
      if (hungry) o += circ(ex - 0.42 * er, ey + 0.45 * er, Math.max(0.8 * k, 0.7), W, NS);
    }
  }
  // nose
  o += ell(cx, cy + 4.4 * k, 1.9 * k, 1.4 * k, CORAL, S(MINW));
  // mouth
  if (expr === 'happy') {
    o += P(`M${X(-4.6)} ${Y(6)} Q${X(0)} ${Y(14.2)} ${X(4.6)} ${Y(6)} Z`, CORAL, S(MW));
    if (k >= 0.7) o += rect(cx - 1.8 * k, cy + 6.2 * k, 3.6 * k, 2.4 * k, 0.4 * k, W, S(MINW));
  } else if (expr === 'breath') {
    o += ell(cx, cy + 8.6 * k, 2, 2.2, INK, NS);
  } else if (expr === 'hungry') {
    o += P(`M${X(-2)} ${Y(7.6)} Q${X(-2)} ${Y(12.4)} ${X(0)} ${Y(12.4)} Q${X(2)} ${Y(12.4)} ${X(2)} ${Y(7.6)}`, CORAL, S(MW));
    o += P(`M${X(-3.4)} ${Y(7)} Q${X(0)} ${Y(9.6)} ${X(3.4)} ${Y(7)}`, 'none', S(MW));
    o += P(`M${X(11.4)} ${Y(5.4)} Q${X(14)} ${Y(9)} ${X(11.4)} ${Y(10.8)} Q${X(8.8)} ${Y(9)} ${X(11.4)} ${Y(5.4)} Z`, SKY, S(2)); // drool drop
  } else if (k >= 0.8) {
    o += P(`M${X(-3)} ${Y(6.6)} Q${X(-1.5)} ${Y(8.3)} ${X(0)} ${Y(6.6)} Q${X(1.5)} ${Y(8.3)} ${X(3)} ${Y(6.6)}`, 'none', S(MW));
  } else {
    o += P(`M${X(-3.4)} ${Y(6.6)} Q${X(0)} ${Y(6.6 + 4.8)} ${X(3.4)} ${Y(6.6)}`, 'none', S(MW)); // one wide smile on small heads
  }
  return o;
}
// body: oval + cream belly
const body = (cx, cy, rx, ry) => ell(cx, cy, rx, ry, OR) + ell(cx, cy + ry * 0.18, rx * 0.62, ry * 0.66, W, NS);
const foot = (cx, cy) => ell(cx, cy, 3.4, 2, OR);
const pawDot = (cx, cy, rad = 3.2) => circ(cx, cy, rad, OR);

// ---------- props ----------
function heart(cx, cy, s, fill = CORAL, st = S()) { // s = half-width
  const X = (x) => r(cx + x * s / 18), Y = (y) => r(cy + y * s / 18);
  return P(`M${X(0)} ${Y(15.5)} C${X(-14)} ${Y(6.5)} ${X(-18)} ${Y(-0.5)} ${X(-18)} ${Y(-7)} C${X(-18)} ${Y(-12.5)} ${X(-14)} ${Y(-16)} ${X(-9.5)} ${Y(-16)} C${X(-5.5)} ${Y(-16)} ${X(-2)} ${Y(-13.5)} ${X(0)} ${Y(-10.5)} C${X(2)} ${Y(-13.5)} ${X(5.5)} ${Y(-16)} ${X(9.5)} ${Y(-16)} C${X(14)} ${Y(-16)} ${X(18)} ${Y(-12.5)} ${X(18)} ${Y(-7)} C${X(18)} ${Y(-0.5)} ${X(14)} ${Y(6.5)} ${X(0)} ${Y(15.5)} Z`, fill, st);
}
function paw(cx, cy, k = 1, fill = INK) {
  let o = ell(cx, cy + 1.6 * k, 3.5 * k, 2.9 * k, fill, NS);
  for (const [x, y] of [[-3.6, -2.2], [-1.3, -4.4], [1.3, -4.4], [3.6, -2.2]]) o += circ(cx + x * k, cy + y * k, 1.45 * k, fill, NS);
  return o;
}
function sneaker(ox, oy, k = 1, fill = OR) { // origin = sole bottom-left, ~27 wide, ~14 tall
  const X = (x) => r(ox + x * k), Y = (y) => r(oy + y * k);
  let o = P(`M${X(2)} ${Y(-3)} L${X(2)} ${Y(-11)} Q${X(2)} ${Y(-13.5)} ${X(4.5)} ${Y(-13.5)} L${X(9.5)} ${Y(-13.5)} C${X(10.5)} ${Y(-9.5)} ${X(14)} ${Y(-9)} ${X(17)} ${Y(-8.6)} C${X(22.5)} ${Y(-7.8)} ${X(26)} ${Y(-6.5)} ${X(26)} ${Y(-3)} Z`, fill);
  o += P(`M${X(1)} ${Y(-3)} L${X(27)} ${Y(-3)} L${X(27)} ${Y(-1)} Q${X(27)} ${Y(0.8)} ${X(25)} ${Y(0.8)} L${X(3)} ${Y(0.8)} Q${X(1)} ${Y(0.8)} ${X(1)} ${Y(-1)} Z`, W);
  if (k >= 0.8) o += line(ox + 12 * k, oy - 10.2 * k, ox + 13.6 * k, oy - 7.6 * k) + line(ox + 15.6 * k, oy - 9.4 * k, ox + 16.6 * k, oy - 7.2 * k);
  return o;
}
function sparkle(cx, cy, s, fill = GOLD) {
  const a = s, b = s * 0.32;
  return P(`M${r(cx)} ${r(cy - a)} Q${r(cx + b)} ${r(cy - b)} ${r(cx + a)} ${r(cy)} Q${r(cx + b)} ${r(cy + b)} ${r(cx)} ${r(cy + a)} Q${r(cx - b)} ${r(cy + b)} ${r(cx - a)} ${r(cy)} Q${r(cx - b)} ${r(cy - b)} ${r(cx)} ${r(cy - a)} Z`, fill, S(INW));
}
function drop(cx, top, h, fill = SKY) { // teardrop, point up
  const w = h * 0.62;
  return P(`M${r(cx)} ${r(top)} Q${r(cx + w)} ${r(top + h * 0.62)} ${r(cx)} ${r(top + h)} Q${r(cx - w)} ${r(top + h * 0.62)} ${r(cx)} ${r(top)} Z`, fill, S(INW));
}
// clockwise arc arrow (degrees, screen coords) drawn as a cored capsule + filled arrowhead
function arcArrow(cx, cy, R, a0, a1, head = 4, core = SKY) {
  const t0 = a0 * Math.PI / 180, t1 = a1 * Math.PI / 180;
  const x0 = cx + R * Math.cos(t0), y0 = cy + R * Math.sin(t0);
  // stop the shaft a little early so the head sits on the end
  const back = (head * 0.9) / R, tb = t1 - back;
  const xb = cx + R * Math.cos(tb), yb = cy + R * Math.sin(tb);
  const x1 = cx + R * Math.cos(t1), y1 = cy + R * Math.sin(t1);
  const large = ((a1 - a0 + 360) % 360) > 180 ? 1 : 0;
  const tx = -Math.sin(t1), ty = Math.cos(t1), nx = Math.cos(t1), ny = Math.sin(t1);
  const tip = [x1 + tx * head * 0.55, y1 + ty * head * 0.55];
  const b1 = [xb + nx * head, yb + ny * head], b2 = [xb - nx * head, yb - ny * head];
  return capsule(`M${r(x0)} ${r(y0)} A${R} ${R} 0 ${large} 1 ${r(xb)} ${r(yb)}`, core, 6.2, 2) +
    `<polygon points="${r(tip[0])},${r(tip[1])} ${r(b1[0])},${r(b1[1])} ${r(b2[0])},${r(b2[1])}" fill="${core}" ${S(2)}/>`;
}
// mirror a fragment across the vertical line x = cx (for symmetric pairs)
function mirrorX(svgFrag, cx) { return `<g transform="translate(${2 * cx} 0) scale(-1 1)">${svgFrag}</g>`; }
function medal(fill, inner) {
  let o = P('M18 29 L13.5 43 L18 40.6 L21 44 L24.5 31.5 Z', CORAL) + P('M30 29 L34.5 43 L30 40.6 L27 44 L23.5 31.5 Z', CORAL);
  o += circ(24, 19.5, 15, fill);
  return o + inner;
}
function gear(cx, cy, Ro, Ri, n, fill) {
  const pts = [];
  for (let i = 0; i < n; i++) {
    const a = (i * 360 / n - 90) * Math.PI / 180, d = Math.PI / n;
    for (const [ang, rad] of [[a - d * 0.62, Ri], [a - d * 0.36, Ro], [a + d * 0.36, Ro], [a + d * 0.62, Ri]]) pts.push(`${r(cx + rad * Math.cos(ang))},${r(cy + rad * Math.sin(ang))}`);
  }
  return `<polygon points="${pts.join(' ')}" fill="${fill}" ${S()}/>`;
}
// calendar used by weekly_goal + weekly_goal_done
function calendar(band, ticks) {
  let o = rect(7, 10, 34, 32, 5, W);
  o += P('M7 20 V15 Q7 10 12 10 H36 Q41 10 41 15 V20 Z', band);
  o += capsule('M16 6.5 V12.5', SAND, 5.2, 1.8) + capsule('M32 6.5 V12.5', SAND, 5.2, 1.8);
  [14.5, 24, 33.5].forEach((x, i) => {
    if (i < ticks) o += P(`M${x - 3.4} 30.6 L${x - 0.8} 33.4 L${x + 3.6} 27.6`, 'none', S(OUTW)); // ticks: inner detail on the filled card
    else o += circ(x, 30.8, 3, SAND, S(INW));
  });
  return o;
}

// ---------- icons ----------
const I = {};

// Tabs
I.tab_today = () => {
  let o = '';
  for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; o += capsule(`M${r(24 + 15.6 * Math.cos(a))} ${r(24 + 15.6 * Math.sin(a))} L${r(24 + 18.4 * Math.cos(a))} ${r(24 + 18.4 * Math.sin(a))}`, GOLD, 6, 2); }
  o += circ(24, 24, 11, GOLD);
  o += circ(19.6, 23.2, 1.7, INK, NS) + circ(28.4, 23.2, 1.7, INK, NS);
  o += ell(17.2, 27, 1.7, 1.2, CORAL, NS) + ell(30.8, 27, 1.7, 1.2, CORAL, NS);
  o += P('M21 27.2 Q24 30.4 27 27.2', 'none', S(INW));
  return o;
};
I.tab_workouts = () => {
  // carrot dumbbell: bar + two carrot-orange plates with leafy tufts
  let o = '';
  for (const c of [10, 38]) o += P(`M${c - 0.5} 13 Q${c - 6} 10 ${c - 5} 5 Q${c - 1} 6.5 ${c - 0.5} 12`, MINT, S(INW)) + P(`M${c + 0.5} 13 Q${c + 6} 10 ${c + 5} 5 Q${c + 1} 6.5 ${c + 0.5} 12`, MINT, S(INW));
  o += rect(14, 21, 20, 6, 3, W);
  o += rect(5, 12, 10, 24, 4, OR) + rect(33, 12, 10, 24, 4, OR);
  o += line(8.5, 19, 11.5, 19) + line(8.5, 25.5, 11.5, 25.5) + line(36.5, 22, 39.5, 22) + line(36.5, 28.5, 39.5, 28.5);
  return o;
};
I.tab_hamster = () => head(24, 25.5, 1.16, 'smile');
const idCard = () => {
  let o = rect(9.5, 8, 29, 35, 5, W);
  o += rect(19.5, 4.5, 9, 6, 2, SAND);
  // simple person avatar: "Me" is you, not the hamster
  o += P('M15.5 31 C15.5 26.5 19 25 24 25 C29 25 32.5 26.5 32.5 31 Z', PEACH, S(INW));
  o += circ(24, 19, 4.8, PEACH, S(INW));
  o += line(16.5, 36.5, 31.5, 36.5);
  return o;
};
I.tab_me = idCard;
I.me_profile = idCard;

// Today
I.today_exercise = () => {
  // neutral "ready" pose: standing, paws on hips, sweat drop
  let o = '';
  o += foot(19, 41.6) + foot(29, 41.6);
  o += body(24, 34.5, 9.5, 6.8);
  o += limb('M16.5 31 L10.5 34.5 L15.5 38') + limb('M31.5 31 L37.5 34.5 L32.5 38');
  o += head(24, 18.4, 0.85, 'smile');
  o += drop(40.2, 11.5, 6.5);
  return o;
};
I.today_fed = () => {
  let o = heart(24, 11, 7.5);
  o += P('M9 28 C10.5 21 17 18.5 24 18.5 C31 18.5 37.5 21 39 28 Z', PEACH, S(INW));
  o += ell(17, 24, 1.6, 1.1, INK, NS) + ell(24, 22, 1.6, 1.1, INK, NS) + ell(30.5, 24, 1.6, 1.1, INK, NS);
  o += P('M6 28 H42 C42 36 35 42 24 42 C13 42 6 36 6 28 Z', OR);
  o += P('M11.5 33.5 H36.5', 'none', `stroke="${W}" stroke-width="2.5" stroke-linecap="round"`);
  return o;
};
I.steps = () => sneaker(5.5, 24, 0.95, W) + sneaker(14, 39, 0.95, OR);
I.rest_day = () => {
  let o = P('M7.5 25 Q24 20.5 40.5 25 Q37.5 32.5 40.5 40 Q24 35.5 7.5 40 Q10.5 32.5 7.5 25 Z', SKY);
  o += P('M15 30 Q24 28 33 30', 'none', `stroke="${W}" stroke-width="2.4" stroke-linecap="round"`);
  o += capsule('M27.5 6.5 H35.5 L27.5 15 H35.5', SKY, 6, 2);
  o += capsule('M16 11.5 H21.5 L16 17 H21.5', SKY, 5.4, 1.8);
  return o;
};
I.shuffle = () => {
  let o = `<g transform="rotate(-14 24 26)">` + rect(11, 13, 26, 26, 6, W) + circ(17.5, 19.5, 2.5, INK, NS) + circ(24, 26, 2.5, INK, NS) + circ(30.5, 32.5, 2.5, INK, NS) + `</g>`;
  o += capsule('M33.5 7.5 Q39.5 8.5 41.5 14', SKY, 6, 2);
  return o;
};
I.weekly_goal = () => calendar(OR, 2);
I.weekly_goal_done = () => calendar(GOLD, 3) + sparkle(39.6, 8.4, 3.6);
I.welcome_back = () => {
  let o = body(24, 35, 11, 8.5);
  o += foot(18, 43) + foot(30, 43);
  o += head(24, 18, 0.74, 'squeeze');
  o += heart(24, 33.5, 8.5);
  o += pawDot(15.6, 31.5) + pawDot(32.4, 31.5);
  return o;
};
I.streak_freeze = () => {
  let o = `<g transform="rotate(-6 24 26)">` + rect(7.5, 9, 33, 33, 7, SKY) + `</g>`;
  o += P('M12.5 21 V16.5 Q12.5 14.2 15 14', 'none', `stroke="${W}" stroke-width="2.6" stroke-linecap="round"`);
  o += P('M24 14 C25.5 19.5 33 21.5 33 29.5 C33 35 29 38.5 24 38.5 C19 38.5 15 35 15 29.5 C15 25 17.5 23.5 18.5 20 C20.5 22.5 21.8 22.2 21.8 20.2 C21.8 17.5 22.8 15.8 24 14 Z', OR);
  o += P('M24 26 C25.8 28.6 28.4 30.3 28.4 33 C28.4 35.4 26.6 36.6 24 36.6 C21.4 36.6 19.6 35.4 19.6 33 C19.6 30.3 22.2 28.8 24 26 Z', GOLD, S(INW));
  return o;
};

// Mood
I.mood_happy = () => head(24, 26, 1.28, 'happy');
I.mood_hungry = () => head(24, 26, 1.28, 'hungry');
I.mood_rested = () => {
  let o = head(23, 27, 1.22, 'sleep');
  o += P('M38 4 A6.5 6.5 0 1 0 44 13 A5.2 5.2 0 0 1 38 4 Z', GOLD);
  return o;
};

// Hamster tab
I.shop = () => {
  let o = capsule('M17.5 18.5 V14 C17.5 6.5 30.5 6.5 30.5 14 V18.5', OR, 6.6, 2);
  o += P('M9 17 H39 L37 40 Q36.8 42 34.8 42 H13.2 Q11.2 42 11 40 Z', OR);
  o += paw(24, 30, 1.45, W);
  return o;
};
I.dress_up = () => {
  let o = capsule('M24 18 V15.6 C24 13.4 27.8 12.8 27.8 9.6 C27.8 7.4 26 6 24 6 C22 6 20.6 7.2 20.4 9', SAND, 6, 2);
  o += capsule('M24 17.5 L41 34 Q42.6 36.5 40 36.5 H8 Q5.4 36.5 7 34 Z', SAND, 7, 2.25);
  o += P('M24 22 L16.5 17 Q14 22 16.5 27 Z', CORAL) + P('M24 22 L31.5 17 Q34 22 31.5 27 Z', CORAL) + circ(24, 22, 2.6, CORAL, S(INW));
  o += sparkle(38.5, 12, 4.2);
  return o;
};

// Me tab
I.me_points_history = () => {
  let o = P('M12 6 H34 V38.5 L30.3 36 L26.6 38.5 L22.9 36 L19.2 38.5 L15.6 36 L12 38.5 Z', W);
  o += line(17, 13, 29, 13) + line(17, 19, 29, 19) + line(17, 25, 23, 25);
  o += circ(34.5, 35, 8, GOLD) + circ(34.5, 35, 3.6, 'none', S(INW));
  return o;
};
I.me_reminders = () => {
  let o = circ(24, 7.5, 2.5, GOLD);
  o += circ(24, 38.5, 4, OR);
  o += P('M8 35 C11.5 31.5 11 27 11 22 C11 14.5 16.5 10 24 10 C31.5 10 37 14.5 37 22 C37 27 36.5 31.5 40 35 Z', GOLD);
  return o;
};
I.me_settings = () => gear(24, 24, 17, 12.8, 8, SAND) + circ(24, 24, 5.4, OR);

// Workout types
I.type_strength = () => {
  let o = limb('M13 41 Q9 26 13.5 10') + limb('M35 41 Q39 26 34.5 10');
  o += head(24, 31.5, 0.92, 'smile');
  o += rect(10, 7.5, 28, 5, 2.5, W);
  o += rect(4.5, 4.5, 7, 11, 3, SAND) + rect(36.5, 4.5, 7, 11, 3, SAND);
  o += pawDot(13.5, 10, 3.1) + pawDot(34.5, 10, 3.1);
  return o;
};
I.type_cardio = () => heart(26, 21, 16) + sneaker(4, 42.5, 0.8, W);
I.type_intervals = () => {
  let o = rect(20.5, 4, 7, 5, 2, OR);
  o += `<g transform="rotate(45 37.6 13.4)">` + rect(35.3, 10.2, 4.6, 6.4, 1.6, OR) + `</g>`;
  o += circ(24, 27, 16, W);
  o += P('M27 12.5 L16.5 29 H23.5 L20.5 41.5 L32 24 H25 Z', GOLD, S(INW));
  return o;
};
I.type_yoga = () => {
  let o = rect(5.5, 39.5, 37, 4, 2, MINT);
  o += body(24, 30, 9, 8);
  o += P('M10.5 36.5 Q10.5 32 16 32.5 Q24 34 32 32.5 Q37.5 32 37.5 36.5 Q37.5 39.5 33 39.5 H15 Q10.5 39.5 10.5 36.5 Z', OR);
  o += P('M17 35.5 Q24 37.5 31 35.5', 'none', S(INW));
  o += limb('M16.5 27.5 Q12.5 30 13.5 33.5') + limb('M31.5 27.5 Q35.5 30 34.5 33.5');
  o += head(24, 17.6, 0.8, 'sleep');
  return o;
};
I.type_stretching = () => {
  let o = limb('M15 34 L7.5 10.5') + limb('M33 34 L40.5 10.5');
  o += pawDot(7.5, 10.5, 3.2) + pawDot(40.5, 10.5, 3.2);
  o += head(24, 31, 0.9, 'squeeze');
  return o;
};
I.type_pilates = () => {
  let o = rect(4.5, 36, 30, 6, 3, MINT);
  o += circ(36, 35, 7, MINT) + circ(36, 35, 2.6, 'none', S(INW));
  o += circ(18, 21.5, 9.5, CORAL) + P('M12.5 19 Q13.5 15.5 17 14.5', 'none', `stroke="${W}" stroke-width="2.4" stroke-linecap="round"`);
  return o;
};
I.type_mobility = () => {
  let o = arcArrow(24, 24, 18, 195, 335) + arcArrow(24, 24, 18, 15, 155);
  o += limb('M15.5 13.5 L26.5 24 L20 33.5', OR, 9);
  o += ell(23, 34.5, 4.6, 2.6, OR);
  o += circ(26.5, 24, 3.6, PEACH, S(INW));
  return o;
};
I.type_circuit = () => {
  let o = arcArrow(24, 24.5, 14, -62, 6, 3.6) + arcArrow(24, 24.5, 14, 58, 126, 3.6) + arcArrow(24, 24.5, 14, 178, 246, 3.6);
  const dot = (a, f) => { const t = a * Math.PI / 180; return circ(24 + 14 * Math.cos(t), 24.5 + 14 * Math.sin(t), 5.3, f); };
  o += dot(-90, CORAL) + dot(30, GOLD) + dot(150, MINT);
  return o;
};

// Player
I.player_warmup = () => {
  let o = body(24, 37, 9.5, 7);
  o += foot(18.5, 43.3) + foot(29.5, 43.3);
  o += limb('M16.5 34 L7.5 28') + limb('M31.5 34 L40.5 28');
  o += pawDot(7.5, 28) + pawDot(40.5, 28);
  o += head(24, 22.5, 0.76, 'smile');
  return o;
};
I.player_rest = () => {
  let o = rect(17.5, 4.5, 13, 6, 2.2, OR);
  o += P('M19.5 10.5 H28.5 V13 Q34 15 34 21 V39 Q34 43 30 43 H18 Q14 43 14 39 V21 Q14 15 19.5 13 Z', SKY);
  o += rect(14, 24, 20, 10, 0, W, S(INW));
  o += P('M20 29 Q22 27 24 29 Q26 31 28 29', 'none', S(INW));
  return o;
};
I.player_cooldown = () => {
  let o = head(19, 26, 0.86, 'breath', { band: true });
  o += capsule('M34.5 21 Q36.5 19 38.5 21 Q40.5 23 42 21', SKY, 6.2, 2) + capsule('M34.5 30 Q36.5 28 38.5 30 Q40.5 32 42 30', SKY, 6.2, 2);
  return o;
};
I.player_done = () => {
  let o = head(24, 18.2, 0.85, 'happy');
  o += capsule('M14.5 29.5 C9 29.5 9 36.5 15.5 36', GOLD, 6, 2) + capsule('M33.5 29.5 C39 29.5 39 36.5 32.5 36', GOLD, 6, 2);
  o += P('M14 27.5 H34 V30.5 C34 35.5 29.5 38 24 38 C18.5 38 14 35.5 14 30.5 Z', GOLD);
  o += rect(21.5, 38, 5, 2, 0, GOLD) + rect(16.5, 40, 15, 3.8, 1.9, OR);
  o += pawDot(15.2, 28, 3) + pawDot(32.8, 28, 3);
  return o;
};

// Rewards
I.steps_stroll = () => medal(OR, paw(24, 19.5, 1.5, INK));
I.steps_walk = () => medal(SKY, paw(18.5, 24.5, 1.02) + paw(29.5, 15, 1.02));
I.steps_adventure = () => medal(GOLD, paw(16.6, 25.5, 0.78) + paw(22.6, 19.2, 0.78) + capsule('M30 10.5 V27', W, 4.6, 1.6) + P('M30.5 9.5 L38 13 L30.5 16.5 Z', CORAL, S(INW)));
I.weekly_goal_reached = () => {
  let o = body(24, 35.5, 12, 8);
  o += foot(17.5, 42.2) + foot(30.5, 42.2);
  o += head(24, 17.6, 0.76, 'happy');
  // ribbon: coral core dominates (outline kept at the 1.6 floor)
  o += capsule('M19 27.5 L24 34 L29 27.5', CORAL, 6.6, 1.6);
  o += circ(24, 36.5, 5, GOLD);
  o += sparkle(41, 10, 3.4) + sparkle(7, 12, 2.6);
  return o;
};
I.bonus_gift = () => {
  let o = '';
  // bow loops behind the lid
  o += P('M24 17 C20 9.5 12.5 9 13.5 13.5 C14.2 16.5 19 17 24 17 Z', CORAL, S(INW));
  o += P('M24 17 C28 9.5 35.5 9 34.5 13.5 C33.8 16.5 29 17 24 17 Z', CORAL, S(INW));
  o += rect(10, 23, 28, 19.5, 3, OR);
  o += rect(7, 16.5, 34, 7.5, 3, OR);
  o += rect(21, 16.5, 6, 7.5, 0, CORAL, S(INW)) + rect(21, 24, 6, 18.5, 0, CORAL, S(INW));
  o += rect(10, 23, 28, 19.5, 3, 'none') + rect(7, 16.5, 34, 7.5, 3, 'none'); // re-stroke silhouette
  o += circ(24, 16.5, 3, CORAL, S(INW));
  return o;
};

const only = process.argv[3] ? process.argv[3].split(',') : null;
const SHIFT = { player_warmup: -1.6, weekly_goal_reached: -0.5, welcome_back: -1.5 };
let n = 0;
for (const [name, fn] of Object.entries(I)) {
  if (only && !only.includes(name)) continue;
  const b = fn();
  fs.writeFileSync(path.join(OUT, name + '.svg'), svg(SHIFT[name] ? `<g transform="translate(0 ${SHIFT[name]})">${b}</g>` : b)); n++;
}
console.log('wrote', n);
