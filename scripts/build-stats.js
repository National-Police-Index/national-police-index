require('dotenv').config({ path: '.env.local' });

require('ts-node').register({
  compilerOptions: {
    module: 'commonjs',
    moduleResolution: 'node'
  }
});

const { updateStateStatistics } = require('./generateStateStats.ts');

updateStateStatistics()
  .then(() => {
    console.log('Successfully generated state statistics');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to generate state statistics:', error);
    process.exit(1);
  });
