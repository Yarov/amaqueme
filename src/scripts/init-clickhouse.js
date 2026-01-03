import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { initClickHouseSchema } from '../lib/clickhouse.js';

// Load .env file manually
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '..', '..', '.env');

try {
  const envFile = readFileSync(envPath, 'utf-8');
  envFile.split('\n').forEach(line => {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const [key, ...valueParts] = trimmedLine.split('=');
      const value = valueParts.join('=');
      if (key && value) {
        process.env[key.trim()] = value.trim();
      }
    }
  });
  console.log('✅ Environment variables loaded');
  console.log(`📍 ClickHouse URL: ${process.env.CLICKHOUSE_URL || process.env.CLICKHOUSE_HOST || 'not set'}`);
} catch (error) {
  console.warn('⚠️  Could not load .env file:', error.message);
}

async function main() {
  console.log('🚀 Initializing ClickHouse schema...');
  
  const success = await initClickHouseSchema();
  
  if (success) {
    console.log('✅ ClickHouse schema initialized successfully!');
    console.log('\nYou can now start tracking analytics.');
    console.log('\nUseful queries:');
    console.log('- Most viewed posts: getMostViewedPosts()');
    console.log('- Top categories: getTopCategories()');
    console.log('- Daily stats: getDailyStats()');
    process.exit(0);
  } else {
    console.error('❌ Failed to initialize ClickHouse schema');
    process.exit(1);
  }
}

main();
