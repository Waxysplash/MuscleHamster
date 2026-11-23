// Muscle Hamster icon builder. node build.mjs <outdir>
import fs from 'fs'; import path from 'path';
const OUT = process.argv[2] || 'out';
fs.mkdirSync(OUT, { recursive: true });

const INK = '#4A3728', OR = '#FF9500', PEACH = '#FFE3B8', SAND = '#F3E6D6', MINT = '#DDF2D8', SKY = '#D9EEF2', W = '#FFFFFF';
const CORAL = '#F2777A', GOLD = '#FFC93C';
const r = (n) => Math.round(n * 100) / 100;
const S = (w = 2.5) => `stroke="${INK}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"`;
const NS = `stroke="none"`;

const svg = (body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">${body}</svg>\n`;
const circ = (cx, cy, rad, fill, st = S()) => `<circle cx="${r(cx)}" cy="${r(cy)}" r="${r(rad)}" fill="${fill}" ${st}/>`;
const ell = (cx, cy, rx, ry, fill, st = S()) => `<ellipse cx="${r(cx)}" cy="${r(cy)}" rx="${r(rx)}" ry="${r(ry)}" fill="${fill}" ${st}/>`;
const P = (d, fill = 'none', st = S()) => `<path d="${d}" fill="${fill}" ${st}/>`;
const line = (x1, y1, x2, y2, w = 2.5) => `<line x1="${r(x1)}" y1="${r(y1)}" x2="${r(x2)}" y2="${r(y2)}" ${S(w)}/>`;
const rect = (x, y, w, h, rx, fill, st = S()) => `<rect x="${r(x)}" y="${r(y)}" width="${r(w)}" height="${r(h)}" rx="${r(rx)}" fill="${fill}" ${st}/>`;
// limb: a capsule drawn as ink stroke with a coloured core (2.5 ink each side, like every outline)
const limb = (d, color = OR, w = 8) => `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${color}" stroke-width="${w - 5}" stroke-linecap="round" stroke-linejoin="round"/>`;

// ---------- hamster ----------
// head centred on (cx,cy); k = scale (1 = 30 units wide head). expr: smile|happy|hungry|sleep|breath|squeeze
function head(cx, cy, k = 1, expr = 'smile', opt = {}) {
  const X = (x) => r(cx + x * k), Y = (y) => r(cy + y * k), K = (n) => r(n * k);
  const fw = Math.max(1.6, Math.min(2.2, 2 * k)); // face detail stroke
  let o = '';
  for (const s of [-1, 1]) {
    o += circ(cx + s * 10 * k, cy - 11.2 * k, 3.9 * k, OR);
    o += circ(cx + s * 10.5 * k, cy - 12.3 * k, 1.9 * k, CORAL, NS);
  }
  // chubby-cheeked head: widest just below the eyes
  const outline = `M${X(0)} ${Y(-12.5)} C${X(8.5)} ${Y(-12.5)} ${X(14)} ${Y(-8)} ${X(15)} ${Y(-1.5)} C${X(16.2)} ${Y(6)} ${X(10)} ${Y(13)} ${X(0)} ${Y(13)} C${X(-10)} ${Y(13)} ${X(-16.2)} ${Y(6)} ${X(-15)} ${Y(-1.5)} C${X(-14)} ${Y(-8)} ${X(-8.5)} ${Y(-12.5)} ${X(0)} ${Y(-12.5)} Z`;
  o += P(outline, OR);
  // cream lower face: orange dips to a soft V between the eyes
  o += P(`M${X(-14.8)} ${Y(1.5)} Q${X(-10)} ${Y(-3.8)} ${X(-4.6)} ${Y(1.2)} Q${X(0)} ${Y(4.4)} ${X(4.6)} ${Y(1.2)} Q${X(10)} ${Y(-3.8)} ${X(14.8)} ${Y(1.5)} C${X(15.6)} ${Y(7)} ${X(9.5)} ${Y(12.8)} ${X(0)} ${Y(12.8)} C${X(-9.5)} ${Y(12.8)} ${X(-15.6)} ${Y(7)} ${X(-14.8)} ${Y(1.5)} Z`, W, NS);
  if (opt.band !== false) {
    // headband (signature): coral band across the brow
    // band ends land on the silhouette; small heads get a plain stripe (no inner outline)
    o += P(`M${X(-13.9)} ${Y(-7.2)} Q${X(0)} ${Y(-15.8)} ${X(13.9)} ${Y(-7.2)} L${X(14.9)} ${Y(-2.6)} Q${X(0)} ${Y(-10.4)} ${X(-14.9)} ${Y(-2.6)} Z`, CORAL, k >= 0.75 ? S() : NS);
  }
  o += P(outline); // re-stroke silhouette over face + band
  // cheeks
  for (const s of [-1, 1]) o += ell(cx + s * 10 * k, cy + 4 * k, 2.3 * k, 1.5 * k, CORAL, NS);
  // eyes
  if (expr === 'sleep' || expr === 'breath') {
    for (const s of [-1, 1]) o += P(`M${X(s * 5.5 - 2.6)} ${Y(0)} Q${X(s * 5.5)} ${Y(2.6)} ${X(s * 5.5 + 2.6)} ${Y(0)}`, 'none', S(fw));
  } else if (expr === 'squeeze') {
    for (const s of [-1, 1]) o += P(`M${X(s * 5.5 - 2.4)} ${Y(1)} Q${X(s * 5.5)} ${Y(-2.4)} ${X(s * 5.5 + 2.4)} ${Y(1)}`, 'none', S(fw));
  } else {
    const er = expr === 'hungry' ? 3.1 : 2.4;
    for (const s of [-1, 1]) {
      o += circ(cx + s * 5.6 * k, cy + 0.3 * k, er * k, INK, NS);
      if (k >= 0.6) o += circ(cx + s * 5.6 * k + 0.9 * k, cy - 0.7 * k, (expr === 'hungry' ? 1.2 : 0.9) * k, W, NS);
      if (expr === 'hungry' && k >= 0.9) o += circ(cx + s * 5.6 * k - 1.1 * k, cy + 1.4 * k, 0.55 * k, W, NS);
    }
  }
  // nose
  o += ell(cx, cy + 4.3 * k, 1.8 * k, 1.3 * k, CORAL, `stroke="${INK}" stroke-width="${r(fw * 0.6)}"`);
  // mouth
  if (expr === 'happy') {
    o += P(`M${X(-3.8)} ${Y(6.8)} Q${X(0)} ${Y(13.2)} ${X(3.8)} ${Y(6.8)} Z`, CORAL, S(fw));
    if (k >= 0.9) o += rect(cx - 1.6 * k, cy + 6.8 * k, 3.2 * k, 2.2 * k, 0.4 * k, W, `stroke="${INK}" stroke-width="${r(fw * 0.6)}"`);
  } else if (expr === 'breath') {
    o += ell(cx, cy + 8.6 * k, 1.8 * k, 2 * k, INK, NS);
  } else if (expr === 'hungry') {
    o += P(`M${X(-3)} ${Y(6.6)} Q${X(-1.5)} ${Y(8.3)} ${X(0)} ${Y(6.6)} Q${X(1.5)} ${Y(8.3)} ${X(3)} ${Y(6.6)}`, 'none', S(fw));
    o += P(`M${X(1.3)} ${Y(7.6)} Q${X(2.2)} ${Y(11.6)} ${X(4.4)} ${Y(10)} Q${X(4.4)} ${Y(7.6)} ${X(3.2)} ${Y(7)}`, CORAL, S(fw * 0.8));
  } else {
    o += P(`M${X(-3)} ${Y(6.6)} Q${X(-1.5)} ${Y(8.3)} ${X(0)} ${Y(6.6)} Q${X(1.5)} ${Y(8.3)} ${X(3)} ${Y(6.6)}`, 'none', S(fw));
  }
  return o;
}
// body: pear-ish ellipse + cream belly
const body = (cx, cy, rx, ry) => ell(cx, cy, rx, ry, OR) + ell(cx, cy + ry * 0.18, rx * 0.62, ry * 0.66, W, NS);
const foot = (cx, cy) => ell(cx, cy, 3.4, 2.1, OR);
const pawDot = (cx, cy, rad = 2.9) => circ(cx, cy, rad, OR);

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
  if (k >= 0.8) o += line(ox + 12 * k, oy - 10.2 * k, ox + 13.6 * k, oy - 7.6 * k, 2) + line(ox + 15.6 * k, oy - 9.4 * k, ox + 16.6 * k, oy - 7.2 * k, 2);
  return o;
}
function sparkle(cx, cy, s, fill = GOLD) {
  const a = s, b = s * 0.32;
  return P(`M${r(cx)} ${r(cy - a)} Q${r(cx + b)} ${r(cy - b)} ${r(cx + a)} ${r(cy)} Q${r(cx + b)} ${r(cy + b)} ${r(cx)} ${r(cy + a)} Q${r(cx - b)} ${r(cy + b)} ${r(cx - a)} ${r(cy)} Q${r(cx - b)} ${r(cy - b)} ${r(cx)} ${r(cy - a)} Z`, fill, S(2));
}
function arcPts(cx, cy, R, a0, a1) { const t = (a) => a * Math.PI / 180; return [[cx + R * Math.cos(t(a0)), cy + R * Math.sin(t(a0))], [cx + R * Math.cos(t(a1)), cy + R * Math.sin(t(a1))]]; }
function arcArrow(cx, cy, R, a0, a1, head = 3.2) { // clockwise arc from a0 to a1 (degrees) with arrowhead at a1
  const [[x0, y0], [x1, y1]] = arcPts(cx, cy, R, a0, a1);
  const large = ((a1 - a0 + 360) % 360) > 180 ? 1 : 0;
  const t = a1 * Math.PI / 180; const tx = -Math.sin(t), ty = Math.cos(t); // tangent (cw)
  const nx = Math.cos(t), ny = Math.sin(t);
  const hx1 = x1 - tx * head + nx * head * 0.95, hy1 = y1 - ty * head + ny * head * 0.95;
  const hx2 = x1 - tx * head - nx * head * 0.95, hy2 = y1 - ty * head - ny * head * 0.95;
  return P(`M${r(x0)} ${r(y0)} A${R} ${R} 0 ${large} 1 ${r(x1)} ${r(y1)}`) + P(`M${r(hx1)} ${r(hy1)} L${r(x1)} ${r(y1)} L${r(hx2)} ${r(hy2)}`);
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

// ---------- icons ----------
const I = {};

// Tabs
I.tab_today = () => {
  let o = '';
  for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; o += line(24 + 15 * Math.cos(a), 24 + 15 * Math.sin(a), 24 + 20 * Math.cos(a), 24 + 20 * Math.sin(a), 2.8); }
  o += circ(24, 24, 11, GOLD);
  o += circ(19.6, 23.2, 1.6, INK, NS) + circ(28.4, 23.2, 1.6, INK, NS);
  o += ell(17.4, 27, 1.9, 1.3, CORAL, NS) + ell(30.6, 27, 1.9, 1.3, CORAL, NS);
  o += P('M21.2 27.2 Q24 30.2 26.8 27.2', 'none', S(2));
  return o;
};
I.tab_workouts = () => {
  // carrot dumbbell: bar + two carrot-orange plates with leafy tufts
  let o = '';
  for (const c of [10, 38]) o += P(`M${c - 0.5} 13 Q${c - 6} 10 ${c - 5} 5 Q${c - 1} 6.5 ${c - 0.5} 12`, MINT, S(2)) + P(`M${c + 0.5} 13 Q${c + 6} 10 ${c + 5} 5 Q${c + 1} 6.5 ${c + 0.5} 12`, MINT, S(2));
  o += rect(14, 21, 20, 6, 3, W);
  o += rect(5, 12, 10, 24, 4, OR) + rect(33, 12, 10, 24, 4, OR);
  o += line(8.5, 19, 11.5, 19, 2) + line(8.5, 25.5, 11.5, 25.5, 2) + line(36.5, 22, 39.5, 22, 2) + line(36.5, 28.5, 39.5, 28.5, 2);
  return o;
};
I.tab_hamster = () => head(24, 26, 1.28, 'smile');
const idCard = () => {
  let o = rect(9.5, 8, 29, 35, 5, W);
  o += rect(19.5, 4.5, 9, 6, 2, SAND);
  o += head(24, 21.5, 0.6, 'smile', { band: true });
  o += line(16, 34, 32, 34) + line(19, 38.6, 29, 38.6);
  return o;
};
I.tab_me = idCard;
I.me_profile = idCard;

// Today
I.today_exercise = () => {
  // front-view squat: knees out, paws together, effort ticks
  let o = '';
  o += limb('M19 31 L12 36 L13.5 41.2');
  o += limb('M29 31 L36 36 L34.5 41.2');
  o += ell(13, 41.5, 3.6, 2, OR) + ell(35, 41.5, 3.6, 2, OR);
  o += body(24, 30, 9.5, 7.5);
  o += head(24, 15.5, 0.72, 'smile');
  o += limb('M16.5 27 Q19 32 23 30.5') + limb('M31.5 27 Q29 32 25 30.5');
  o += line(4.5, 22, 7.5, 23.5) + line(43.5, 22, 40.5, 23.5) + line(5, 29, 8, 29) + line(43, 29, 40, 29);
  return o;
};
I.today_fed = () => {
  let o = heart(24, 11, 7.5);
  o += P('M9 28 C10.5 21 17 18.5 24 18.5 C31 18.5 37.5 21 39 28 Z', PEACH);
  o += ell(17, 24, 1.5, 1, INK, NS) + ell(24, 22, 1.5, 1, INK, NS) + ell(30.5, 24, 1.5, 1, INK, NS);
  o += P('M6 28 H42 C42 36 35 42 24 42 C13 42 6 36 6 28 Z', OR);
  o += P('M11.5 33.5 H36.5', 'none', `stroke="${W}" stroke-width="2.5" stroke-linecap="round"`);
  return o;
};
I.steps = () => sneaker(4.5, 25, 0.95, SKY) + sneaker(15, 40, 0.95, OR);
I.rest_day = () => {
let o = P('M7.5 25 Q24 20.5 40.5 25 Q37.5 32.5 40.5 40 Q24 35.5 7.5 40 Q10.5 32.5 7.5 25 Z', SKY);
  o += P('M15 30 Q24 28 33 30', 'none', `stroke="${W}" stroke-width="2.4" stroke-linecap="round"`);
  o += P('M27 6 H35 L27 15 H35', 'none', S(2.6));
  o += P('M17.5 12 H23 L17.5 18 H23', 'none', S(2.4));
  return o;
};
I.shuffle = () => {
  let o = `<g transform="rotate(-14 25 26)">` + rect(12, 13, 26, 26, 6, W) + circ(18.5, 19.5, 2.4, INK, NS) + circ(25, 26, 2.4, INK, NS) + circ(31.5, 32.5, 2.4, INK, NS) + `</g>`;
  o += line(4.5, 33, 8.5, 33) + line(5.5, 39, 10.5, 39);
  o += P('M34 6 Q40.5 7 42.5 13.5');
  return o;
};
I.weekly_goal = () => {
let o = rect(7, 10, 34, 32, 5, W);
  o += P('M7 20 V15 Q7 10 12 10 H36 Q41 10 41 15 V20 Z', OR);
  o += line(16, 6, 16, 13) + line(32, 6, 32, 13);
  o += P('M11.5 30 L15 33.5 L20.5 26.5', 'none', S(3)) + P('M23.5 30 L27 33.5 L32.5 26.5', 'none', S(3));
  o += circ(35.5, 31, 1.8, SAND, S(2));
  return o;
};
I.welcome_back = () => {
  let o = body(24, 35, 11, 8.5);
  o += foot(18, 43) + foot(30, 43);
  o += head(24, 17.5, 0.74, 'squeeze');
  o += heart(24, 33.5, 8.5);
  o += pawDot(15.6, 31.5) + pawDot(32.4, 31.5);
  return o;
};
I.streak_freeze = () => {
  let o = `<g transform="rotate(-6 24 26)">` + rect(7.5, 9, 33, 33, 7, SKY) + `</g>`;
  o += P('M12.5 21 V16.5 Q12.5 14.2 15 14', 'none', `stroke="${W}" stroke-width="2.6" stroke-linecap="round"`);
  o += P('M24 14 C25.5 19.5 33 21.5 33 29.5 C33 35 29 38.5 24 38.5 C19 38.5 15 35 15 29.5 C15 25 17.5 23.5 18.5 20 C20.5 22.5 21.8 22.2 21.8 20.2 C21.8 17.5 22.8 15.8 24 14 Z', OR);
  o += P('M24 26 C25.8 28.6 28.4 30.3 28.4 33 C28.4 35.4 26.6 36.6 24 36.6 C21.4 36.6 19.6 35.4 19.6 33 C19.6 30.3 22.2 28.8 24 26 Z', GOLD, S(2));
  return o;
};

// Mood
I.mood_happy = () => head(24, 26, 1.28, 'happy');
I.mood_hungry = () => head(24, 26, 1.28, 'hungry');
I.mood_rested = () => {
  let o = head(22, 28.5, 1.12, 'sleep');
  o += P('M37 4.5 A8 8 0 1 0 44 15 A6.4 6.4 0 0 1 37 4.5 Z', GOLD);
  return o;
};

// Hamster tab
I.shop = () => {
  let o = P('M17.5 18 V14 C17.5 6.5 30.5 6.5 30.5 14 V18');
  o += P('M9 17 H39 L37 40 Q36.8 42 34.8 42 H13.2 Q11.2 42 11 40 Z', OR);
  o += paw(24, 30, 1.45, W);
  return o;
};
I.dress_up = () => {
  let o = P('M24 18 V15.6 C24 13.4 27.8 12.8 27.8 9.6 C27.8 7.4 26 6 24 6 C22 6 20.6 7.2 20.4 9', 'none', S(2.6));
  o += P('M24 17.5 L41 34 Q42.6 36.5 40 36.5 H8 Q5.4 36.5 7 34 Z', 'none', `stroke="${INK}" stroke-width="6.4" stroke-linejoin="round"`);
  o += P('M24 17.5 L41 34 Q42.6 36.5 40 36.5 H8 Q5.4 36.5 7 34 Z', 'none', `stroke="${SAND}" stroke-width="1.9" stroke-linejoin="round"`);
  o += P('M24 22 L16.5 17 Q14 22 16.5 27 Z', CORAL) + P('M24 22 L31.5 17 Q34 22 31.5 27 Z', CORAL) + circ(24, 22, 2.6, CORAL);
  o += sparkle(38.5, 13, 4.2) + sparkle(8.5, 40.5, 2.8);
  return o;
};

// Me tab
I.me_points_history = () => {
  let o = P('M10 6 H32 V38.5 L28.3 36 L24.6 38.5 L20.9 36 L17.2 38.5 L13.6 36 L10 38.5 Z', W);
  o += line(15, 13, 27, 13) + line(15, 19, 27, 19) + line(15, 25, 21, 25);
  o += circ(33, 34, 8.6, GOLD) + circ(33, 34, 4.4, 'none', S(2));
  return o;
};
I.me_reminders = () => {
  let o = circ(24, 8, 2.4, GOLD);
  o += circ(24, 37.5, 3.6, OR);
  o += P('M11 34 C14 31 13.5 27 13.5 22 C13.5 15 18 10.5 24 10.5 C30 10.5 34.5 15 34.5 22 C34.5 27 34 31 37 34 Z', GOLD);
  o += P('M6 15 Q4.5 19.5 6 24', 'none', S(2.4)) + P('M42 15 Q43.5 19.5 42 24', 'none', S(2.4));
  return o;
};
I.me_settings = () => gear(24, 24, 19, 14.2, 8, SAND) + circ(24, 24, 6, OR);

// Workout types
I.type_strength = () => {
  let o = limb('M13 40 Q9 25 13.5 11') + limb('M35 40 Q39 25 34.5 11');
  o += head(24, 30, 0.92, 'smile');
  o += rect(10, 8.5, 28, 5, 2.5, W);
  o += rect(4.5, 4.5, 7, 13, 3, OR) + rect(36.5, 4.5, 7, 13, 3, OR);
  o += pawDot(13.5, 11, 2.8) + pawDot(34.5, 11, 2.8);
  return o;
};
I.type_cardio = () => heart(26, 21, 16) + sneaker(4, 42.5, 0.8, W);
I.type_intervals = () => {
  let o = rect(20.5, 4, 7, 5, 2, OR) + line(37, 12, 39.5, 9.5);
  o += circ(24, 27, 16, W);
  o += P('M27 12.5 L16.5 29 H23.5 L20.5 41.5 L32 24 H25 Z', GOLD);
  return o;
};
I.type_yoga = () => {
let o = rect(5.5, 39.5, 37, 4, 2, MINT);
  o += body(24, 29.5, 9, 8);
  o += P('M10.5 36.5 Q10.5 32 16 32.5 Q24 34 32 32.5 Q37.5 32 37.5 36.5 Q37.5 39.5 33 39.5 H15 Q10.5 39.5 10.5 36.5 Z', OR);
  o += P('M17 35.5 Q24 37.5 31 35.5', 'none', S(2));
  o += limb('M17.5 26 Q13 29 13.5 33') + limb('M30.5 26 Q35 29 34.5 33');
  o += head(24, 16, 0.72, 'sleep');
  return o;
};
I.type_stretching = () => {
  let o = limb('M15 34 L7.5 10.5') + limb('M33 34 L40.5 10.5');
  o += pawDot(7.5, 10.5, 3) + pawDot(40.5, 10.5, 3);
  o += head(24, 31, 0.9, 'squeeze');
  o += line(13, 5, 14.5, 7.5, 2.2) + line(35, 5, 33.5, 7.5, 2.2);
  return o;
};
I.type_pilates = () => {
let o = rect(4.5, 36, 30, 6, 3, MINT);
  o += circ(36, 35, 7, MINT) + circ(36, 35, 2.6, 'none', S(2));
  o += circ(18, 21.5, 9.5, CORAL) + P('M12.5 19 Q13.5 15.5 17 14.5', 'none', `stroke="${W}" stroke-width="2.4" stroke-linecap="round"`);
  return o;
};
I.type_mobility = () => {
let o = arcArrow(24, 24, 18.5, 195, 335, 3.6) + arcArrow(24, 24, 18.5, 15, 155, 3.6);
  o += limb('M15.5 13.5 L26.5 24 L20 33.5', OR, 9);
  o += ell(23, 34.5, 4.6, 2.6, OR);
  o += circ(26.5, 24, 3.6, PEACH);
  return o;
};
I.type_circuit = () => {
  let o = arcArrow(24, 24.5, 14, -58, 2, 3.4) + arcArrow(24, 24.5, 14, 62, 122, 3.4) + arcArrow(24, 24.5, 14, 182, 242, 3.4);
  const dot = (a, f) => { const t = a * Math.PI / 180; return circ(24 + 14 * Math.cos(t), 24.5 + 14 * Math.sin(t), 5.3, f); };
  o += dot(-90, CORAL) + dot(30, GOLD) + dot(150, MINT);
  return o;
};

// Player
I.player_warmup = () => {
let o = arcArrow(24, 27, 18.5, 196, 334, 3.6);
  o += body(24, 37, 9.5, 7);
  o += foot(18.5, 43.3) + foot(29.5, 43.3);
  o += limb('M16.5 34 L7.5 29') + limb('M31.5 34 L40.5 29');
  o += pawDot(7.5, 29, 3) + pawDot(40.5, 29, 3);
  o += head(24, 23.5, 0.72, 'smile');
  return o;
};
I.player_rest = () => {
  let o = rect(17.5, 4.5, 13, 6, 2.2, OR);
  o += P('M19.5 10.5 H28.5 V13 Q34 15 34 21 V39 Q34 43 30 43 H18 Q14 43 14 39 V21 Q14 15 19.5 13 Z', SKY);
  o += rect(14, 24, 20, 10, 0, W);
  o += P('M20 29 Q22 27 24 29 Q26 31 28 29', 'none', S(2));
  return o;
};
I.player_cooldown = () => {
  let o = head(17, 26, 0.86, 'breath', { band: true });
  o += P('M31 20 Q34 18 37 20 Q40 22 43 20', 'none', S()) + P('M32.5 27 Q35.5 25 38.5 27 Q41.5 29 44 27', 'none', S()) + P('M31 34 Q34 32 37 34 Q40 36 43 34', 'none', S());
  return o;
};
I.player_done = () => {
  let o = head(24, 15.3, 0.72, 'happy');
  o += P('M14.5 24 C8.5 24 8.5 32.5 15.5 32') + P('M33.5 24 C39.5 24 39.5 32.5 32.5 32');
  o += P('M13.5 22 H34.5 V27 C34.5 33.5 29.5 36.5 24 36.5 C18.5 36.5 13.5 33.5 13.5 27 Z', GOLD);
  o += rect(21.5, 36.5, 5, 3.5, 0, GOLD) + rect(16.5, 39, 15, 4.5, 2, OR);
  o += pawDot(15.5, 22.5, 2.8) + pawDot(32.5, 22.5, 2.8);
  o += sparkle(24, 29, 3.2, W);
  return o;
};

// Rewards
I.steps_stroll = () => medal(OR, paw(24, 19.5, 1.5, INK));
I.steps_walk = () => medal(SKY, paw(18.5, 24.5, 1.02) + paw(29.5, 15, 1.02));
I.steps_adventure = () => medal(GOLD, paw(16.6, 25.5, 0.78) + paw(22.6, 19.2, 0.78) + line(30, 10, 30, 27) + P('M30 10 L37.5 13.5 L30 17 Z', CORAL, S(2)));
I.weekly_goal_reached = () => {
  let o = body(24, 36, 12, 8.5);
  o += foot(17.5, 43.2) + foot(30.5, 43.2);
  o += head(24, 17, 0.76, 'happy');
  o += P('M19 27.5 L24 34 L29 27.5', 'none', `stroke="${INK}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"`) + P('M19 27.5 L24 34 L29 27.5', 'none', `stroke="${CORAL}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"`);
  o += circ(24, 36.5, 5, GOLD);
  o += sparkle(41, 10, 3.4) + sparkle(7, 12, 2.6);
  return o;
};

const only = process.argv[3] ? process.argv[3].split(',') : null;
let n = 0;
for (const [name, fn] of Object.entries(I)) {
  if (only && !only.includes(name)) continue;
  const SHIFT = { player_warmup: -1.6, weekly_goal_reached: -1, welcome_back: -1.5 }; const b = fn(); fs.writeFileSync(path.join(OUT, name + '.svg'), svg(SHIFT[name] ? `<g transform="translate(0 ${SHIFT[name]})">${b}</g>` : b)); n++;
}
console.log('wrote', n);
