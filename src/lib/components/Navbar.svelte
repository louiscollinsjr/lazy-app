<script lang="ts">
  import { page } from '$app/stores';
  import { session, user } from '$lib/stores/auth';
  import { supabase } from '$lib/supabaseClient';
  import { Button } from '$lib/components/ui/button';
  import { goto } from '$app/navigation';

  async function handleLogout() {
    await supabase.auth.signOut();
    $session = null;
    $user = null;
    goto('/');
  }

</script>

<nav class="bg-gray-50 fixed w-full top-0 z-50">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex justify-between h-16 items-center">
      <a href="/" class="font-bold text-sm font-geist">**</a>
      <div>
        {#if $user}
          <Button variant="outline" size="sm" on:click={handleLogout} class="rounded-full">Logout</Button>
        {:else}
          <a href="/login">
            <Button class="rounded-full bg-gray-100 hover:bg-gray-100 border border-gray-100 hover:border-gray-200 text-black shadow-none px-4 py-1 text-[13px] font-medium tracking-wider">Log in or sign up</Button>
          </a>
        {/if}
      </div>
    </div>
  </div>
</nav>
<div class="h-16"></div>

