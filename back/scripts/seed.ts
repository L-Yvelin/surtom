import 'dotenv/config';
import { db } from '../src/db/client.js';
import { player, world } from '../src/db/schema.js';
import pool from '../src/repositories/pool.js';

const DEFAULT_WORLDS = [
  { id: 'fr', displayName: 'Français', language: 'fr' },
  { id: 'en', displayName: 'English', language: 'en' },
];

const SYSTEM_PLAYERS = [
  'System',
  'Surtomien',
  'Cracotto',
  'Marmeluche',
  'Ziboulette',
  'Bidulette',
  'Farfelucho',
  'Patacroute',
  'Zozo',
  'Frimousse',
  'Zigzag',
  'Turlututu',
  'Bouboule',
  'Cacahuete',
  'ChocoBrioche',
  'Roudoudou',
  'Cornichon',
  'Choupette',
  'Bibop',
  'Tornade',
  'Cocorico',
  'Biscotto',
  'Frisottis',
  'Barbapapa',
  'Rigolito',
  'Loufoquet',
  'Gribouille',
  'Papouille',
];

async function seedWorlds(): Promise<void> {
  console.log(`Seeding ${DEFAULT_WORLDS.length} default world(s)...`);
  await db
    .insert(world)
    .values(DEFAULT_WORLDS)
    .onDuplicateKeyUpdate({
      set: { id: world.id },
    });
}

async function seedSystemPlayers(): Promise<void> {
  console.log(`Seeding ${SYSTEM_PLAYERS.length} system/funny-name player(s)...`);
  const rows = SYSTEM_PLAYERS.map((username) => ({
    username,
    password: '-1',
    isBanned: 1,
  }));
  await db
    .insert(player)
    .values(rows)
    .onDuplicateKeyUpdate({
      set: { username: player.username },
    });
}

async function main(): Promise<void> {
  await seedWorlds();
  await seedSystemPlayers();
  console.log('\nBase seed complete.');
  console.log('Word lists are seeded separately via:');
  console.log('  npm run db:seed:words -- --lang fr --lang-file ... --dict ... --apply');
  await pool.end();
}

main().catch(async (err) => {
  console.error('Seed failed:', err);
  await pool.end().catch(() => {});
  process.exit(1);
});
