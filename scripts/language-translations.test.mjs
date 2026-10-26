import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

const source = readFileSync(new URL('../src/data/translations.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ES2022 } });
const { TRANSLATIONS, CATEGORY_ORDER } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);

assert.ok(TRANSLATIONS.vi, 'Vietnamese translations must exist');
assert.ok(TRANSLATIONS.en, 'English translations must exist');

function compareKeys(objA, objB, path = '') {
  const keysA = Object.keys(objA).sort();
  const keysB = Object.keys(objB).sort();
  assert.deepEqual(keysA, keysB, `Key mismatch at ${path || 'root'}`);

  for (const key of keysA) {
    const valA = objA[key];
    const valB = objB[key];
    const currentPath = path ? `${path}.${key}` : key;
    assert.equal(typeof valA, typeof valB, `Type mismatch at ${currentPath}`);

    if (typeof valA === 'object' && valA !== null) {
      if (Array.isArray(valA)) {
        assert.ok(Array.isArray(valB), `Array mismatch at ${currentPath}`);
        assert.equal(valA.length, valB.length, `Array length mismatch at ${currentPath}`);
        valA.forEach((item, idx) => {
          assert.equal(typeof item, 'string', `Array item not string at ${currentPath}[${idx}]`);
          assert.ok(item.length > 0, `Empty string at ${currentPath}[${idx}]`);
        });
      } else {
        compareKeys(valA, valB, currentPath);
      }
    } else if (typeof valA === 'string') {
      assert.ok(valA.trim().length > 0, `Empty string at ${currentPath} (vi)`);
      assert.ok(valB.trim().length > 0, `Empty string at ${currentPath} (en)`);
    }
  }
}

compareKeys(TRANSLATIONS.vi, TRANSLATIONS.en);

assert.equal(CATEGORY_ORDER.keyboard, 1);
assert.equal(CATEGORY_ORDER.mouse, 2);
assert.equal(CATEGORY_ORDER.phone, 10);

console.log('PASS: translations integrity, structure symmetry, and category order');
