<script lang="ts">
  import { onMount } from 'svelte';
  
  let container: HTMLDivElement;
  let isVisible = false;
  let isNearBottom = false;
  
  const handleScroll = () => {
    const scrollPosition = window.scrollY;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    
    // Calculate scroll percentage
    const scrollPercent = (scrollPosition / (documentHeight - windowHeight)) * 100;
    
    // Show when near bottom (80% of scroll)
    isNearBottom = scrollPercent > 80;
    
    // Fade out when less than 60% of screen height
    isVisible = scrollPosition > windowHeight * 0.6;
  };
  
  onMount(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  });
</script>

<div 
  bind:this={container}
  class="fixed bottom-8 right-8 z-50 transition-opacity duration-300"
  class:opacity-0={!isVisible}
  class:opacity-100={isVisible}
  class:animate-bounce={isNearBottom}
>
  <button 
    class="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
    on:click={() => {
      window.scrollTo({ 
        top: document.documentElement.scrollHeight, 
        behavior: 'smooth' 
      });
    }}
  >
    <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
    Scroll to explore
  </button>
</div>
