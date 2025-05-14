<script lang="ts">
  import { writable } from 'svelte/store';
  export let message: string = 'This is an announcement!';
  const closed = writable(false);
</script>

{#if !$closed}
  <div class="w-full bg-gray-200 text-gray-800 px-4 py-0 flex justify-center items-center gap-4 text-xs font-medium">
    <span>{message}</span>
    <button
      class="ml-4 px-2 py-0 rounded hover:bg-gray-300 transition-colors text-lg font-bold"
      aria-label="Close announcement"
      on:click={() => closed.set(true)}
    >
      &times;
    </button>
  </div>
{/if}
