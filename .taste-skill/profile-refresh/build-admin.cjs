// Keep verification output separate from the user's running development server.
async function run() {
  const load = require('next/dist/server/config').default;
  const { PHASE_PRODUCTION_BUILD } = require('next/constants');
  const config = await load(PHASE_PRODUCTION_BUILD, process.cwd());
  process.env.__NEXT_PRIVATE_STANDALONE_CONFIG = JSON.stringify({ ...config, distDir: '.next-admin-build' });
  const configModule = require.resolve('next/dist/server/config');
  require.cache[configModule].exports = {
    __esModule: true,
    ...require(configModule),
    default: async (...args) => ({ ...await load(...args), generateBuildId: config.generateBuildId }),
  };
  await require('next/dist/build').default(process.cwd());
}
run().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
