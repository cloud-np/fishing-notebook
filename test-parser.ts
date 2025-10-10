import { fetchErmoupoliFishingInfo } from './src/actions/libs/parser/parse-fishing-info';

async function test() {
  try {
    const testDate = new Date('2025-10-09');
    console.log('Fetching fishing info for Ermoupoli on', testDate.toISOString());

    const data = await fetchErmoupoliFishingInfo(testDate);

    console.log('\n=== BAROMETRIC PRESSURE DATA ===\n');
    console.log('Ascending Barometer:');
    console.log('  Text:', data.barometers.ascending.text);
    console.log('  Attributes:', data.barometers.ascending.attributes);

    console.log('\nStable Barometer:');
    console.log('  Text:', data.barometers.stable.text);
    console.log('  Attributes:', data.barometers.stable.attributes);

    console.log('\nDescending Barometer:');
    console.log('  Text:', data.barometers.descending.text);
    console.log('  Attributes:', data.barometers.descending.attributes);

  } catch (error) {
    console.error('Error:', error);
  }
}

test();
