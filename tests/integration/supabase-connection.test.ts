import { createClient } from '@supabase/supabase-js';
import { describe, it, expect } from 'vitest';

// You must set these environment variables in your test environment for this test to work
// Use proper VITE-prefixed environment variables
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

describe('Supabase integration', () => {
  it('should connect and fetch data from Supabase', async () => {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw new Error('SUPABASE_URL or SUPABASE_ANON_KEY not set in environment');
    }
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    // Try to fetch from a known public table, e.g., profiles (adjust as needed)
    const { data, error } = await supabase.from('profiles').select('*').limit(1);
    expect(error).toBeNull();
    expect(data).toBeDefined();
    // Optionally, check for at least one row if you expect data
    // expect(data.length).toBeGreaterThan(0);
  });
});
