<script lang="ts">
  import { supabase } from '$lib/supabaseClient';
  import { Card, CardHeader, CardContent, CardFooter } from '$lib/components/ui/card';

  let email = '';
  let loading = false;
  let message = '';

  async function signInWithMagicLink() {
    loading = true;
    message = '';
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) {
      message = error.message;
    } else {
      message = 'A magic link has been sent to your email. Please check your inbox.';
    }
    loading = false;
  }
</script>


<div class="min-h-screen flex items-center justify-center bg-gray-50 px-2">
  <Card class="w-full max-w-md p-0 border border-gray-100 shadow-xl rounded-2xl">
    <form class="flex flex-col items-center p-8" on:submit|preventDefault={signInWithMagicLink} autocomplete="off">
      <CardHeader class="flex flex-col items-center w-full">
        <div class="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400"><rect x="3" y="5" width="18" height="14" rx="2"/><polyline points="3 7 12 13 21 7"/></svg>
        </div>
        <h1 class="text-2xl font-bold font-inter mb-6 tracking-wide">Sign in with Magic Link</h1>
        <p class="text-gray-500 text-sm mb-8 text-center">Enter your email address and we'll send you a magic link to sign in securely. No password needed.</p>
      </CardHeader>
      <CardContent class="w-full flex flex-col items-center">
        <label for="email" class="w-full text-left text-sm font-medium text-gray-700 mb-1">Email Address</label>
        <input
          id="email"
          class="w-full px-4 py-2 mb-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 bg-gray-50 text-sm"
          type="email"
          placeholder="your@email.com"
          bind:value={email}
          required
          autocomplete="email"
        />
        <p class="w-full text-xs text-gray-400 mb-12">A magic link will be sent to your email to complete the sign-in process.</p>
      </CardContent>
      <CardFooter class="w-full flex flex-col items-center">
        <button
          class="w-full py-2 rounded-lg font-medium text-sm bg-black text-white hover:bg-gray-900 transition-colors disabled:opacity-50"
          type="submit"
          disabled={loading}
        >
          {loading ? 'Sending…' : 'Continue With Email'}
        </button>
        {#if message}
          <div class="w-full bg-blue-50 border border-blue-200 text-blue-700 rounded-lg px-4 py-3 text-center mt-4 text-sm">{message}</div>
        {/if}
      </CardFooter>
    </form>
  </Card>
</div>
