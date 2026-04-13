import pg from 'pg';

// Supabase Database Connection String
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("❌ Missing DATABASE_URL.");
  console.error("Please run the script by passing your database connection string as an environment variable.");
  process.exit(1);
}

const client = new pg.Client({
  connectionString,
});

async function updateSchema() {
  try {
    console.log("Connecting to Supabase PostgreSQL database to patch schema...");
    await client.connect();

    console.log("Running ALTER TABLE to append 'game' column...");
    const query = `
      ALTER TABLE leaderboard 
      ADD COLUMN IF NOT EXISTS game TEXT DEFAULT 'unknown' NOT NULL;
    `;

    await client.query(query);
    console.log("✅ Success! The 'game' column has been successfully securely added to tracking stats.");

    // Verification
    const { rows } = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'leaderboard';
    `);

    console.log("Updated Table Schema:");
    console.table(rows);

  } catch (error) {
    console.error("❌ Error updating table:", error.message);
  } finally {
    await client.end();
  }
}

updateSchema();
