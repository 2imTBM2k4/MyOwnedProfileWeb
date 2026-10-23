import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import ts from 'typescript';

async function load(path) {
  const url = new URL(path, import.meta.url);
  if (!existsSync(url)) return {};
  const { outputText } = ts.transpileModule(readFileSync(url, 'utf8'), { compilerOptions: { module: ts.ModuleKind.ES2022 } });
  return import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);
}

const { sortRows } = await load('../src/lib/admin-sort.ts');
assert.equal(typeof sortRows, 'function', 'Admin tables need value-aware sorting');
const rows = [{ id: 'empty', value: null }, { id: 'ten', value: 'Item 10' }, { id: 'two', value: 'item 2' }, { id: 'blank', value: '' }];
assert.deepEqual(sortRows(rows, 'value', 'asc').map(x => x.id), ['two', 'ten', 'empty', 'blank']);
assert.deepEqual(sortRows(rows, 'value', 'desc').map(x => x.id), ['ten', 'two', 'empty', 'blank']);
assert.deepEqual(rows.map(x => x.id), ['empty', 'ten', 'two', 'blank']);
assert.deepEqual(sortRows([{ n: 10 }, { n: 0 }, { n: 2 }, { n: null }], 'n', 'asc').map(x => x.n), [0, 2, 10, null]);
assert.deepEqual(sortRows([{ n: 10 }, { n: 0 }, { n: 2 }, { n: null }], 'n', 'desc').map(x => x.n), [10, 2, 0, null]);
assert.deepEqual(sortRows([{ n: ['Node.js'] }, { n: ['Docker'] }], 'n', 'asc').map(x => x.n), [['Docker'], ['Node.js']]);
assert.deepEqual(sortRows([{ n: false }, { n: true }], 'n', 'desc').map(x => x.n), [true, false]);
assert.deepEqual(sortRows([{ id: 'a', n: 'same' }, { id: 'b', n: 'Same' }], 'n', 'asc').map(x => x.id), ['a', 'b']);
assert.deepEqual(sortRows([], 'n', 'asc'), []);
assert.equal(sortRows(rows, null, 'asc'), rows);
console.log('PASS: sorting numbers, natural text, arrays, booleans, empty values last, stable order, unchanged input');

const { validateCv } = await load('../src/lib/cv.ts');
assert.equal(typeof validateCv, 'function', 'CV uploads must validate the file before storage');
assert.equal(await validateCv(new File(['%PDF-1.7\ncontent'], 'cv.pdf', { type: 'application/pdf' })), null);
assert.equal(await validateCv(new File(['%PDF-1.7\ncontent'], 'CV.PDF', { type: '' })), null);
assert.ok(await validateCv(new File(['not a PDF'], 'cv.pdf', { type: 'application/pdf' })));
assert.ok(await validateCv(new File(['%PDF-1.7'], 'cv.html', { type: 'text/html' })));
assert.ok(await validateCv(new File(['%PDF-1.7'], 'cv.pdf', { type: 'text/html' })));
assert.ok(await validateCv(new File([], 'cv.pdf', { type: 'application/pdf' })));
assert.ok(await validateCv(new File(['%PDF-', new Uint8Array(4 * 1024 * 1024)], 'cv.pdf', { type: 'application/pdf' })));
assert.equal(await validateCv(new File(['%PDF-', new Uint8Array(4 * 1024 * 1024 - 5)], 'cv.pdf', { type: 'application/pdf' })), null);
console.log('PASS: valid PDF, uppercase extension, empty MIME, forged PDF, wrong extension/MIME, empty/oversized file, exact size limit');
