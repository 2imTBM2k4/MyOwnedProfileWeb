import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import ts from 'typescript';

const path = new URL('../src/lib/admin-auth.ts', import.meta.url);
let auth = {};
if (existsSync(path)) {
  const { outputText } = ts.transpileModule(readFileSync(path, 'utf8'), { compilerOptions: { module: ts.ModuleKind.ES2022 } });
  auth = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);
}
assert.equal(typeof auth.createAdminToken, 'function', 'Privileged writes must require a signed token');
const secret = 'test-password-only';
const now = 1800000000000;
const token = await auth.createAdminToken(secret, now);
assert.equal(await auth.verifyAdminToken(token, secret, now), true);
assert.equal(await auth.verifyAdminToken(token, secret, now + 24 * 60 * 60 * 1000), false);
assert.equal(await auth.verifyAdminToken(token, 'wrong-secret', now), false);
assert.equal(await auth.verifyAdminToken(token + '0', secret, now), false);
assert.equal(await auth.verifyAdminToken('9999999999999.' + token.split('.')[1], secret, now), false);
for (const value of [undefined, '', 'forged', '12345.zz', '123.00.extra']) {
  assert.equal(await auth.verifyAdminToken(value, secret, now), false);
}
assert.equal(await auth.verifyAdminToken(token, '', now), false);
console.log('PASS: signed admin token, expiry, wrong password, tampered expiry/signature, malformed/absent token, missing server password');
