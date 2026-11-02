import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createApp } from '../src/app.js';

let app, base, jar, dataDir;
before(async () => {
  dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'demo-'));
  app = createApp({ dataDir, env: { DEMO_MODE: 'true' } });
  base = `http://127.0.0.1:${await app.start(0)}`;
});
after(async () => {
  await app.stop();
  fs.rmSync(dataDir, { recursive: true, force: true });
});
async function call(p, { method = 'GET', body, auth = true } = {}) {
  const res = await fetch(base + p, { method, headers: { ...(body !== undefined ? { 'content-type': 'application/json' } : {}), ...(auth && jar ? { cookie: jar } : {}) }, body: body !== undefined ? JSON.stringify(body) : undefined });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = text; }
  return { status: res.status, body: json, headers: res.headers };
}
async function signIn() {
  const s = await call('/api/session', { auth: false });
  assert.deepEqual(s.body.demo, { password: 'demo1234', resetMinutes: 60 });
  assert.equal(s.body.needsSetup, false, 'the demo is ready to use');
  assert.equal((await call('/api/setup', { method: 'POST', body: { password: 'takeover-123' }, auth: false })).status, 403);
  const r = await call('/api/login', { method: 'POST', body: { password: 'demo1234' }, auth: false });
  assert.equal(r.status, 200);
  jar = r.headers.get('set-cookie').split(';')[0];
  assert.equal((await call('/api/password', { method: 'POST', body: { current: 'demo1234', next: 'changed-pass-1' } })).status, 403);
}

test('demo: a working public guide with listings and reviews', async () => {
  await signIn();
  let html = await (await fetch(base + '/')).text();
  assert.match(html, /دليل المعادي/);
  const l = app.data.listings[0];
  const page = await fetch(base + '/l/' + l.slug);
  assert.equal(page.status, 200);
  assert.match(await page.text(), /كافيه النيل/);
  let r = await call('/api/overview');
  assert.equal(r.status, 200);
  r = await call('/api/reviews');
  assert.ok(r.body.reviews.some((x) => x.status === 'pending'));
  assert.equal((await fetch(base + '/demo.js')).status, 200);
});
