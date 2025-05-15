<script lang="ts">
  import { page } from '$app/stores';
  import { session, user } from '$lib/stores/auth';
  import { supabase } from '$lib/supabaseClient';
  import { Button } from '$lib/components/ui/button';
  import { goto } from '$app/navigation';
  import AnnouncementBar from '$lib/components/AnnouncementBar.svelte';

  async function handleLogout() {
    await supabase.auth.signOut()
    $session = null;
    $user = null;
    goto('/');
  }

</script>

<nav class="bg-gray-50 fixed w-full top-0 z-50 flex flex-col">
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
        />
      </div>
      
      <!-- Right: Login/Logout -->
      <div class="min-w-max">
        {#if $user}
          <Button variant="outline" size="sm" on:click={handleLogout} class="rounded-full">Logout</Button>
        {:else}
          <a href="/login">
            <Button class="rounded-lg bg-black hover:bg-gray-900 border-none text-white shadow-none px-4 py-2 text-sm font-medium tracking-wider">Log in or sign up</Button>
          </a>
        {/if}
      </div>
    </div>
  </div>
</nav>
<div class="h-16"></div>

