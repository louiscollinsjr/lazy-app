import type { LayoutServerLoad } from './$types';
import { createClient } from '@supabase/supabase-js';

export const load: LayoutServerLoad = async ({ cookies }) => {
  // Optionally, you can use cookies to get the session
  // For now, just return null; client will handle session
  return { session: null };
};
