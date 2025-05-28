<script lang="ts">
  import '../app.css';
  import { onMount } from 'svelte';
  import Navbar from '$lib/components/Navbar.svelte';
  import Sidebar from '$lib/components/Sidebar.svelte';
  import { supabase } from '$lib/supabaseClient';
  import { page } from '$app/stores';
  import { session as sessionStore, user as userStore } from '$lib/stores/auth';
  import { isSidebarOpen, updateScrollPosition, toggleSidebar } from '$lib/stores/uiStore';
  
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
    
    // Set up scroll tracking
    function handleScroll() {
      updateScrollPosition(window.scrollY);
    }
    
    // Initialize with current scroll position
    updateScrollPosition(window.scrollY);
    
    // Add scroll event listener
    window.addEventListener('scroll', handleScroll, { passive: true });

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
      window.removeEventListener('scroll', handleScroll);
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
  <!-- Fixed Navbar at top -->
  <Navbar />
  
  <!-- Fixed sidebar that never scrolls -->
  <div class="fixed top-16 left-0 bottom-0 z-10 transition-all duration-300 ease-in-out"
       class:w-64={$isSidebarOpen}
       class:w-0={!$isSidebarOpen}>
    <Sidebar />
  </div>
  
  <!-- Main content with its own scroll area, pushed right when sidebar is open -->
  <div class="flex-grow pt-4 transition-all duration-300 ease-in-out"
       class:ml-64={$isSidebarOpen}
       class:ml-0={!$isSidebarOpen}>
    <main class="max-w-screen-2xl w-full mx-auto px-0 sm:px-0 lg:px-0 pb-12">
      {@render children({ data: enhancedData })}
    </main>
  </div>
</div>
