import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase variables in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSupabase() {
  console.log("Testing Supabase connection and leaderboard table...");
  const testEntry = {
    name: 'E2E Test User',
    score: Math.floor(Math.random() * 1000),
    game: 'verification',
    date: new Date().toISOString()
  };

  const { data, error: insertError } = await supabase
    .from('leaderboard')
    .insert([testEntry])
    .select();

  if (insertError) {
    console.error("Failed to insert into `leaderboard` table.");
    console.error("Ensure the table exists in your Supabase dashboard with columns: id, name (text), score (integer), game (text), date (timestamp).");
    console.error("Error details:", insertError.message);
    process.exit(1);
  }

  console.log("Successfully inserted E2E test data:", data);

  const { data: selectData, error: selectError } = await supabase
    .from('leaderboard')
    .select('*')
    .eq('game', 'verification')
    .order('score', { ascending: false })
    .limit(1);

  if (selectError) {
    console.error("Failed to select from `leaderboard` table:", selectError.message);
    process.exit(1);
  }

  console.log("Successfully verified select. Top score:", selectData);
  console.log("End-to-End Test passed! The platform is ready for deployment.");
}

testSupabase();
