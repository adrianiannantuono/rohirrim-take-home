import Database from 'better-sqlite3';

// Initialize the SQLite database
const db = new Database('database.sqlite');

// Create a "robotPosition" table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS robotPosition (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    x INTEGER NOT NULL,
    y INTEGER NOT NULL,
    direction TEXT NOT NULL
  )
`);

export async function GET(request: Request) {
  // Fetch the most recent robot position from the database
  const stmt = db.prepare('SELECT * FROM robotPosition ORDER BY id DESC LIMIT 100');
  const position = stmt.all();

  return new Response(JSON.stringify(position), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
