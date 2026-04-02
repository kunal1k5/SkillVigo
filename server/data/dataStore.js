import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import seedData from './seedData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, 'db.json');

let writeQueue = Promise.resolve();

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

async function ensureDatabaseFile() {
  try {
    await fs.access(DB_PATH);
  } catch {
    await fs.mkdir(__dirname, { recursive: true });
    await fs.writeFile(DB_PATH, JSON.stringify(seedData, null, 2), 'utf-8');
  }
}

export async function readDatabase() {
  await ensureDatabaseFile();
  const raw = await fs.readFile(DB_PATH, 'utf-8');
  return JSON.parse(raw);
}

export async function writeDatabase(nextData) {
  await ensureDatabaseFile();
  writeQueue = writeQueue.then(() =>
    fs.writeFile(DB_PATH, JSON.stringify(nextData, null, 2), 'utf-8'),
  );
  await writeQueue;
  return clone(nextData);
}

export async function updateDatabase(updater) {
  const currentData = await readDatabase();
  const nextData = (await updater(clone(currentData))) || currentData;
  return writeDatabase(nextData);
}

export function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
