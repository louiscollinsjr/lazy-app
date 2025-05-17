<script lang="ts">
  import { page } from '$app/stores';
  import { session, user } from '$lib/stores/auth';
  import { supabase } from '$lib/supabaseClient';
  import { Button } from '$lib/components/ui/button';
  import { goto } from '$app/navigation';
  import { createEventDispatcher } from 'svelte';
  import AnnouncementBar from '$lib/components/AnnouncementBar.svelte';
  
  const dispatch = createEventDispatcher();

  async function handleLogout() {
    await supabase.auth.signOut()
    $session = null;
    $user = null;
    goto('/');
  }

</script>

<nav class="bg-white fixed w-full top-0 z-50 flex flex-col">
  <AnnouncementBar message="Announcement: Welcome to Lazy Money! 🚀" />
  <div class="w-full px-4 sm:px-6 lg:px-8">
    <div class="flex items-center justify-between h-24 w-full">
      <!-- Left: Logo -->
      <a href="/" class="font-bold text-sm font-geist min-w-max">**</a>
      
      <!-- Center: Search -->
      <div class="flex-1 flex justify-center mx-4">
        <input
          type="text"
          placeholder="Search Lazy Money"
          class="max-w-xs w-full px-4 py-2 rounded-lg border border-gray-200 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm text-gray-700 placeholder-gray-400 transition-all shadow-sm"
          on:input={(e) => {
            // Dispatch a custom 'search' event to the window
            window.dispatchEvent(new CustomEvent('search', { detail: e.target.value }))
          }}
        />
      </div>
      
      <!-- Right: Login/Logout -->
      <div class="min-w-max">
        {#if $user}
          <button on:click={handleLogout} class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition-colors">Logout</button>
        {:else}
          <a href="/login" class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-900 transition-colors tracking-wider">
            Log in or sign up
          </a>
        {/if}
      </div>
    </div>
  </div>
</nav>
<div class="h-16"></div>

