const prisma = require('./src/config/prisma');

async function main() {
  const techs = await prisma.technician.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      status: true,
      lastLat: true,
      lastLng: true,
      isTracking: true,
      lastPing: true
    }
  });
  
  console.log('\n=== Technicians in Database ===\n');
  techs.forEach((tech, i) => {
    console.log(`${i + 1}. ${tech.name} (${tech.email})`);
    console.log(`   ID: ${tech.id}`);
    console.log(`   Status: ${tech.status}`);
    console.log(`   Tracking: ${tech.isTracking ? 'Yes' : 'No'}`);
    console.log(`   Location: ${tech.lastLat ? `${tech.lastLat}, ${tech.lastLng}` : 'None'}`);
    console.log(`   Last Ping: ${tech.lastPing || 'Never'}`);
    console.log('');
  });
  
  console.log(`Total: ${techs.length} technicians\n`);
}

main()
  .catch(console.error)
  .finally(() => process.exit());
