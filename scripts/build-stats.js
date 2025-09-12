import { updateStateStatistics } from 'generateStateStats';
import { updateAgencyStatistics } from 'generateAgencyStats';

async function generateAllStats() {
  try {
    await updateStateStatistics();
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
