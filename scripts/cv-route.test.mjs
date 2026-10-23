import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

function moduleUrl(source) {
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ES2022 } });
  return `data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`;
}
const cv = moduleUrl(readFileSync(new URL('../src/lib/cv.ts', import.meta.url), 'utf8'));
let stored = null;
let failure = false;
let uploadCalls = 0;
const storage = {
  list: async () => ({ data: stored ? [{ name: 'cv.pdf' }] : [{ name: 'cv.pdf.old' }], error: failure ? { message: 'unavailable' } : null }),
  upload: async (name, file) => {
    uploadCalls++;
    if (failure) return { error: { message: 'unavailable' } };
    stored = new Blob([await file.arrayBuffer()]);
    return { error: null };
  },
  download: async () => ({ data: stored, error: failure ? { message: 'unavailable', statusCode: 500 } : stored ? null : { message: 'Object not found', statusCode: 404 } }),
};
// Storage is external: substitute its boundary while executing the real route and validator.
globalThis.__cvTestClient = { storage: { from: () => storage } };
const source = readFileSync(new URL('../src/app/api/cv/route.ts', import.meta.url), 'utf8')
  .replace('import { NextResponse } from "next/server";', 'const NextResponse = Response;')
  .replace('import { getSupabaseAdminClient } from "@/lib/supabase-admin";', 'const getSupabaseAdminClient = () => globalThis.__cvTestClient;')
  .replace('"@/lib/cv"', JSON.stringify(cv));
const route = await import(moduleUrl(source));
const post = file => {
  const form = new FormData();
  if (file !== undefined) form.append('file', file);
  return route.POST(new Request('http://test/api/cv', { method: 'POST', body: form }));
};
assert.equal((await route.HEAD()).status, 404, 'Similar filenames must not claim a CV exists');
assert.equal((await route.GET()).status, 404);
assert.equal((await post()).status, 400);
assert.equal((await post('not a file')).status, 400);
assert.equal((await post(new File(['forged'], 'cv.pdf', { type: 'application/pdf' }))).status, 400);
assert.equal(uploadCalls, 0, 'Invalid files must never reach storage');
const file = new File(['%PDF-1.7\noriginal content'], 'cv.pdf', { type: 'application/pdf' });
assert.equal((await post(file)).status, 201);
assert.equal((await route.HEAD()).status, 200);
const download = await route.GET();
assert.equal(download.status, 200);
assert.equal(download.headers.get('content-type'), 'application/pdf');
assert.match(download.headers.get('content-disposition'), /^attachment;/);
assert.equal(download.headers.get('cache-control'), 'no-store');
assert.equal(await download.text(), await file.text());
failure = true;
assert.equal((await route.HEAD()).status, 503);
assert.equal((await route.GET()).status, 503);
assert.equal((await post(new File(['%PDF-1.7\nreplacement'], 'cv.pdf', { type: 'application/pdf' }))).status, 503);
failure = false;
assert.equal(await (await route.GET()).text(), await file.text(), 'Failed replacement must retain previous CV');
delete globalThis.__cvTestClient;
console.log('PASS: missing CV, exact filename, missing/forged file, valid upload/download bytes and headers, storage outage, previous CV retained after failed replacement');
