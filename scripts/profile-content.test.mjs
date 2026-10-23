import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

const source = readFileSync(new URL('../src/lib/profile-content.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ES2022 } });
const { orderProjects, previewGears, publicUrl, isFeaturedTag, validPayload } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);

assert.equal(validPayload('projects', [null]), false);
assert.equal(validPayload('projects', [{ id: 'p', title: 'Test', tags: [null] }]), false);
assert.equal(validPayload('socialLinks', [{ id: 's', platform: 'Github', url: 12 }]), false);
assert.equal(validPayload('gears', [{ id: 'g', name: 'Gear', notes: {} }]), false);
assert.equal(validPayload('profile', { avatar_url: 12 }), false);
assert.equal(validPayload('profile', null), true);
assert.equal(validPayload('projects', [{ id: 'p', title: 'Test', tags: null }]), true);
assert.equal(validPayload('projects', []), true);

assert.equal(isFeaturedTag(' NỔI BẬT '), true);
assert.equal(isFeaturedTag('TypeScript'), false);
const projects = [{ id: 'ordinary', tags: null }, { id: 'featured', tags: ['Featured'] }, { id: 'next', tags: [] }];
assert.deepEqual(orderProjects(projects).map(p => p.id), ['featured', 'ordinary', 'next']);
assert.equal(projects[0].id, 'ordinary');
assert.deepEqual(orderProjects([]), []);
const gears = [
  { id: 'old', category: 'Keyboard', status: 'retired' },
  { id: 'phone', category: 'Phone', status: 'active' },
  { id: 'audio', category: 'IEM', status: 'active' },
  { id: 'keyboard', category: 'Keyboard', status: 'active' },
  { id: 'player', category: 'DAP', status: 'active' },
];
assert.deepEqual(previewGears(gears).map(g => g.id), ['keyboard', 'audio', 'player', 'phone']);
const manyGears = [...gears, ...['mouse', 'dac', 'monitor', 'other'].map(category => ({ id: category, category, status: 'active' }))];
assert.equal(previewGears(manyGears).length, 6);
assert.equal(previewGears(manyGears).every(g => g.status === 'active'), true);
assert.deepEqual(previewGears([gears[0]]), []);
assert.deepEqual(previewGears([gears[1]]).map(g => g.id), ['phone']);
assert.equal(publicUrl('silentboiz.vercel.app/'), 'https://silentboiz.vercel.app/');
assert.equal(publicUrl(' https://github.com/2imTBM2k4 '), 'https://github.com/2imTBM2k4');
for (const url of [null, '', 'javascript:alert(1)', 'data:text/html,hi', '/games', 'https://', 'https://user:pass@example.com']) {
  assert.equal(publicUrl(url), undefined, String(url));
}
console.log('PASS: project priority, stable ordering, active gear preview, empty collections and safe public URLs');
