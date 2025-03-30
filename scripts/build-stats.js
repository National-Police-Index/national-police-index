require('dotenv').config({ path: '.env.local' });

require('ts-node').register({
  compilerOptions: {
    module: 'commonjs',
    moduleResolution: 'node'
  }
});

const { updateStateStatistics } = require('./generateStateStats.ts');
const { updateAgencyStatistics } = require('./generateAgencyStats.ts');

async function generateAllStats() {
  try {
    console.log('Starting state statistics generation...');
    await updateStateStatistics();
    console.log('Successfully generated state statistics');

    console.log('\nStarting agency statistics generation...');
    await updateAgencyStatistics();
    console.log('Successfully generated agency statistics');
  } catch (error) {
    console.error('Error generating statistics:', error);
    process.exit(1);
  }
}

generateAllStats()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
