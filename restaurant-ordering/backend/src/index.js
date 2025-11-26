const persistentStore = require('../src/utils/persistentStore');

async function bootstrap() {
  await persistentStore.init();
  require('./server');
}

bootstrap().catch((error) => {
  console.error('Failed to bootstrap backend:', error);
  process.exit(1);
});

