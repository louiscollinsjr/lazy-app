<script lang="ts">
  import '../app.css';
  import { onMount } from 'svelte';
  import Navbar from '$lib/components/Navbar.svelte';
  import { supabase } from '$lib/supabaseClient';
  import { page } from '$app/stores';
  import { session as sessionStore, user as userStore } from '$lib/stores/auth';
  
  let { children } = $props();
  let sessionLoaded = $state(false);

  // Initialize session from Supabase
  onMount(async () => {
    // Get the current session
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      sessionStore.set(data.session);
      userStore.set(data.session.user);
    }
    sessionLoaded = true;

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        if (newSession) {
          sessionStore.set(newSession);
          userStore.set(newSession.user);
        } else {
          sessionStore.set(null);
          userStore.set(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  });

  // Make session available to all pages via page data
  const enhancedData = $derived({ 
    ...($page.data || {}),
    session: $sessionStore,
    user: $userStore
  });
</script>

<div class="min-h-screen flex flex-col bg-white">
  <Navbar />
  <main class="flex-grow">
    {@render children({ data: enhancedData })}
  </main>
</div>
