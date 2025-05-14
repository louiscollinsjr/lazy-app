<script lang="ts">
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabaseClient';
  import { session, user } from '$lib/stores/auth';

  let loading = true;
  let errorMsg = '';

  onMount(async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      errorMsg = error.message;
    } else {
      session.set(data.session);
      user.set(data.session?.user ?? null);
    }
    loading = false;
  });
</script>

<div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-2">
  <div class="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center border border-gray-100">
    <div class="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400"><rect x="3" y="5" width="18" height="14" rx="2"/><polyline points="3 7 12 13 21 7"/></svg>
    </div>
    <h1 class="text-xl font-semibold font-geist mb-2">Magic Link Sign-In</h1>
    <p class="text-gray-500 text-sm mb-6 text-center">A magic link is being processed. If successful, you'll be signed in automatically.<br />If not, please check your email and click the magic link.</p>
    {#if loading}
      <div class="w-full flex justify-center items-center py-3">
        <svg class="animate-spin h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
      </div>
    {:else if errorMsg}
      <div class="w-full bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-center mb-2 text-sm">{errorMsg}</div>
      <p class="text-gray-500 text-xs mt-2">If you believe this is a mistake, try requesting a new magic link or contact support.</p>
    {:else}
      <div class="w-full bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-center mb-2 text-sm">You're signed in! You can close this window.</div>
      <p class="text-gray-500 text-xs mt-2">You are now authenticated with a secure magic link.</p>
    {/if}
  </div>
</div>
