// Renders the Uchi Slack kit to PNG files with Chromium.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const OUT = path.join(ROOT, 'uchi-slack-kit');
const FONT = `file://${ROOT}/node_modules/@fontsource`;
const C = { shu: '#C23B2A', sumi: '#161514', washi: '#F6F3EC', ai: '#26415E', matcha: '#5F7F3A', kogecha: '#6B4A2E', murasaki: '#5B3F6B', ochre: '#A8782A' };

const head = `<meta charset="utf-8">
<link rel="stylesheet" href="${FONT}/zen-old-mincho/900.css">
<link rel="stylesheet" href="${FONT}/zen-old-mincho/700.css">
<link rel="stylesheet" href="${FONT}/zen-kaku-gothic-new/500.css">
<style>html,body{margin:0;background:transparent}#t{display:block}</style>`;

// The refined seal (option A). `small` drops the hairline border and thickens strokes.
const seal = (bg, fg, small = false) => small
  ? `<rect x="8" y="8" width="104" height="104" rx="4" fill="${bg}"/><polyline points="28,58 60,31 92,58" fill="none" stroke="${fg}" stroke-width="10" stroke-linejoin="miter"/><circle cx="46" cy="72" r="8" fill="${fg}"/><circle cx="74" cy="72" r="8" fill="${fg}"/><path d="M34 96 A12 12 0 0 1 58 96 Z" fill="${fg}"/><path d="M62 96 A12 12 0 0 1 86 96 Z" fill="${fg}"/>`
  : `<rect x="8" y="8" width="104" height="104" rx="3" fill="${bg}"/><rect x="15" y="15" width="90" height="90" rx="1.5" fill="none" stroke="${fg}" stroke-width="1.5"/><polyline points="30,58 60,33 90,58" fill="none" stroke="${fg}" stroke-width="7" stroke-linejoin="miter"/><circle cx="47" cy="70" r="6" fill="${fg}"/><circle cx="73" cy="70" r="6" fill="${fg}"/><path d="M37 92 A10 10 0 0 1 57 92 Z" fill="${fg}"/><path d="M63 92 A10 10 0 0 1 83 92 Z" fill="${fg}"/>`;

const svg = (size, inner, vb = 120) => `<svg id="t" width="${size}" height="${size}" viewBox="0 0 ${vb} ${vb}" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;

const jobs = [];

// 1. Workspace icon: full-bleed seal red, mark in washi (Slack rounds the corners itself).
jobs.push({ file: 'workspace/uchi-workspace-icon-1024.png', html: svg(1024, `<rect width="120" height="120" fill="${C.shu}"/><g transform="translate(12 12) scale(0.8)">${seal(C.shu, C.washi)}</g>`) });

// 2. App icon for the company bot app: sumi ground with the red seal.
jobs.push({ file: 'app/uchi-office-app-icon-1024.png', html: svg(1024, `<rect width="120" height="120" fill="${C.sumi}"/><g transform="translate(22 22) scale(0.6333)">${seal(C.shu, C.washi)}</g>`) });

// 3. Persona avatars: hanko-style seals, one colour per department, initial in Zen Old Mincho.
const personas = [
  ['nora', 'N', C.shu, 'Leadership'], ['ollie', 'O', C.matcha, 'Product'], ['mara', 'M', C.matcha, 'Product'],
  ['iris', 'I', C.matcha, 'Product'], ['ada', 'A', C.matcha, 'Product'], ['theo', 'T', C.ai, 'Engineering'],
  ['bea', 'B', C.ai, 'Engineering'], ['kai', 'K', C.ai, 'Engineering'], ['quinn', 'Q', C.ai, 'Engineering'],
  ['dex', 'D', C.sumi, 'Ops and security'], ['sol', 'S', C.sumi, 'Ops and security'], ['wren', 'W', C.kogecha, 'Docs and support'],
  ['sam', 'S', C.kogecha, 'Docs and support'], ['penny', 'P', C.murasaki, 'Business'], ['lex', 'L', C.murasaki, 'Business'],
  ['juno', 'J', C.murasaki, 'Business'],
];
// One simple icon per role, drawn in washi on the department colour (512 px grid).
const s = (w = 26) => `fill="none" stroke="${C.washi}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"`;
const f = `fill="${C.washi}"`;
const icons = {
  // CEO: compass, sets direction
  nora: () => `<circle cx="256" cy="256" r="130" ${s()}/><polygon points="256,146 292,256 220,256" ${f}/><polygon points="220,256 292,256 256,366" ${s(14)}/>`,
  // Product owner: target, who is this for
  ollie: () => `<circle cx="256" cy="256" r="130" ${s()}/><circle cx="256" cy="256" r="76" ${s()}/><circle cx="256" cy="256" r="24" ${f}/>`,
  // Market analyst: rising bars
  mara: () => `<line x1="140" y1="378" x2="372" y2="378" ${s(20)}/><rect x="160" y="292" width="48" height="66" rx="6" ${f}/><rect x="232" y="228" width="48" height="130" rx="6" ${f}/><rect x="304" y="156" width="48" height="202" rx="6" ${f}/>`,
  // UX/UI designer: an eye (her name is Iris)
  iris: (bg) => `<path d="M108 256 Q256 116 404 256 Q256 396 108 256 Z" ${s()}/><circle cx="256" cy="256" r="58" ${f}/><circle cx="256" cy="256" r="22" fill="${bg}"/>`,
  // Data analyst: line chart with points
  ada: () => `<polyline points="140,140 140,372 372,372" ${s(20)}/><polyline points="176,318 236,248 292,282 360,172" ${s()}/><circle cx="176" cy="318" r="17" ${f}/><circle cx="236" cy="248" r="17" ${f}/><circle cx="292" cy="282" r="17" ${f}/><circle cx="360" cy="172" r="17" ${f}/>`,
  // Architect: drafting compass
  theo: () => `<circle cx="256" cy="142" r="24" ${f}/><line x1="256" y1="160" x2="168" y2="382" ${s()}/><line x1="256" y1="160" x2="344" y2="382" ${s()}/><line x1="202" y1="300" x2="310" y2="300" ${s(18)}/>`,
  // Backend engineer: database
  bea: () => `<ellipse cx="256" cy="160" rx="110" ry="40" ${s(24)}/><path d="M146 160 V352 A110 40 0 0 0 366 352 V160" ${s(24)}/><path d="M146 256 A110 40 0 0 0 366 256" ${s(24)}/>`,
  // Frontend engineer: browser window with layout
  kai: () => `<rect x="118" y="138" width="276" height="236" rx="18" ${s(24)}/><line x1="118" y1="194" x2="394" y2="194" ${s(20)}/><circle cx="150" cy="166" r="9" ${f}/><circle cx="178" cy="166" r="9" ${f}/><rect x="150" y="226" width="92" height="116" rx="8" ${f}/><rect x="266" y="226" width="98" height="22" rx="6" ${f}/><rect x="266" y="270" width="98" height="22" rx="6" ${f}/><rect x="266" y="314" width="62" height="22" rx="6" ${f}/>`,
  // QA: magnifier with a check
  quinn: () => `<circle cx="226" cy="226" r="98" ${s()}/><line x1="298" y1="298" x2="384" y2="384" ${s(36)}/><polyline points="182,230 214,262 272,196" ${s(24)}/>`,
  // DevOps: the build-ship loop
  dex: () => `<path d="M256 256 C214 192 128 192 128 256 C128 320 214 320 256 256 C298 192 384 192 384 256 C384 320 298 320 256 256 Z" ${s(28)}/>`,
  // Security: shield with keyhole
  sol: () => `<path d="M256 118 L372 160 V256 C372 330 318 374 256 398 C194 374 140 330 140 256 V160 Z" ${s()}/><circle cx="256" cy="238" r="28" ${f}/><rect x="243" y="246" width="26" height="70" rx="8" ${f}/>`,
  // Documentation lead: open book
  wren: () => `<path d="M256 178 C214 148 162 144 122 152 V362 C162 354 214 358 256 386 Z" ${s(24)}/><path d="M256 178 C298 148 350 144 390 152 V362 C350 354 298 358 256 386 Z" ${s(24)}/>`,
  // Customer support: headset
  sam: () => `<path d="M148 286 V252 A108 108 0 0 1 364 252 V286" ${s()}/><rect x="122" y="262" width="54" height="90" rx="20" ${f}/><rect x="336" y="262" width="54" height="90" rx="20" ${f}/><path d="M362 352 C362 388 324 402 286 402" ${s(18)}/><circle cx="276" cy="402" r="15" ${f}/>`,
  // Finance and admin: stack of coins
  penny: () => `<rect x="150" y="300" width="212" height="48" rx="24" ${s(22)}/><rect x="170" y="244" width="212" height="48" rx="24" ${s(22)}/><rect x="150" y="188" width="212" height="48" rx="24" ${s(22)}/><line x1="196" y1="212" x2="316" y2="212" ${s(10)}/>`,
  // Legal and compliance: scales
  lex: () => `<circle cx="256" cy="140" r="16" ${f}/><line x1="256" y1="156" x2="256" y2="372" ${s(24)}/><line x1="196" y1="378" x2="316" y2="378" ${s(24)}/><line x1="140" y1="184" x2="372" y2="184" ${s(24)}/><polyline points="128,282 160,184 192,282" ${s(14)}/><polyline points="320,282 352,184 384,282" ${s(14)}/><path d="M112 282 H208 A48 48 0 0 1 112 282 Z" ${f}/><path d="M304 282 H400 A48 48 0 0 1 304 282 Z" ${f}/>`,
  // Brand and marketing: megaphone
  juno: () => `<path d="M156 228 L304 158 V354 L156 284 Z" ${s()}/><rect x="118" y="226" width="40" height="60" rx="10" ${f}/><line x1="196" y1="300" x2="214" y2="364" ${s()}/><path d="M346 214 Q374 256 346 298" ${s(22)}/><path d="M380 182 Q428 256 380 330" ${s(22)}/>`,
};
for (const [name, , bg] of personas) {
  jobs.push({ file: `avatars/${name}.png`, html: svg(512, `<rect width="512" height="512" fill="${bg}"/><rect x="30" y="30" width="452" height="452" rx="6" fill="none" stroke="${C.washi}" stroke-width="4" stroke-opacity="0.75"/>${icons[name](bg)}`, 512) });
}

// 4. Custom emoji, 128 px, transparent background.
const ring = (bg, inner) => `<circle cx="64" cy="64" r="58" fill="${bg}"/>${inner}`;
const W = C.washi;
const emoji = {
  'uchi': seal(C.shu, W, true),
  'approve': ring(C.shu, `<polyline points="36,66 56,86 94,44" fill="none" stroke="${W}" stroke-width="14" stroke-linecap="square" stroke-linejoin="miter"/>`),
  'rework': ring(C.ai, `<path d="M86 84 A26 26 0 1 0 44 50" fill="none" stroke="${W}" stroke-width="12"/><polygon points="28,38 58,38 43,62" fill="${W}" transform="rotate(-20 43 50)"/>`),
  'gate': `<path d="M8 30 Q64 16 120 30 L118 42 Q64 30 10 42 Z" fill="${C.shu}"/><rect x="20" y="54" width="88" height="10" fill="${C.shu}"/><rect x="30" y="38" width="12" height="82" fill="${C.shu}"/><rect x="86" y="38" width="12" height="82" fill="${C.shu}"/><rect x="58" y="40" width="12" height="16" fill="${C.shu}"/>`,
  'needs-jakub': `<rect x="8" y="8" width="112" height="112" rx="4" fill="${C.shu}"/><rect x="56" y="26" width="16" height="52" fill="${W}"/><rect x="56" y="88" width="16" height="16" fill="${W}"/>`,
  'shipped': ring(C.matcha, `<polyline points="40,62 64,38 88,62" fill="none" stroke="${W}" stroke-width="14" stroke-linejoin="miter"/><rect x="57" y="44" width="14" height="48" fill="${W}"/>`),
  'handover': ring(C.ai, `<rect x="28" y="57" width="48" height="14" fill="${W}"/><polygon points="72,42 96,64 72,86" fill="${W}"/><circle cx="104" cy="64" r="0" fill="${W}"/>`),
  'blocked': ring('#5A5550', `<rect x="30" y="56" width="68" height="16" fill="${W}"/>`),
  'wip': ring(C.ochre, `<circle cx="40" cy="64" r="9" fill="${W}"/><circle cx="64" cy="64" r="9" fill="${W}"/><circle cx="88" cy="64" r="9" fill="${W}"/>`),
};
for (const [name, inner] of Object.entries(emoji)) jobs.push({ file: `emoji/${name}.png`, html: svg(128, inner, 128), transparent: true });
// The uchi emoji uses the 120 viewBox seal.
jobs.find(j => j.file === 'emoji/uchi.png').html = svg(128, seal(C.shu, W, true));

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ deviceScaleFactor: 1 });
  const tmp = path.join(ROOT, '_page.html');
  for (const j of jobs) {
    fs.mkdirSync(path.dirname(path.join(OUT, j.file)), { recursive: true });
    fs.writeFileSync(tmp, `<!doctype html><html><head>${head}</head><body>${j.html}</body></html>`);
    await page.goto(`file://${tmp}`);
    await page.evaluate(() => document.fonts.ready);
    await page.locator('#t').screenshot({ path: path.join(OUT, j.file), omitBackground: !!j.transparent });
  }
  // Contact sheet for a quick look at everything.
  const img = f => `file://${path.join(OUT, f)}`;
  const tile = (f, label, s) => `<figure style="margin:0;display:flex;flex-direction:column;align-items:center;gap:10px"><img src="${img(f)}" width="${s}" height="${s}" style="border-radius:${s > 100 ? 22 : 0}px"><figcaption>${label}</figcaption></figure>`;
  const sheet = `<!doctype html><html><head>${head}<style>body{background:${C.washi};font-family:'Zen Kaku Gothic New';color:${C.sumi};padding:56px;width:1488px}h1{font-family:'Zen Old Mincho';font-weight:900;font-size:56px;margin:0 0 8px}h2{font-size:14px;letter-spacing:.24em;font-weight:500;margin:48px 0 20px;border-top:1px solid ${C.sumi};padding-top:16px}.row{display:flex;flex-wrap:wrap;gap:28px}figcaption{font-size:14px}.dark{background:${C.sumi};color:${W};padding:24px;display:flex;gap:28px;flex-wrap:wrap}</style></head><body id="t">
<h1>uchi · Slack kit</h1><div>Workspace, app, 16 agent avatars and 9 custom emoji</div>
<h2>WORKSPACE AND APP ICONS</h2><div class="row">${tile('workspace/uchi-workspace-icon-1024.png', 'Workspace icon', 160)}${tile('app/uchi-office-app-icon-1024.png', 'App icon: Uchi Office', 160)}</div>
<h2>AGENT AVATARS</h2><div class="row">${personas.map(([n]) => tile(`avatars/${n}.png`, n[0].toUpperCase() + n.slice(1), 120)).join('')}</div>
<h2>CUSTOM EMOJI · LIGHT AND DARK</h2><div class="row">${Object.keys(emoji).map(n => tile(`emoji/${n}.png`, ':' + n + ':', 64)).join('')}</div>
<div class="dark" style="margin-top:20px">${Object.keys(emoji).map(n => `<img src="${img(`emoji/${n}.png`)}" width="32" height="32">`).join('')}<span style="font-size:14px;align-self:center">at message size on a dark theme</span></div>
</body></html>`;
  fs.writeFileSync(tmp, sheet);
  await page.goto(`file://${tmp}`);
  await page.evaluate(() => document.fonts.ready);
  await page.setViewportSize({ width: 1600, height: 1200 });
  await page.screenshot({ path: path.join(ROOT, 'uchi-slack-kit-preview.png'), fullPage: true });
  fs.unlinkSync(tmp);
  await browser.close();
  console.log(`rendered ${jobs.length} files`);
})();
