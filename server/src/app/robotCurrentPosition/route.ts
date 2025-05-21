import Database from 'better-sqlite3';

// Initialize the SQLite database
const db = new Database('database.sqlite');

const gridSize = 5;

// Create a robotPosition table if it doesn't exist
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
  const stmt = db.prepare('SELECT * FROM robotPosition ORDER BY id DESC LIMIT 1');
  const position = stmt.get();

  if (!position) {
    return new Response(JSON.stringify({ error: 'Robot is not placed' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify(position), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function POST(request: Request) {
  // Parse the request body
  const body = await request.json();
  const { x, y, direction } = body;

  // Validate the body has the required fields
  if (x === undefined || y === undefined || !direction) {
    return new Response(JSON.stringify({ error: 'x, y, and direction are required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  // Validate the direction is one of the allowed values
  const allowedDirections = ['north', 'south', 'east', 'west'];
  if (!allowedDirections.includes(direction)) {
    return new Response(JSON.stringify({ error: 'Invalid direction' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  // Validate the x and y coordinates are numbers
  if (typeof x !== 'number' || typeof y !== 'number') {
    return new Response(JSON.stringify({ error: 'x and y must be numbers' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  // Validate the x and y coordinates are within the allowed range
  if (x < 0 || x >= gridSize || y < 0 || y >= gridSize) {
    return new Response(JSON.stringify({ error: 'x and y must be between 0 and 4' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Insert a new robot position into the database
  const stmt = db.prepare('INSERT INTO robotPosition (x, y, direction) VALUES (?, ?, ?)');
  const result = stmt.run(x, y, direction);

  const newPosition = { id: result.lastInsertRowid, x, y, direction };

  return new Response(JSON.stringify(newPosition), {
    status: 201,
    headers: { 'Content-Type': 'application/json' },
  });
}