
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { fade } from 'svelte/transition';

  let isVisible = true; // visible at top

  function handleScroll() {
    // Show only when near the top (less than 30% scrolled)
    const scrollPos = window.scrollY;
    const windowHeight = window.innerHeight;
    isVisible = scrollPos < windowHeight * 0.3;
  }

  onMount(() => {
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  });
</script>

{#if isVisible}
  <div class="flex items-center gap-2 text-gray-400 text-xs mb-4" style="user-select: none;" transition:fade>
    <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 16 16">
      <line x1="8" y1="3" x2="8" y2="11"/>
      <polyline points="4,9 8,13 12,9"/>
    </svg>
    <span>Scroll to explore</span>
  </div>
{/if}


<style>
  /* Initial fade-in animation */
  .animate-fade-in {
    animation: fadeIn 0.5s ease-in-out;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  /* Bounce animation */
  .animate-bounce {
    animation: bounce 1s infinite;
  }
  
  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }
</style>
