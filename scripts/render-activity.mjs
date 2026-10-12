import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { Resvg } from '@resvg/resvg-js';
import gifenc from 'gifenc';

const { GIFEncoder, quantize, applyPalette } = gifenc;
const ROOT = fileURLToPath(new URL('../assets/activity/', import.meta.url));
const FRAMES = 32;
const LABELS = new Map([
  ['ydflow/research-trail', 'ResearchTrail'],
  ['Tencent/teamai-cli', 'TeamAI'],
  ['ydflow/incident-response-agent', '故障智巡'],
  ['ydflow/cyber-girlfriend-16gb', 'AI Digital Human'],
  ['alibaba/open-code-review', 'Open Code Review'],
  ['agentscope-ai/agentscope', 'AgentScope'],
  ['volcengine/OpenViking', 'OpenViking'],
]);

const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[char]);
const text = (value, x, y, size, color = '#21354e', extra = '') => `<text x="${x}" y="${y}" font-size="${size}" fill="${color}" ${extra}>${escape(value)}</text>`;

function branch(x, y, color, size = 14) {
  return `<g transform="translate(${x},${y}) scale(${size / 20})" fill="none" stroke="${color}" stroke-width="1.7" stroke-linecap="round"><path d="M5 5v10m0-5h5a5 5 0 0 0 5-5"/><circle cx="5" cy="3" r="2"/><circle cx="5" cy="17" r="2"/><circle cx="15" cy="3" r="2"/></g>`;
}

function decorations(mobile, frame) {
  const angle = (frame / FRAMES) * Math.PI * 2;
  const width = mobile ? 420 : 960;
  const glints = (mobile ? [[width - 35, 19], [width - 74, 56]] : [[500, 26], [624, 63], [922, 451]]).map(([x, y], i) => {
    const opacity = 0.15 + 0.5 * Math.sin(angle + i) ** 2;
    return `<path d="M${x - 4} ${y}h8M${x} ${y - 4}v8" stroke="#fff7d5" stroke-width="1.2" opacity="${opacity.toFixed(3)}"/>`;
  });
  // Float only along the margins and illustration edge, away from all data.
  const petals = (mobile ? [[9, 155], [width - 8, 72]] : [[14, 209], [941, 212], [938, 466]]).map(([x, y], i) => {
    const xx = x + Math.sin(angle + i * 1.4) * 4;
    const yy = y + Math.cos(angle + i * 1.4) * 7;
    return `<ellipse cx="${xx.toFixed(2)}" cy="${yy.toFixed(2)}" rx="2.5" ry="5" fill="#fffaf0" stroke="#dccb91" stroke-width="0.3" opacity="0.7" transform="rotate(${(Math.sin(angle + i) * 22 + 30).toFixed(2)} ${xx.toFixed(2)} ${yy.toFixed(2)})"/>`;
  });
  return glints.join('') + petals.join('');
}

export function activitySvg(rows, mobile = false, frame = 0, background = '') {
  if (rows.length > 7) throw new Error('Compact activity panel supports at most seven repositories');
  const width = mobile ? 420 : 960;
  const height = mobile ? 530 : 520;
  const dataUri = background || `data:image/jpeg;base64,${readFileSync(`${ROOT}background.jpg`).toString('base64')}`;
  const artwork = mobile
    ? `<rect width="420" height="530" fill="#f9f5e9"/>
       <svg x="0" y="0" width="420" height="80" viewBox="500 0 1050 200" preserveAspectRatio="xMidYMid slice"><image href="${dataUri}" width="1704" height="923"/></svg>
       <rect width="290" height="80" fill="url(#hero-shade)"/>
       <svg x="0" y="80" width="420" height="450" viewBox="0 210 1160 700" preserveAspectRatio="none"><image href="${dataUri}" width="1704" height="923"/></svg>
       <svg x="270" y="458" width="70" height="64" viewBox="1290 285 340 310" preserveAspectRatio="xMidYMid slice"><image href="${dataUri}" width="1704" height="923"/></svg>
       <svg x="345" y="458" width="70" height="64" viewBox="1240 600 360 330" preserveAspectRatio="xMidYMid slice"><image href="${dataUri}" width="1704" height="923"/></svg>`
    : `<image href="${dataUri}" width="960" height="520" preserveAspectRatio="none"/>`;
  const columns = mobile ? [253, 315, 376] : [451, 534, 618];
  const headerY = mobile ? 102 : 144;
  const firstY = mobile ? 111 : 157;
  const rowHeight = mobile ? 47 : 42;
  let ui = text('RECENT ACTIVITY', mobile ? 21 : 39, mobile ? 26 : 39, mobile ? 12 : 17, '#c1def6', 'letter-spacing="2.1"');
  ui += text('最近参与 · 累计贡献', mobile ? 20 : 38, mobile ? 56 : 77, mobile ? 22 : 29, '#fffaf0', 'font-weight="700"');
  ui += text('仓库', mobile ? 35 : 67, headerY, mobile ? 11.5 : 12, '#75828d');
  ['代码提交', '发起 PR', '已合并 PR'].forEach((label, i) => {
    ui += text(label, columns[i], headerY, mobile ? 10.5 : 11.8, ['#3877bd', '#5d6f7e', '#368268'][i], 'text-anchor="middle"');
  });
  rows.forEach((row, i) => {
    const y = firstY + i * rowHeight;
    const title = LABELS.get(row.repository) || row.repository.split('/').at(-1);
    const x = mobile ? 35 : 67;
    const end = mobile ? 406 : 667;
    ui += `<rect x="${mobile ? 23 : 40}" y="${y - 2}" width="${mobile ? 385 : 628}" height="${rowHeight - 5}" rx="5" fill="${i % 2 ? '#edf4f8' : '#fffdf5'}" opacity="0.58"/>`;
    if (!mobile) ui += branch(46, y + 7, '#6690a8', 13);
    ui += text(title, x, y + 17, mobile ? 16 : 17, '#223b54', 'font-weight="700"');
    ui += text(row.repository, x, y + 31, mobile ? 8.5 : 10.2, '#73818a');
    ['commits', 'opened', 'merged'].forEach((key, j) => {
      ui += text(row[key], columns[j], y + 24, mobile ? 20 : 21, ['#2672c6', '#30465e', '#267b60'][j], 'font-weight="700" text-anchor="middle"');
    });
    ui += `<path d="M${mobile ? 30 : 44} ${y + rowHeight - 5}H${end}" stroke="#b5b4a2" stroke-width="0.5" opacity="0.34"/>`;
  });
  if (mobile) {
    ui += '<rect x="22" y="458" width="235" height="65" rx="5" fill="#fffdf2" opacity="0.88"/>';
    ui += text('累计贡献，不限时间', 28, 480, 12, '#64777f');
    ui += text('默认分支提交 · 本人 PR', 28, 500, 10, '#7c898d');
    ui += text('展开下方明细可查看记录', 28, 516, 9, '#7c898d');
  } else {
    ui += '<rect x="40" y="460" width="595" height="40" rx="5" fill="#fffdf2" opacity="0.86"/>';
    ui += text('按最近参与排序 · 累计贡献，不限时间', 47, 475, 11.3, '#6d7d86');
    ui += text('默认分支提交 · 本人发起及已合并 PR', 47, 493, 10.3, '#859197');
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <defs><clipPath id="panel"><rect width="${width}" height="${height}" rx="12"/></clipPath><linearGradient id="hero-shade"><stop offset="0" stop-color="#081b36" stop-opacity="0.75"/><stop offset="1" stop-color="#081b36" stop-opacity="0"/></linearGradient></defs>
    <g clip-path="url(#panel)" font-family="Noto Sans SC">${artwork}${ui}${decorations(mobile, frame)}</g>
  </svg>`;
}

export function stableIndexedFrame(pixels, palette, base) {
  const indexed = applyPalette(pixels, palette);
  if (base) {
    // gifenc caches nearest colors by RGB565 bucket. The first pixel seen
    // in a bucket can change with animation, slightly recoloring static text.
    // Preserve the first frame's index for every unchanged RGBA pixel.
    for (let i = 0; i < indexed.length; i++) {
      const j = i * 4;
      if (pixels[j] === base.pixels[j] && pixels[j + 1] === base.pixels[j + 1] && pixels[j + 2] === base.pixels[j + 2] && pixels[j + 3] === base.pixels[j + 3]) indexed[i] = base.indexed[i];
    }
  }
  return indexed;
}

export function renderActivity(rows) {
  const fonts = ['Regular', 'Bold'].map(weight => `${ROOT}fonts/NotoSansSC-${weight}.ttf`);
  const dataUri = `data:image/jpeg;base64,${readFileSync(`${ROOT}background.jpg`).toString('base64')}`;
  const font = { fontFiles: fonts, loadSystemFonts: false, defaultFontFamily: 'Noto Sans SC' };
  for (const mobile of [false, true]) {
    const name = mobile ? 'mobile' : 'desktop';
    const gif = GIFEncoder();
    let palette;
    let previous;
    let base;
    for (let frame = 0; frame < FRAMES; frame++) {
      const image = new Resvg(activitySvg(rows, mobile, frame, dataUri), { font, background: '#ffffff' }).render();
      const pixels = image.pixels;
      if (frame === 0) {
        writeFileSync(`${ROOT}${name}.png`, image.asPng());
        palette = quantize(pixels, 255);
      }
      const current = stableIndexedFrame(pixels, palette, base);
      if (frame === 0) base = { pixels, indexed: current };
      // A shared palette and transparent deltas keep text completely still,
      // avoid palette flicker and greatly reduce the looping GIF's file size.
      const delta = current.slice();
      if (previous) for (let i = 0; i < delta.length; i++) if (current[i] === previous[i]) delta[i] = 255;
      const globalPalette = palette.concat(Array.from({ length: 256 - palette.length }, () => [0, 0, 0]));
      gif.writeFrame(delta, image.width, image.height, {
        ...(frame === 0 ? { palette: globalPalette } : {}),
        delay: 125, repeat: 0, dispose: 1,
        transparent: frame > 0, transparentIndex: 255,
      });
      previous = current;
    }
    gif.finish();
    writeFileSync(`${ROOT}${name}.gif`, gif.bytes());
    console.log(`Rendered ${name}: ${(gif.bytes().length / 1024).toFixed(0)} KB, ${FRAMES} frames`);
  }
  writeFileSync(`${ROOT}render-state.json`, JSON.stringify({ signature: renderSignature(rows) }, null, 2) + '\n');
}

export function activityAssetsExist() {
  return ['desktop.gif', 'desktop.png', 'mobile.gif', 'mobile.png'].every(name => existsSync(`${ROOT}${name}`));
}

export function renderSignature(rows) {
  const hash = createHash('sha256').update(JSON.stringify(rows));
  hash.update(readFileSync(fileURLToPath(import.meta.url), 'utf8').replace(/\r\n/g, '\n'));
  for (const path of [`${ROOT}background.jpg`, `${ROOT}fonts/NotoSansSC-Regular.ttf`, `${ROOT}fonts/NotoSansSC-Bold.ttf`]) {
    hash.update(readFileSync(path));
  }
  return hash.digest('hex');
}

export function activityArtworkCurrent(rows) {
  if (!activityAssetsExist() || !existsSync(`${ROOT}render-state.json`)) return false;
  return JSON.parse(readFileSync(`${ROOT}render-state.json`, 'utf8')).signature === renderSignature(rows);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  renderActivity(JSON.parse(readFileSync(`${ROOT}data.json`, 'utf8')));
}
