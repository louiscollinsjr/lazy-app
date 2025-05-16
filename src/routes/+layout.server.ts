import type { LayoutServerLoad } from './$types';
import { supabase } from '$lib/supabaseClient';

export const load: LayoutServerLoad = async () => {
  // The session will be handled on the client side
  // Just return a placeholder for now
  return {
    session: null,
    user: null
  };
};
