<script lang="ts">
  import { page } from '$app/stores';
  import { session, user } from '$lib/stores/auth';
  import { supabase } from '$lib/supabaseClient';
  import { Button } from '$lib/components/ui/button';
  import { goto } from '$app/navigation';
  import { createEventDispatcher } from 'svelte';
  import { fade } from 'svelte/transition';
  import { isSidebarOpen, toggleSidebar, scrollY, sidebarClosedAtScrollY } from '$lib/stores/uiStore';
  import AnnouncementBar from '$lib/components/AnnouncementBar.svelte';

  const dispatch = createEventDispatcher();

  async function handleLogout() {
    await supabase.auth.signOut()
    $session = null;
    $user = null;
    goto('/');
  }

  function handleClickOutside(event) {
    const drawer = document.querySelector('.drawer-content');
    if (drawer && !drawer.contains(event.target) && 
        event.target.closest('button[aria-label="Toggle navigation"]') === null) {
      toggleSidebar(false);
    }
  }

  import { onMount } from 'svelte';
  onMount(() => {
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  });
</script>

<nav class="bg-white w-full z-50 flex flex-col transition-all duration-300 ease-in-out" 
     class:fixed={$isSidebarOpen || $scrollY < 60} 
     class:sticky={!$isSidebarOpen && $scrollY >= 60} 
     class:top-0={$isSidebarOpen || $scrollY < $sidebarClosedAtScrollY + 500}
     class:-top-16={!$isSidebarOpen && $scrollY >= $sidebarClosedAtScrollY + 500}>

  <!-- <AnnouncementBar message="Announcement: Welcome to Lazy Money! 🚀" /> -->
  <div class="w-full px-4 sm:px-6 lg:px-8">
    <div class="flex items-center justify-between h-16 w-full">
      <!-- Left: Logo and Drawer Toggle -->
      <div class="flex items-center gap-4">
        
        <a href="/" aria-label="Home" class="font-bold text-sm font-geist min-w-max"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#000000" viewBox="0 0 256 256"><path d="M16,69.21v120c91.64-44.77,132.36,42.35,224-2.42v-120C148.36,111.56,107.64,24.44,16,69.21ZM128,152a24,24,0,1,1,24-24A24,24,0,0,1,128,152Z" opacity="0.2"></path><path d="M244.24,60a8,8,0,0,0-7.75-.4c-42.93,21-73.59,11.16-106,.78-34-10.89-69.25-22.14-117.95,1.64A8,8,0,0,0,8,69.24V189.17a8,8,0,0,0,11.51,7.19c42.93-21,73.59-11.16,106.05-.78,19.24,6.15,38.84,12.42,61,12.42,17.09,0,35.73-3.72,56.91-14.06a8,8,0,0,0,4.49-7.18V66.83A8,8,0,0,0,244.24,60ZM232,181.67c-40.6,18.17-70.25,8.69-101.56-1.32-19.24-6.15-38.84-12.42-61-12.42a122,122,0,0,0-45.4,9V74.33c40.6-18.17,70.25-8.69,101.56,1.32S189.14,96,232,79.09ZM128,96a32,32,0,1,0,32,32A32,32,0,0,0,128,96Zm0,48a16,16,0,1,1,16-16A16,16,0,0,1,128,144ZM56,96v48a8,8,0,0,1-16,0V96a8,8,0,1,1,16,0Zm144,64V112a8,8,0,1,1,16,0v48a8,8,0,1,1-16,0Z"></path></svg></a>
        <button 
          aria-label="Toggle sidebar"
          on:click={toggleSidebar}
          class="text-gray-400 hover:text-black transition-colors ml-8"
          aria-expanded={$isSidebarOpen}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M9.35719 3H14.6428C15.7266 2.99999 16.6007 2.99998 17.3086 3.05782C18.0375 3.11737 18.6777 3.24318 19.27 3.54497C20.2108 4.02433 20.9757 4.78924 21.455 5.73005C21.7568 6.32234 21.8826 6.96253 21.9422 7.69138C22 8.39925 22 9.27339 22 10.3572V13.6428C22 14.7266 22 15.6008 21.9422 16.3086C21.8826 17.0375 21.7568 17.6777 21.455 18.27C20.9757 19.2108 20.2108 19.9757 19.27 20.455C18.6777 20.7568 18.0375 20.8826 17.3086 20.9422C16.6008 21 15.7266 21 14.6428 21H9.35717C8.27339 21 7.39925 21 6.69138 20.9422C5.96253 20.8826 5.32234 20.7568 4.73005 20.455C3.78924 19.9757 3.02433 19.2108 2.54497 18.27C2.24318 17.6777 2.11737 17.0375 2.05782 16.3086C1.99998 15.6007 1.99999 14.7266 2 13.6428V10.3572C1.99999 9.27341 1.99998 8.39926 2.05782 7.69138C2.11737 6.96253 2.24318 6.32234 2.54497 5.73005C3.02433 4.78924 3.78924 4.02433 4.73005 3.54497C5.32234 3.24318 5.96253 3.11737 6.69138 3.05782C7.39926 2.99998 8.27341 2.99999 9.35719 3ZM6.85424 5.05118C6.24907 5.10062 5.90138 5.19279 5.63803 5.32698C5.07354 5.6146 4.6146 6.07354 4.32698 6.63803C4.19279 6.90138 4.10062 7.24907 4.05118 7.85424C4.00078 8.47108 4 9.26339 4 10.4V13.6C4 14.7366 4.00078 15.5289 4.05118 16.1458C4.10062 16.7509 4.19279 17.0986 4.32698 17.362C4.6146 17.9265 5.07354 18.3854 5.63803 18.673C5.90138 18.8072 6.24907 18.8994 6.85424 18.9488C7.47108 18.9992 8.26339 19 9.4 19H14.6C15.7366 19 16.5289 18.9992 17.1458 18.9488C17.7509 18.8994 18.0986 18.8072 18.362 18.673C18.9265 18.3854 19.3854 17.9265 19.673 17.362C19.8072 17.0986 19.8994 16.7509 19.9488 16.1458C19.9992 15.5289 20 14.7366 20 13.6V10.4C20 9.26339 19.9992 8.47108 19.9488 7.85424C19.8994 7.24907 19.8072 6.90138 19.673 6.63803C19.3854 6.07354 18.9265 5.6146 18.362 5.32698C18.0986 5.19279 17.7509 5.10062 17.1458 5.05118C16.5289 5.00078 15.7366 5 14.6 5H9.4C8.26339 5 7.47108 5.00078 6.85424 5.05118ZM7 7C7.55229 7 8 7.44772 8 8V16C8 16.5523 7.55229 17 7 17C6.44772 17 6 16.5523 6 16V8C6 7.44772 6.44772 7 7 7Z" fill="currentColor"></path>
          </svg>
        </button>
      </div>
      
      <!-- Center: Search
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
      </div> -->
      
      <!-- Right: Login/Logout -->
      <div class="min-w-max">
        {#if $user}
          <button on:click={handleLogout} class="px-4 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition-colors">Logout</button>
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
