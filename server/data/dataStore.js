import { existsSync } from 'fs';
import fs from 'fs/promises';
import path from 'path';
import seedData from './seedData.js';

function resolveDataDirectory() {
  const candidateDirectories = [
    path.resolve(process.cwd(), 'data'),
    path.resolve(process.cwd(), 'server', 'data'),
  ];

  for (const candidateDirectory of candidateDirectories) {
    if (existsSync(candidateDirectory)) {
      return candidateDirectory;
    }
  }

  // Serverless runtimes allow writes under /tmp only.
  return path.resolve('/tmp', 'skillvigo-data');
}

const DATA_DIR = resolveDataDirectory();
const DB_PATH = path.join(DATA_DIR, 'db.json');

let writeQueue = Promise.resolve();

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

async function ensureDatabaseFile() {
  try {
    await fs.access(DB_PATH);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
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
