<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { supabase } from '$lib/supabaseClient';
  let email = "";
  let submitted = false;
  let error = "";
  let loading = false;

  async function subscribe() {
    error = "";
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      error = "Please enter a valid email address.";
      return;
    }
    loading = true;
    // Insert email into Supabase
    const { error: supabaseError } = await supabase
      .from('newsletter_signups')
      .insert([{ email }]);
    loading = false;
    if (supabaseError) {
      if (supabaseError.code === '23505' || (supabaseError.message && supabaseError.message.toLowerCase().includes('duplicate'))) {
        error = "You're already subscribed!";
      } else {
        error = "Something went wrong. Please try again.";
      }
      return;
    }
    submitted = true;
    email = "";
  }
</script>

<div class="w-full flex flex-col items-center justify-center py-32 mt-20">
  <h2 class="text-2xl md:text-3xl font-bold text-center mb-2">Never miss an update. Get new articles in your inbox.</h2>
  <p class="text-gray-500 text-center mb-6 text-base">Subscribe for updates as new money-making ideas are published.</p>
  {#if !submitted}
    <form class="flex flex-col md:flex-row items-center gap-3 w-full max-w-md" on:submit|preventDefault={subscribe}>
      <input
        class="rounded-full px-5 py-3 bg-gray-100 text-gray-700 placeholder-gray-400 text-base focus:outline-none w-full md:w-auto flex-1"
        type="email"
        placeholder="you@email.com"
        bind:value={email}
        autocomplete="email"
        required
      />
      <Button
        type="submit"
        variant="secondary"
        class="w-full md:w-auto rounded-full"
      >
        Subscribe
      </Button>
    </form>
    {#if error}
      <div class="text-red-500 text-sm mt-2">{error}</div>
    {/if}
  {:else}
    <div class="text-green-600 font-medium mt-4">Thank you for subscribing!</div>
  {/if}
</div>
