<script lang="ts">
  import '../app.css';
  import { onMount } from 'svelte';
  import Navbar from '$lib/components/Navbar.svelte';
  import Sidebar from '$lib/components/Sidebar.svelte';
  import { supabase } from '$lib/supabaseClient';
  import { page } from '$app/stores';
  import { session as sessionStore, user as userStore } from '$lib/stores/auth';
  import { isSidebarOpen } from '$lib/stores/uiStore';
  
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
  
  <div class="flex flex-grow">
    <!-- Sidebar -->
    <Sidebar />
    
    <!-- Main Content -->
    <main class="flex-grow transition-all duration-300 ease-in-out" 
          class:ml-64={$isSidebarOpen} 
          class:ml-0={!$isSidebarOpen}>
      {@render children({ data: enhancedData })}
    </main>
  </div>
</div>
