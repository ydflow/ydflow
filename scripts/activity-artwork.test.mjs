import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Resvg } from '@resvg/resvg-js';
import { activitySvg, stableIndexedFrame } from './render-activity.mjs';

const rows = [{ repository: 'ydflow/research-trail', commits: 201, opened: 34, merged: 34 }];
const root = new URL('../assets/activity/', import.meta.url);
const font = { loadSystemFonts: false, defaultFontFamily: 'Noto Sans SC', fontFiles: ['Regular', 'Bold'].map(weight => new URL(`fonts/NotoSansSC-${weight}.ttf`, root).pathname.replace(/^\/([A-Z]:)/, '$1')) };

test('desktop and mobile panels have compact dimensions and preserve contribution data', () => {
  assert.match(activitySvg(rows), /width="960" height="520"/);
  assert.match(activitySvg(rows, true), /width="420" height="530"/);
  assert.match(activitySvg(rows), />201<\/text>/);
  assert.match(activitySvg(rows, true), /累计贡献，不限时间/);
  assert.throws(() => activitySvg(Array(8).fill(rows[0])), /at most seven/);
});

test('animation changes decoration without moving or modifying contribution text', () => {
  const plainText = svg => [...svg.matchAll(/<text[^>]*>.*?<\/text>/g)].map(match => match[0]);
  assert.deepEqual(plainText(activitySvg(rows, false, 0)), plainText(activitySvg(rows, false, 16)));
  for (const mobile of [false, true]) {
    const start = new Resvg(activitySvg(rows, mobile, 0), { font }).render();
    const later = new Resvg(activitySvg(rows, mobile, 8), { font }).render();
    const [left, right, top, bottom] = mobile ? [25, 405, 92, 440] : [40, 670, 135, 454];
    const first = start.pixels;
    const second = later.pixels;
    for (let y = top; y < bottom; y++) {
      const offset = (y * start.width + left) * 4;
      assert.deepEqual(first.subarray(offset, offset + (right - left) * 4), second.subarray(offset, offset + (right - left) * 4));
    }
    assert.notDeepEqual(first, second, 'decorative glints and petals should actually animate');
  }
});

test('GIF palette mapping preserves indices for identical text pixels despite nearby animated colors', () => {
  const palette = [[152, 172, 204], [157, 171, 188], [255, 255, 255]];
  const first = Uint8Array.from([157, 171, 188, 255, 152, 172, 204, 255]);
  const indexed = stableIndexedFrame(first, palette);
  const later = Uint8Array.from([153, 171, 199, 255, 152, 172, 204, 255]);
  const stable = stableIndexedFrame(later, palette, { pixels: first, indexed });
  assert.equal(stable[1], indexed[1]);
});
