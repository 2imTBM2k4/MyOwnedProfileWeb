const http = require('node:http');
async function run() {
  const dev = !process.argv.includes('--production');
  const config = await require('next/dist/server/config').default(dev ? 'phase-development-server' : 'phase-production-server', process.cwd());
  process.env.__NEXT_PRIVATE_STANDALONE_CONFIG = JSON.stringify({ ...config, distDir: dev ? '.next-admin-review' : '.next-admin-build' });
  const app = require('next')({ dev, dir: process.cwd(), port: 3100, hostname: '127.0.0.1' });
  await app.prepare();
  http.createServer(app.getRequestHandler()).listen(3100, '127.0.0.1', () => console.log('Admin preview: http://127.0.0.1:3100/admin'));
}
run().catch(error => { console.error(error); process.exitCode = 1; });
